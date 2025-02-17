import axios from "axios";
import { HandleSearchWord, jsonToSQL, computeMD5 } from "../common/common.js";
import archiver from "archiver";
const { CLOUDFLARE_API_KEY, ACCOUNT_ID, KV_NAMESPACE_ID } = process.env;

async function cloudflareApi(method, url, body = {}) {
  try {
    const fullUrl = `https://api.cloudflare.com/client/v4${url}`;

    console.log(`🌍 Cloudflare API Request: ${method} ${fullUrl}`);

    const headers = {
      Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
      "Content-Type": "application/json",
    };

    // Axios does NOT allow a body for GET/HEAD requests
    const options = {
      method,
      url: fullUrl,
      headers,
      ...(method !== "GET" && method !== "HEAD" ? { data: body } : {}), // Only add body for POST, PUT, DELETE
    };

    const response = await axios(options);

    console.log(`📡 Response Status: ${response.status}`);

    return response.data;
  } catch (err) {
    console.log("====>", err.response.data.errors[0].message);
    if (err.response) {
      console.error(
        "❌ Cloudflare API Error:",
        err.response.status,
        err.response.data
      );
      console.log({ success: false, error: err.response.data });
      return { success: false, error: err.response.data };
    }
    console.error("❌ Request Error:", err.message);
    return { success: false, error: err.message };
  }
}

export const CreateDatabase = async (req, res) => {
  const logData = [];
  try {
    const name = await req.body.name;
    console.log("Extracted Name:", name);
    let dbId;

    try {
      const dbResponse = await cloudflareApi(
        "POST",
        `/accounts/${ACCOUNT_ID}/d1/database`,
        { name },
        req,
        res
      );
      dbId = dbResponse.result;
      console.log("205", dbId);
    } catch (err) {
      logData.push(err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to create database",
        errorDetails: err.message,
        logData,
      });
    }

    // Ensure dbId has a valid uuid before proceeding
    if (!dbId?.uuid) {
      return res
        .status(500)
        .json({ success: false, message: "Database ID is missing", dbId });
    }

    try {
      const kv = await cloudflareApi(
        "PUT",
        `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/db_uuid`,
        dbId.uuid
      );
      console.log(kv.result);
    } catch (kvErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to update KV storage",
        errorDetails: kvErr.message,
      });
    }

    res.json({ success: true, message: "Database created", dbId });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create database",
      errorDetails: error.message,
    });
  }
};

export const UploadJsonFileData = async (req, res) => {
  let logData = [];

  try {
    const db = await req.db;
    if (!req.files || req.files.length === 0) {
      logData.push("No files uploaded");
      return res.status(400).json({ message: "No files uploaded", logData });
    }

    for (const file of req.files) {
      let fileBuffer = await file.buffer;
      const fileExtension = await file.originalname.split(".").pop();

      if (fileExtension !== "sql") {
        const jsonData = await JSON.parse(fileBuffer.toString());
        const sqlData = await jsonToSQL(jsonData);
        fileBuffer = Buffer.from(sqlData, "utf-8");
      }

      const etag = computeMD5(fileBuffer);

      const initData = await requestUploadURL(etag, db);
      console.log("initData", initData);
      if (
        initData.success &&
        initData.type === "import" &&
        initData.status === "complete"
      ) {
        continue; // Move to the next file
      } else if (
        !initData.success &&
        initData.type === "import" &&
        initData.status === "error"
      ) {
        console.log("initData.message==>", initData.message);
        logData.push(initData.error);
        return res.status(400).json({ message: initData.error, logData });
      } else if (initData.success && initData.upload_url) {
        const uploadSQLFileres = await uploadSQLFile(
          initData.upload_url,
          fileBuffer
        );
        if (uploadSQLFileres) {
          const initData = await requestUploadURL(etag, db);
          console.log("initData", initData);
          if (
            initData.success &&
            initData.type === "import" &&
            initData.status === "complete"
          ) {
            continue; // Move to the next file
          } else if (
            !initData.success &&
            initData.type === "import" &&
            initData.status === "error"
          ) {
            console.log("initData.message==>", initData.message);
            logData.push(initData.error);
            return res.status(400).json({ message: initData.error, logData });
          } else {
            logData.push("Upload URL not found from api");
            return res
              .status(400)
              .json({ message: "Upload URL not found from api", logData });
          }
        }
      }
    }
    logData.push("All files imported successfully");
    return res
      .status(200)
      .json({ message: "All files imported successfully", logData });
  } catch (error) {
    console.error("Import process failed:", error); // Log the full error
    logData.push(error.message);
    return res.status(500).json({ message: "Database import failed", logData });
  }
};

export const ExportDatabaseJsonZip = async (req, res) => {
  const logData = [];
  try {
    const db = await req.db;

    // Fetch all table names
    const GetTables = await cloudflareApi(
      "POST",
      `/accounts/${ACCOUNT_ID}/d1/database/${db}/query`,
      {
        sql: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_KV' AND name NOT LIKE 'prefix%';",
      }
    );

    if (!GetTables.result || !GetTables.result[0].results.length) {
      return res
        .status(404)
        .json({
          message: GetTables.error.errors[0].message || "No Table Data Found",error:GetTables.error.errors[0].message || "No Table Data Found"
        });
    }
    const tables = await GetTables.result[0].results;
    // Prepare ZIP response headers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="database_json_backup.zip"`
    );
    res.setHeader("Content-Type", "application/zip");

    // Create ZIP archive
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    // Fetch data from each table and add to ZIP
    for (const table of tables) {
      const tableName = table.name;
      const rows = await cloudflareApi(
        "POST",
        `/accounts/${ACCOUNT_ID}/d1/database/${db}/query`,
        { sql: `SELECT * FROM ${tableName}` }
      );
      const rowsRes = { [tableName]: rows.result[0].results };
      // Convert table data to JSON
      const jsonData = JSON.stringify(rowsRes, null, 2);

      // Add JSON to ZIP
      archive.append(jsonData, { name: `${tableName}.json` });
    }

    // Finalize ZIP
    archive.finalize();
  } catch (error) {
    console.error("Export Error:", error);
    logData.push(error.message);
    res
      .status(500)
      .json({ message: "Export failed", error: error.message, logData });
  }
};

export const GetEqidDetails = async (req, res) => {
  const logData = [];
  try {
    const { selectedEQID } = req.body;
    console.log("selectedEQID", selectedEQID);
    const db = await req.db;
    if (!selectedEQID) {
      logData.push("selectedEQID is required in the request body.");
      return res.status(400).json({
        message: "selectedEQID is required in the request body.",
        logData,
      });
    }

    const query = `
        SELECT 
          s.EQID, EQType, MfgEQType, MfgProdLine, MfgProdNo, MfgDesc, 
          Manufacturer, Width, SlotsNeeded
        FROM Search s  
        LEFT JOIN Details d ON d.EQID = s.EQID  
        WHERE s.EQID = ?;
      `;

    const result = await cloudflareApi(
      "POST",
      `/accounts/${ACCOUNT_ID}/d1/database/${db}/query`,
      {
        sql: query,
        params: [selectedEQID],
      }
    );

    if (!result.result[0].results.length) {
      logData.push("No data found for the given EQID.");
      return res
        .status(404)
        .json({ message: "No data found for the given EQID.", logData });
    }

    res.status(200).json({
      message: "Fetch Selected EQID Details",
      result: result.result[0].results,
      logData,
    });
  } catch (err) {
    logData.push(err.message);
    console.error("Error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
      logData,
      logData,
    });
  }
};

export const GetRelatedEqidDetails = async (req, res) => {
  const logData = [];
  try {
    const { selectedEQID } = req.body;
    console.log("selectedEQID", selectedEQID);
    const db = await req.db;

    if (!selectedEQID) {
      logData.push("selectedEQID is required in the request body.");
      return res.status(400).json({
        message: "selectedEQID is required in the request body.",
        logData,
      });
    }

    const query = `
          SELECT 
              s.EQID, 
              s.EQType, 
              s.MfgEQType, 
              s.MfgProdLine, 
              s.MfgProdNo, 
              s.MfgDesc, 
              s.Manufacturer, 
              d.Width, 
              d.SlotsNeeded 
          FROM Search s  
          LEFT JOIN Details d 
              ON d.EQID = s.EQID  
          WHERE s.EQID IN (  
              SELECT json_extract(value, '$.EQIDRelation')
              FROM Details, json_each(Details.EQIDRelation)
              WHERE Details.EQID = ?
          );
      `;

    const result = await cloudflareApi(
      "POST",
      `/accounts/${ACCOUNT_ID}/d1/database/${db}/query`,
      {
        sql: query,
        params: [selectedEQID],
      }
    );

    if (!result.result[0].results.length) {
      logData.push("No related details found for the given EQID.");
      return res
        .status(404)
        .json({ message: "No related details found for the given EQID." });
    }

    res.status(200).json({
      message: "Fetch Related EQID Details",
      result: result.result[0].results,
      logData,
    });
  } catch (err) {
    logData.push(err.message);
    console.error("Error:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message, logData });
  }
};

// 🔹 Step 1: Request Upload URL
async function requestUploadURL(etag, db) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${db}/import`;
  const headers = {
    Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
    "Content-Type": "application/json",
  };

  const payload = { action: "init", etag: etag };

  try {
    const response = await axios.post(url, payload, { headers });
    console.log("requestUploadURL", response);
    if (response.data.result.success) {
      return response.data.result;
    } else {
      throw new Error(response.data.result.error);
    }
  } catch (error) {
    console.error(
      "Error getting upload URL:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// 🔹 Step 2: Upload SQL File to Cloudflare
async function uploadSQLFile(uploadUrl, fileBuffer) {
  try {
    const response = await axios.put(uploadUrl, fileBuffer, {
      headers: { "Content-Type": "application/sql" },
    });
    console.log("uploadSQLFile", response);
    if (response.status == 200) {
      return true;
    } else {
      throw new Error("Failed to upload SQL file.");
    }
  } catch (error) {
    console.error(
      "Error uploading SQL file:",
      error.response?.data || error.message
    );
    throw error;
  }
}

export const ImportSqlDb = async (req, res) => {
  const logData = [];
  try {
    const db = await req.db;
    if (!req.file) {
      logData.push("No file uploaded");
      return res.status(400).json({ message: "No file uploaded", logData });
    }

    const fileBuffer = req.file.buffer;
    const etag = computeMD5(fileBuffer);

    const initData = await requestUploadURL(etag, db);
    console.log("initData", initData);
    if (
      initData.success == true &&
      initData.type == "import" &&
      initData.status == "complete"
    ) {
      logData.push("Database Imported Successfully");
      return res
        .status(200)
        .json({ message: "Database Imported Successfully", logData });
    } else if (
      !initData.success &&
      initData.type == "import" &&
      status == "error"
    ) {
      logData.push(initData.error);
      console.log("initData.message", initData.message);
      return res.status(400).json({ message: initData.error, logData });
    } else if (initData.success && initData.upload_url) {
      const uploadSQLFileres = await uploadSQLFile(
        initData.upload_url,
        fileBuffer
      );
      console.log();
      if (uploadSQLFileres == true) {
        const initData = await requestUploadURL(etag, db);
        console.log("initData", initData);
        if (
          initData.success == true &&
          initData.type == "import" &&
          initData.status == "complete"
        ) {
          logData.push("Database Imported Successfully");
          return res
            .status(200)
            .json({ message: "Database Imported Successfully", logData });
        } else if (
          !initData.success &&
          initData.type == "import" &&
          status == "error"
        ) {
          console.log("initData.message", initData.message);
          logData.push(initData.error);
          return res.status(400).json({ message: initData.error, logData });
        } else {
          logData.push("Upload URL not found from api");
          res
            .status(400)
            .json({ message: "Upload URL not found from api", logData });
        }
      }
    }
  } catch (error) {
    console.error("Import process failed:", error); // Log the full error
    logData.push(error.message);
    return res.status(500).json({
      message: "Database import failed",
      error: error.message,
      logData,
    });
  }
};

export const RemoveDatabase = async (req, res) => {
  const logData = [];
  try {
    const dbuuid = await req.db;
    console.log("DB UUID:", dbuuid);

    const dbResponse = await cloudflareApi(
      "DELETE",
      `/accounts/${ACCOUNT_ID}/d1/database/${dbuuid}`
    );

    if (!dbResponse.success) {
      const err =
        (await dbResponse?.error?.errors[0]?.message) || "Server Error";
      logData.push(err);
      return res.status(500).json({
        success: false,
        message: err,
        errorDetails: err,
        logData,
      });
    }
    logData.push("Database Removed successfully");
    res.json({
      success: true,
      message: "Database Removed successfully",
      dbId: dbuuid,
      logData,
    });
  } catch (error) {
    logData.push(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to Remove database",
      errorDetails: error.message,
      logData,
    });
  }
};

export const ClearDatabase = async (req, res) => {
  const logData = [];
  try {
    const dbuuid = await req.db;
    console.log("DB UUID:", dbuuid);

    // Get all tables in the database
    const tablesResponse = await cloudflareApi(
      "POST",
      `/accounts/${ACCOUNT_ID}/d1/database/${dbuuid}/query`,
      {
        sql: `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`,
      }
    );

    if (!tablesResponse.success) {
      logData.push(tablesResponse?.error?.errors[0]?.message || "Server Error");
      console.log("ERROR==>", tablesResponse);
      return res.status(500).json({
        success: false,
        message: tablesResponse?.error?.errors[0]?.message || "Server Error",
        errorDetails:
          tablesResponse?.error?.errors[0]?.message || "Server Error",
        logData,
      });
    } else {
      const tables = await tablesResponse.result[0].results.map(
        (row) => row.name
      );

      if (tables.length === 0) {
        logData.push("No tables found to clear");
        return res.json({
          success: true,
          message: "No tables found to clear",
          logData,
        });
      }

      // Clear all tables (TRUNCATE equivalent in SQLite)
      for (const table of tables) {
        await cloudflareApi(
          "POST",
          `/accounts/${ACCOUNT_ID}/d1/database/${dbuuid}/query`,
          { sql: `DELETE FROM ${table}` }
        );
      }
      logData.push("All table data cleared successfully");
      res.json({
        success: true,
        message: "All table data cleared successfully",
        dbId: dbuuid,
        logData,
      });
    }
  } catch (error) {
    logData.push(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to clear tables",
      errorDetails: error.message,
      logData,
    });
  }
};

async function requestExportURL(db) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${db}/export`;
  const headers = {
    Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
    "Content-Type": "application/json",
  };

  const payload = { action: "init" };

  try {
    console.log("url", url);
    const response = await axios.post(url, payload, { headers });
    console.log("response", response.data);
    if (response.data.success) {
      return response.data.result.signed_url;
    } else {
      throw new Error(response.data);
    }
  } catch (error) {
    console.error("Error getting export URL:", error || error.message);
    throw error;
  }
}

export const ExportDbSql = async (req, res) => {
  const logData = [];
  try {
    const db = await req.db;
    console.log("🔹 Requesting Export URL...");
    const exportUrl = await requestExportURL(db);
    if (!exportUrl.data.success) {
      console.log("exportUrl?.data?.errors[0]", exportUrl?.data?.errors[0]);
      res
        .status(500)
        .json({
          message: exportUrl?.data?.errors[0]?.message || "Server Error",
        });
    }
    console.log("✅ Export URL Received:", exportUrl);

    console.log("🔹 Streaming SQL File...");
    const response = await axios.get(exportUrl, { responseType: "stream" });

    // Set response headers for direct download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${db}_export.sql"`
    );
    res.setHeader("Content-Type", "application/sql");

    // Stream response data directly to the client
    response.data.pipe(res);
    logData.push("SQL File Streamed Successfully");
    console.log("✅ SQL File Streamed Successfully");
  } catch (error) {
    logData.push(error.message);
    console.log("Error streaming SQL file:", error.response);
    console.log("Error streaming SQL file:", error);
    logData.push(error?.response?.data?.errors[0]?.message || "Server Error");
    return res.status(500).json({
      message: error?.response?.data?.errors[0]?.message || "Server Error",
      error: error?.response?.data?.errors[0]?.message || "Server Error",
      logData,
    });
  }
};

export const ManufacturerSearch = async (req, res) => {
  const logData = [];

  try {
    const db = await req.db;
    const { search, condition } = req.body || {};
    const queryCondition = condition === "AND" ? "AND" : "OR"; // Default to OR if condition is invalid

    if (!search) {
      // Fetch all manufacturers if no search term is provided
      const sqlQuery =
        "SELECT DISTINCT Manufacturer FROM search ORDER BY Manufacturer ASC";
      console.log("Without Search Query ==>", sqlQuery);

      try {
        const response = await cloudflareApi(
          "POST",
          `/accounts/${ACCOUNT_ID}/d1/database/${db}/query`,
          {
            sql: sqlQuery,
          }
        );
        console.log("sqlQuery111 ==>", sqlQuery);
        console.log("sql result ==>", response);
        if (response.result && response.result[0].results.length !== 0) {
          const manufacturers = await response.result[0].results.map(
            (row) => row.Manufacturer
          );
          logData.push("Manufacturers found");
          return res.status(200).json({
            manufacturers,
            totalManufacturer: manufacturers.length,
            logData,
          });
        } else {
          return res
            .status(404)
            .json({
              error: response?.error?.errors[0]?.message || "Server Error",
            });
        }
      } catch (err) {
        logData.push(err.message);

        console.log("manufacturere error++>", err);
        return res.status(400).json({
          error: err?.message || "Server Error",
          message: `Error fetching manufacturers:${err.message}`,
          logData,
        });
      }
    }

    // Process search keywords
    const words = search.split(/\s+/).filter(Boolean); // Splitting search input into words
    console.log("Keywords:", words);

    const queryStrategies = [
      (word) => `${word}%`, // Starts with word
      (word) => `%${word}`, // Ends with word
      (word) => `%${word}%`, // Contains word
    ];

    let manufacturers = [];

    // Apply query strategies sequentially
    for (const strategy of queryStrategies) {
      // Build SQL condition for all words using the current strategy
      const sqlConditions = words.map(
        (word) => `
            (EQID LIKE '${strategy(word)}' OR 
             MfgAcronym LIKE '${strategy(word)}' OR 
             EQType LIKE '${strategy(word)}' OR 
             MfgEQType LIKE '${strategy(word)}' OR 
             MfgProdLine LIKE '${strategy(word)}' OR 
             MfgProdNo LIKE '${strategy(word)}' OR 
             MfgDesc LIKE '${strategy(word)}' OR 
             Manufacturer LIKE '${strategy(word)}')`
      );

      // Combine conditions with the specified condition (AND/OR)
      const sqlCondition = sqlConditions.join(` ${queryCondition} `);
      const sqlQuery = `SELECT DISTINCT Manufacturer FROM search WHERE ${sqlCondition} ORDER BY Manufacturer ASC`;
      console.log("SQL Query:", sqlQuery);

      try {
        const response = await cloudflareApi(
          "POST",
          `/accounts/${ACCOUNT_ID}/d1/database/${db}/query`,
          {
            sql: sqlQuery,
          }
        );
        console.log("sqlQuery", sqlQuery);
        if (response.result && response.result[0].results.length !== 0) {
          manufacturers = await response.result[0].results.map(
            (row) => row.Manufacturer
          );
          break;
        }
      } catch (err) {
        logData.push(err.message);
        return res
          .status(400)
          .json({ message: err.message, error: err.message, logData });
      }
    }

    return res.status(200).json({
      manufacturers,
      totalManufacturer: manufacturers.length,
      logData,
    });
  } catch (error) {
    logData.push(error.message);
    console.error("Error:", error.stack || error.message || error);
    return res.status(500).json({
      message: `Error: ${error.message}`,
      error: error.message,
      logData,
    });
  }
};

export const EquipmentSearch = async (req, res) => {
  const logData = [];
  try {
    const db =await req.db;
    const { Manufacturer, keywords, condition, isRelated } = req.body || {};
    console.log("Request Body equipment:", {
      Manufacturer,
      keywords,
      condition,
      isRelated,
    });

    if (!Manufacturer) {
      logData.push("Manufacturer is required in the request body.");
      return res.status(400).json({
        message: "Manufacturer is required in the request body.",
        logData,
      });
    }

    let manufacturers = [Manufacturer];
    const validCondition = condition === "AND" ? "AND" : "OR";

    // Fetch related manufacturers if `isRelated` is true
    if (isRelated) {
      const relatedQuery = `SELECT DISTINCT RelatedManufacturer FROM Related WHERE Manufacturer = '${Manufacturer}'`;
      console.log("Related Query:", relatedQuery);

      try {
        const relatedResponse = await cloudflareApi(
          "POST",
          `/accounts/${ACCOUNT_ID}/d1/database/${db}/query`,
          {
            sql: relatedQuery,
          }
        );
        console.log("relatedResponse", relatedResponse.result);
        if (relatedResponse.result[0].results.length > 0) {
          manufacturers.push(
            ...relatedResponse.result[0].results.map(
              (row) => row.RelatedManufacturer
            )
          );
        }
      } catch (err) {
        logData.push(err.message);
        return res.status(400).json({
          error: `Error fetching related manufacturers: ${err.message}`,
          message: err.message,
          logData,
        });
      }
    }

    // If no keywords, fetch equipment by Manufacturer and related manufacturers
    if (!keywords || keywords.trim() === "") {
      const sqlQueryWithoutSearch = `
          SELECT DISTINCT EQType, MfgProdLine, MfgProdNo
          FROM Search
          WHERE Manufacturer IN (${manufacturers
            .map((m) => `'${m}'`)
            .join(",")})
          ORDER BY EQType ASC`;

      console.log("SQL Query without keywords:", sqlQueryWithoutSearch);

      try {
        const response = await cloudflareApi(
          "POST",
          `/accounts/${ACCOUNT_ID}/d1/database/${db}/query`,
          {
            sql: sqlQueryWithoutSearch,
          }
        );
        console.log(response.result[0].results);
        return res.json(
          response.result[0].results.length
            ? response.result[0].results
            : { message: "No related equipment found." }
        );
      } catch (err) {
        return res.status(400).json({ error: err.message, logData });
      }
    }

    // Handle keyword-based search
    const words = keywords.split(/\s+/).filter(Boolean);
    console.log("Keywords:", words);

    const queryStrategies = [
      (word) => `${word}%`,
      (word) => `%${word}`,
      (word) => `%${word}%`,
    ];

    let results = [];

    for (const strategy of queryStrategies) {
      const sqlConditions = words.map(
        (word) => `
            (EQID LIKE '${strategy(word)}' OR 
             MfgAcronym LIKE '${strategy(word)}' OR 
             EQType LIKE '${strategy(word)}' OR 
             MfgEQType LIKE '${strategy(word)}' OR 
             MfgProdLine LIKE '${strategy(word)}' OR 
             MfgProdNo LIKE '${strategy(word)}' OR 
             MfgDesc LIKE '${strategy(word)}' OR 
             Manufacturer LIKE '${strategy(word)}')`
      );

      const sqlCondition = sqlConditions.join(` ${validCondition} `);
      const sqlQueryWithKeywords = `
          SELECT DISTINCT EQType, MfgProdLine, MfgProdNo
          FROM Search
          WHERE Manufacturer IN (${manufacturers
            .map((m) => `'${m}'`)
            .join(",")})
          AND (${sqlCondition})
          ORDER BY EQType ASC`;

      console.log("SQL Query with Keywords:", sqlQueryWithKeywords);

      try {
        const response = await cloudflareApi(
          "POST",
          `/accounts/${ACCOUNT_ID}/d1/database/${db}/query`,
          {
            sql: sqlQueryWithKeywords,
          }
        );

        if (response.result[0].results.length > 0) {
          return res.json(response.result[0].results);
        }
      } catch (err) {
        logData.push(err.message);
        return res.status(400).json({ error: err.message, logData });
      }
    }
    logData.push(
      "No related equipment found for the given Manufacturer and keywords."
    );
    return res.json({
      message:
        "No related equipment found for the given Manufacturer and keywords.",
      logData,
    });
  } catch (error) {
    logData.push(error.message);
    console.error("Error:", error.stack || error.message || error);
    return res
      .status(500)
      .json({ error: "Server error. Check logs for details.", logData });
  }
};

export const SelectedManufacturer = async (req, res) => {
  const logData = [];
  try {
    const db = await req.db;
    const {
      selectedManufacturer = "",
      selectedEquipmentType = "",
      selectedProductLine = "",
      selectedProductNumber = "",
      keywords = "",
      condition = "OR",
      isRelated = false,
      filterAttribute,
    } = req.body;

    if (!selectedManufacturer) {
      logData.push("Manufacturer is required in the request body.");
      return res
        .status(400)
        .json({ error: "Manufacturer is required in the request body." });
    }

    let manufacturers = [selectedManufacturer];

    // Fetch related manufacturers if `isRelated` is true
    if (isRelated) {
      try {
        const relatedQuery = `SELECT RelatedManufacturer FROM Related WHERE Manufacturer = ?`;
        const relatedManufacturers = await cloudflareApi(
          "POST",
          `/accounts/${ACCOUNT_ID}/d1/database/${db}/query`,
          {
            sql: relatedQuery,
            params: [selectedManufacturer],
          }
        );

        if (relatedManufacturers.result[0].results.length > 0) {
          manufacturers.push(
            ...relatedManufacturers.result[0].results.map(
              (row) => row.RelatedManufacturer
            )
          );
        }
      } catch (err) {
        logData.push(`Error fetching related manufacturers: ${err.message}`);
        return res.status(400).json({
          error: `Error fetching related manufacturers: ${err.message}`,
          logData,
        });
      }
    }

    let sqlQuery = `
                SELECT DISTINCT EQID, Manufacturer, EQType, MfgProdLine, MfgProdNo
                FROM Search
                WHERE Manufacturer IN (${manufacturers
                  .map(() => "?")
                  .join(",")})
            `;
    const queryParams = [...manufacturers];

    if (selectedEquipmentType) {
      sqlQuery += ` AND EQType = ?`;
      queryParams.push(selectedEquipmentType);
    }
    if (selectedProductLine) {
      sqlQuery += ` AND MfgProdLine = ?`;
      queryParams.push(selectedProductLine);
    }
    if (selectedProductNumber) {
      sqlQuery += ` AND MfgProdNo = ?`;
      queryParams.push(selectedProductNumber);
    }
    if (filterAttribute != 0) {
      sqlQuery += ` AND attrib = ?`;
      queryParams.push(filterAttribute);
    }

    let results = [];

    if (keywords.trim()) {
      const words = await HandleSearchWord(keywords);

      const queryStrategies = [
        (word) => `${word}%`,
        (word) => `%${word}`,
        (word) => `%${word}%`,
      ];

      for (const strategy of queryStrategies) {
        const keywordConditions = words.map(
          () => `
                        (EQID LIKE ? OR Manufacturer LIKE ? OR 
                        MfgAcronym LIKE ? OR MfgEQType LIKE ? OR 
                        EQType LIKE ? OR MfgProdLine LIKE ? OR 
                        MfgProdNo LIKE ? OR MfgDesc LIKE ?)
                    `
        );
        const combinedConditions = keywordConditions.join(` ${condition} `);
        const fullQuery = `${sqlQuery} AND (${combinedConditions})`;

        const keywordParams = words.flatMap((word) => [
          strategy(word),
          strategy(word),
          strategy(word),
          strategy(word),
          strategy(word),
          strategy(word),
          strategy(word),
          strategy(word),
        ]);

        try {
          const response = await cloudflareApi(
            "POST",
            `/accounts/${ACCOUNT_ID}/d1/database/${db}/query`,
            {
              sql: fullQuery,
              params: [...queryParams, ...keywordParams],
            }
          );

          results = response.result[0].results;
          if (results.length > 0) {
            return res.status(200).json( results);
          }
          return res.status(200).json( results);
        } catch (err) {
          logData.push(err.message);
          return res.status(400).json({ error: err.message, logData });
        }
      }
    }

    // Final query execution if no keyword-based results found
    if (!keywords) {
      try {
        const response = await cloudflareApi(
          "POST",
          `/accounts/${ACCOUNT_ID}/d1/database/${db}/query`,
          {
            sql: sqlQuery,
            params: queryParams,
          }
        );

        results = response.result[0].results;
        return res.status(200).json(results);
      } catch (err) {
        logData.push(err.message);
        return res.status(400).json({ message: err.message, logData });
      }
    }
  } catch (error) {
    console.error("Error details:", error.stack || error.message || error);
    console.log(error);
    logData.push(error.message);
    return res
      .status(500)
      .json({ error: "Server error. Check logs for details.", logData });
  }
};
