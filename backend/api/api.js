import { formatedDate, HandleSearchWord } from "../common/common.js";
import archiver from "archiver";
import AdmZip from "adm-zip";

import db from "../DB/DB.js";

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export const UploadTables = async (req, res, next) => {
  let logData = [];
  let insertedCount = 0;
  let updatedCount = 0;
  try {
    const { tableName } = req.body;
    const files = req.files;

    if (!files || files.length === 0 || !tableName) {
      throw new Error("No files or table name provided.");
    }

    if (!/^[a-zA-Z_][a-zAZ0-9_]*$/.test(tableName)) {
      throw new Error("Invalid table name.");
    }

    // **Check if table exists & Get columns**
    const tableInfoQuery = `PRAGMA table_info(${tableName});`;
    const tableInfo = await new Promise((resolve, reject) => {
      db.all(tableInfoQuery, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (tableInfo.length === 0) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }

    // **Find Primary Key Column**
    let primaryKey = null;
    const primaryKeyColumn = tableInfo.find((col) => col.pk === 1);
    if (primaryKeyColumn) {
      primaryKey = primaryKeyColumn.name;
    }

    // **Get Column Names from Table**
    const existingColumns = tableInfo.map((col) => col.name);
    console.log(`Existing Columns in ${tableName}:`, existingColumns);

    for (const file of files) {
      let jsonData;
      try {
        jsonData = JSON.parse(file.buffer.toString().replace(/^\uFEFF/, ""));
      } catch (err) {
        throw new Error(`Invalid JSON in file ${file.originalname}`);
      }

      // **Find the key that contains an array**
      const dynamicKey = Object.keys(jsonData).find((key) =>
        Array.isArray(jsonData[key])
      );

      if (!dynamicKey || !jsonData[dynamicKey].length) {
        throw new Error(`Invalid JSON structure in file ${file.originalname}`);
      }

      const records = jsonData[dynamicKey];

      // **If table has a primary key, ensure it's in JSON data**
      if (primaryKey && !records[0].hasOwnProperty(primaryKey)) {
        throw new Error(
          `'${primaryKey}' key is required in file ${file.originalname}.`
        );
      }

      // **Prepare Insert Query**
      const insertColumns = existingColumns.join(", ");
      const placeholders = existingColumns.map(() => "?").join(", ");
      let insertSQL;

      // **For tables without primary key (e.g., "Realted"), just insert**
      insertSQL = `
          INSERT OR REPLACE INTO ${tableName} (${insertColumns})
          VALUES (${placeholders});
        `;

      console.log("insertSQL", insertSQL);
      // **Insert in Batches**
      const batchSize = 200;
      let startIndex = 0;

      db.serialize(async () => {
        db.run("BEGIN TRANSACTION");
        const stmt = db.prepare(insertSQL);

        while (startIndex < records.length) {
          const batch = records.slice(startIndex, startIndex + batchSize);

          for (const record of batch) {
            const values = existingColumns.map((col) =>
              record.hasOwnProperty(col) ? record[col] : null
            );
            stmt.run(values, function (err) {
              if (err) {
                logData.push(`Error inserting record: ${err.message}`);
                console.error(`Error inserting record: ${err.message}`);
              } else {
                console.log(stmt);
                if (this.changes === 1) {
                  insertedCount++; // Record was inserted
                } else if (this.changes > 1) {
                  updatedCount++; // Record was updated
                }
              }
            });
          }

          logData.push(
            `Inserted ${batch.length} records from ${file.originalname}`
          );
          startIndex += batchSize;
        }

        stmt.finalize();
        db.run("COMMIT");
      });
    }

    res.json({ message: "All files uploaded successfully.", logData });
  } catch (err) {
    next(err);
  }
};

export const GetAllTables = async (req, res) => {
  try {
    const tables = await runQuery(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    );
    res.json({ tables });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to retrieve table names",
        details: error.message,
      });
  }
};

export const Manufacturer = async (req, res) => {
  try {
    const { search, condition } = req.body || {};
    const queryCondition = condition === "AND" ? "AND" : "OR"; // Ensure valid condition

    if (!search) {
      const sqlQuery = `SELECT DISTINCT Manufacturer FROM Search ORDER BY Manufacturer ASC`;
      console.log("Without Search Query ==>", sqlQuery);

      try {
        const results = await runQuery(sqlQuery);
        if (results.length !== 0) {
          const manufacturers = results.map((row) => row.Manufacturer);
          return res.json({
            manufacturers,
            totalManufacturer: manufacturers.length,
          });
        }
     
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    // Split keywords and process search
    const words = await HandleSearchWord(search);
    console.log("Keywords:", words);

    const queryStrategies = [
      (word) => `${word}%`, // `%word`
      (word) => `%${word}`, // `word%`
      (word) => `%${word}%`, // `%word%`
    ];

    let manufacturers = [];

    // Apply query strategies sequentially
    for (const strategy of queryStrategies) {
      // Build the SQL condition for all words using the current strategy
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
      const sqlQuery = `SELECT DISTINCT Manufacturer FROM Search WHERE ${sqlCondition} ORDER BY Manufacturer ASC`;
      console.log("SQL Query:", sqlQuery);

      try {
        const results = await runQuery(sqlQuery);
        if (results.length > 0) {
          manufacturers = results.map((row) => row.Manufacturer);
          break;
        }
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    return res.json({ manufacturers, totalManufacturer: manufacturers.length });
  } catch (error) {
    console.error("Error:", error.stack || error.message || error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const EquipmentType = async (req, res) => {
  try {
    const { Manufacturer, keywords, condition, isRelated } = req.body || {};
    console.log("Request Body equipment:", {
      Manufacturer,
      keywords,
      condition,
      isRelated,
    });

    if (!Manufacturer) {
      return res
        .status(400)
        .json({ error: "Manufacturer is required in the request body." });
    }

    let results = [];
    const validCondition = condition === "AND" ? "AND" : "OR";

    let manufacturers = [Manufacturer];

    // Fetch related manufacturers if `isRelated` is true
    if (isRelated) {
      try {
        const relatedQuery = `SELECT DISTINCT RelatedManufacturer FROM Related WHERE Manufacturer = ?`;
        const relatedManufacturers = await runQuery(relatedQuery, [
          Manufacturer,
        ]);

        if (relatedManufacturers.length > 0) {
          manufacturers.push(
            ...relatedManufacturers.map((row) => row.RelatedManufacturer)
          );
        }
      } catch (err) {
        return res
          .status(400)
          .json({
            error: `Error fetching related manufacturers: ${err.message}`,
          });
      }
    }

    // If no keywords, fetch equipment by Manufacturer and related manufacturers
    if (!keywords || keywords.trim() === "") {
      const sqlQueryWithoutSearch = `
          SELECT DISTINCT EQType, MfgProdLine, MfgProdNo
          FROM Search
          WHERE Manufacturer IN (${manufacturers.map(() => "?").join(",")})
          ORDER BY EQType ASC`;

      console.log("SQL Query without keywords:", sqlQueryWithoutSearch);

      try {
        results = await runQuery(sqlQueryWithoutSearch, manufacturers);
        return res.json(
          results.length ? results : { message: "No related equipment found." }
        );
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    // Handle keyword-based search
    const words = await HandleSearchWord(keywords);
    console.log("Keywords:", words);

    const queryStrategies = [
      (word) => `${word}%`,
      (word) => `%${word}`,
      (word) => `%${word}%`,
    ];

    // Apply query strategies sequentially
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
          WHERE Manufacturer IN (${manufacturers.map(() => "?").join(",")})
          AND (${sqlCondition})
          ORDER BY EQType ASC`;

      console.log("SQL Query with Keywords:", sqlQueryWithKeywords);

      try {
        results = await runQuery(sqlQueryWithKeywords, manufacturers);
        if (results.length > 0) return res.json(results);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    return res.json({
      message:
        "No related equipment found for the given Manufacturer and keywords.",
    });
  } catch (error) {
    console.error("Error:", error.stack || error.message || error);
    return res
      .status(500)
      .json({ error: "Server error. Check logs for details." });
  }
};

export const Selected_Manufacturer = async (req, res) => {
  try {
    const body = req.body;
    const selectedManufacturer = String(body.selectedManufacturer || "");
    const selectedEquipmentType = String(body.selectedEquipmentType || "");
    const selectedProductLine = String(body.selectedProductLine || "");
    const selectedProductNumber = String(body.selectedProductNumber || "");
    const keywords = String(body.keywords || "").trim();
    const condition = body.condition === "AND" ? "AND" : "OR"; // Ensure valid condition
    const isRelated = body.isRelated === true; // Check if related search is enabled
    const attribute = body.filterAttribute;

    if (!selectedManufacturer) {
      return res
        .status(400)
        .json({ error: "Manufacturer is required in the request body." });
    }

    let manufacturers = [selectedManufacturer];

    // Fetch related manufacturers if related flag is true
    if (isRelated) {
      try {
        const relatedQuery = `SELECT RelatedManufacturer FROM Related WHERE Manufacturer = ?`;
        const relatedManufacturers = await runQuery(relatedQuery, [
          selectedManufacturer,
        ]);
        console.log("relatedManufacturers", relatedManufacturers);
        if (relatedManufacturers.length > 0) {
          manufacturers.push(
            ...relatedManufacturers.map((row) => row.RelatedManufacturer)
          ); // Ensure correct column name
        }
      } catch (err) {
        return res
          .status(400)
          .json({
            error: `Error fetching related manufacturers: ${err.message}`,
          });
      }
    }

    let sqlQuery = `
        SELECT DISTINCT 
          EQID, Manufacturer, EQType, MfgProdLine, MfgProdNo
        FROM Search
        WHERE Manufacturer IN (${manufacturers.map(() => "?").join(",")})
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
    if (attribute != 0) {
      sqlQuery += ` AND attrib = ?`;
      queryParams.push(attribute);
    }

    let results = [];

    // Apply keyword search logic
    if (keywords !== "") {
      const words = await HandleSearchWord(keywords);
      console.log("Keywords:", words);

      const queryStrategies = [
        (word) => `${word}%`,
        (word) => `%${word}`,
        (word) => `%${word}%`,
      ];

      for (const strategy of queryStrategies) {
        const keywordConditions = words.map(
          (word) => `
              (EQID LIKE ? OR
              Manufacturer LIKE ? OR 
              MfgAcronym LIKE ? OR
              MfgEQType LIKE ? OR 
              EQType LIKE ? OR
              MfgProdLine LIKE ? OR 
              MfgProdNo LIKE ? OR 
              MfgDesc LIKE ?)
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

        console.log("Executing SQL Query with strategy:", fullQuery);
        console.log("With Parameters:", [...queryParams, ...keywordParams]);

        try {
          results = await runQuery(fullQuery, [
            ...queryParams,
            ...keywordParams,
          ]);
          if (results.length > 0) {
            return res.status(200).json(results);
          }
          return res.status(200).json(results);
        } catch (err) {
          return res.status(400).json({ error: err.message });
        }
      }
    }

    // Execute final query if no keyword-based results were found
    if (!keywords) {
      try {
        console.log(sqlQuery, "*********************sqlquery");

        results = await runQuery(sqlQuery, queryParams);
        return res.status(200).json(results);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }
  } catch (error) {
    console.error("Error details:", error.stack || error.message || error);
    return res.status(500).json({ error: error.message });
  }
};

export const GetDetails = (req, res) => {
  const logData = [];
  try {
    const { selectedEQID } = req.body;

    if (!selectedEQID) {
      logData.push("selectedEQID is required in the request body.");
      return res
        .status(400)
        .json({ message: "selectedEQID is required in the request body." });
    }

    const query = `
      SELECT 
        s.EQID, EQType, MfgEQType, MfgProdLine, MfgProdNo, MfgDesc, 
        Manufacturer, Width, SlotsNeeded
      FROM Search s  
      LEFT JOIN Details d ON d.EQID = s.EQID  
      WHERE s.EQID = ?;
    `;

    db.get(query, [selectedEQID], (err, row) => {
      if (err) {
        logData.push(err.message);
        console.error("Database error:", err.message);
        return res
          .status(500)
          .json({ message: "Database error", error: err.message });
      }
      if (!row) {
        return res
          .status(404)
          .json({ message: "No data found for the given EQID." });
      }
      res
        .status(200)
        .json({ message: "fetch Selected EQID Details", row, logData });
    });
  } catch (err) {
    logData.push(err.message);
    res.status(500).json({ message: err.message });
    console.log(err);
  }
};

export const GetRelatedDetails = async (req, res) => {
  const { selectedEQID } = req.body;
  const logData = [];

  if (!selectedEQID) {
    return res
      .status(400)
      .json({ message: "selectedEQID is required in the request body." });
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

  try {
    db.all(query, [selectedEQID], (err, rows) => {
      if (err) {
        logData.push(`Database error: ${err.message}`);
        console.error("Database error:", err.message);
        return res
          .status(500)
          .json({ message: "Database error", error: err.message, logData });
      }

      res.json({ relatedDetails: rows, logData });
    });
  } catch (error) {
    logData.push(`Unexpected error: ${error.message}`);
    console.error("Unexpected error:", error.message);
    res
      .status(500)
      .json({
        message: "Internal Server Error",
        error: error.message,
        logData,
      });
  }
};

export const ExportDataBase = async (req, res) => {
  const logData = [];

  try {
    // Get all table names
    const tables = await new Promise((resolve, reject) => {
      db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        [],
        (err, rows) => {
          if (err) {
            logData.push(` ${err.message}`);
            reject(err);
          } else resolve(rows.map((table) => table.name));
        }
      );
    });
    const date = await formatedDate();
    // Set response headers for ZIP file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="database_backup_${date}.zip"`
    );
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res); // ✅ Stream ZIP directly to response

    // Fetch table data and add to ZIP
    await Promise.all(
      tables.map((table) => {
        return new Promise((resolve, reject) => {
          db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
            if (err) {
              logData.push(` ${err.message}`);
              return reject(err);
            }

            const jsonData = { [table]: rows }; // ✅ Table name as key
            archive.append(JSON.stringify(jsonData, null, 2), {
              name: `${table}.json`,
            }); // ✅ Add JSON directly to ZIP

            resolve();
          });
        });
      })
    );

    archive.finalize(); // ✅ Finalize ZIP after adding all JSON files
  } catch (error) {
    console.error("Export error:", error);
    logData.push(`Export error: ${err.message}`);
    res.status(500).json({ message: err.message, logData });
  }
};

export const ImportDataBase = async (req, res) => {
  const logData = [];
  console.log(req.file);

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read ZIP file from memory
    const zip = new AdmZip(req.file.buffer);
    console.log(zip);
    const zipEntries = zip.getEntries();
    const jsonFiles = zipEntries.filter((entry) =>
      entry.entryName.endsWith(".json")
    );

    if (jsonFiles.length === 0) {
      logData.push("No JSON files found in ZIP");
      throw new Error("No JSON files found in ZIP");
    }

    // Enable foreign key constraints
    db.run("PRAGMA foreign_keys = ON;");

    for (const file of jsonFiles) {
      const content = JSON.parse(file.getData().toString("utf8"));
      const tableName = Object.keys(content)[0]; // Table name
      const rows = content[tableName];

      if (!Array.isArray(rows) || rows.length === 0) {
        logData.push(`No valid data found in ${file.entryName}`);
        continue;
      }

      // Check if table exists
      const tableExists = await new Promise((resolve, reject) => {
        db.get(
          `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
          [tableName],
          (err, row) => {
            if (err) {
              logData.push(`Error checking table ${tableName}: ${err.message}`);
              reject(err);
            }
            resolve(!!row);
          }
        );
      });

      // If table doesn't exist, create it with proper data types
      if (!tableExists) {
        let createTableQuery = "";
        if (tableName === "Details") {
          createTableQuery = `
              CREATE TABLE Details (
                EQID TEXT PRIMARY KEY,
                Width REAL,
                SlotsNeeded INTEGER,
                EQIDRelation TEXT,
                Slots TEXT,
                NetworkPorts TEXT,
                PowerPorts TEXT,
                Views TEXT,
                Properties TEXT,
                VSSFilename TEXT,
                VSSXFilename TEXT
              );
            `;
        } else if (tableName === "Related") {
          createTableQuery = `
              CREATE TABLE Related (
                Manufacturer TEXT NOT NULL,
                RelatedManufacturer TEXT NOT NULL,
                PRIMARY KEY (Manufacturer, RelatedManufacturer)
              );
            `;
        } else if (tableName === "Search") {
          createTableQuery = `
              CREATE TABLE Search (
                EQID TEXT PRIMARY KEY,
                MfgAcronym TEXT NOT NULL,
                EQType TEXT NOT NULL,
                MfgEQType TEXT NOT NULL,
                MfgProdLine TEXT NOT NULL,
                MfgProdNo TEXT NOT NULL,
                MfgDesc TEXT,
                Manufacturer TEXT NOT NULL,
                Attrib INTEGER
              );
            `;
        }

        if (createTableQuery) {
          await new Promise((resolve, reject) => {
            db.run(createTableQuery, (err) => {
              if (err) {
                logData.push(
                  `Error creating table ${tableName}: ${err.message}`
                );
                reject(err);
              }
              logData.push(`Table ${tableName} created successfully`);
              resolve();
            });
          });
        }
      }

      // Insert data using transactions with proper data types
      db.serialize(() => {
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => "?").join(", ");
        const stmt = db.prepare(
          `INSERT INTO ${tableName} (${columns.join(
            ", "
          )}) VALUES (${placeholders})`
        );

        db.run("BEGIN TRANSACTION");
        for (const row of rows) {
          const values = columns.map((col) => {
            if (typeof row[col] === "boolean") return row[col] ? 1 : 0; // Convert booleans to integers
            if (!isNaN(row[col]) && row[col] !== "") return Number(row[col]); // Convert numbers correctly
            return row[col]; // Default to string or null
          });

          stmt.run(values, (err) => {
            if (err) {
              console.log("err ===>", err, values);
              logData.push(`Error inserting into ${tableName}: ${err.message}`);
            }
          });
        }
        db.run("COMMIT");

        stmt.finalize();
        logData.push(`Inserted ${rows.length} records into ${tableName}`);
      });
    }

    // Close database connection


    res.json({ message: "Database successfully updated!", logData });
  } catch (error) {
    console.error("Import error:", error);
   
    logData.push(error.message);
    res
      .status(500)
      .json({
        message: "Failed to import database",
        error: error.message,
        logData,
      });
  }
};

export const ClearDatabase = async (req, res) => {
  const logData = [];

  try {
    // Get all table names (excluding system tables)
    const tables = await runQuery(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    );

    if (!tables.length) {
      return res.json({ message: "No tables found to clear.", logData });
    }

    // Start transaction
    await runQuery("BEGIN TRANSACTION;");

    for (const table of tables) {
      try {
        await runQuery(`DELETE FROM ${table.name};`); // Clears table data
        await runQuery(`UPDATE sqlite_sequence SET seq = 0 WHERE name = ?;`, [
          table.name,
        ]); // Resets auto-increment counter
      } catch (err) {
        logData.push(`Error clearing table ${table.name}: ${err.message}`);
      }
    }

    // Commit transaction
    await runQuery("COMMIT;");

    res.json({ message: "All tables cleared successfully!", logData });
  } catch (error) {
    logData.push(`Transaction failed: ${error.message}`);

    // Rollback transaction
    await runQuery("ROLLBACK;").catch((err) => {
      logData.push(`Rollback failed: ${err.message}`);
    });

    res.status(500).json({
      message: "Failed to clear database",
      error: error.message,
      logData,
    });
  }
};

