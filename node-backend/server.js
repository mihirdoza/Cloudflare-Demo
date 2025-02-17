// const express = require("express");
// const multer = require("multer");
// const Cloudflare = require("cloudflare");
// const axios = require("axios");
// const fs = require("fs");

// const app = express();
// // app.use(express.json());

// const cf = new Cloudflare({ token: "Aah3c3u4qasmXcftHs55cjPosi4NNu8Xi_3sWGvf" });
// const ACCOUNT_ID = "dd9b190e5bb824e610cd76610082c40b";
// const KV_NAMESPACE_ID = "415ae044d3d943bf94d851821b9157a3"; // KV Storage Namespace

// // 🔹 Setup Multer for file uploads
// const upload = multer({ dest: "uploads/" });

// // 🔹 Cloudflare API Helper Functions
// const cloudflareApi = async (method, url, data = {}) => {
//   return axios({
//     method,
//     url: `https://api.cloudflare.com/client/v4${url}`,
//     headers: { Authorization: `Bearer Aah3c3u4qasmXcftHs55cjPosi4NNu8Xi_3sWGvf` },
//     data,
//   });
// };

// // ✅ 1️⃣ Create D1 Database & Store in KV
// app.post("/create-db", async (req, res) => {
//   try {
//     const { name } = req.body;

//     // Create D1 Database
//     const dbResponse = await cf.request({
//       method: "POST",
//       url: `/accounts/${ACCOUNT_ID}/d1/database`,
//       data: { name },
//     });

//     const dbId = dbResponse.result.uuid;

//     // Store in KV Storage
//     await cloudflareApi("PUT", `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/${dbId}`, {
//       name,
//     });

//     res.json({ success: true, dbId, name });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ✅ 2️⃣ Create Table in D1 Database
// app.post("/create-table", async (req, res) => {
//   try {
//     const { dbId, query } = req.body;

//     await cloudflareApi("POST", `/accounts/${ACCOUNT_ID}/d1/database/${dbId}/query`, {
//       sql: query,
//     });

//     res.json({ success: true, message: "Table created successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ✅ 3️⃣ Upload JSON & Create/Update Table
// app.post("/upload-json", upload.single("file"), async (req, res) => {
//   try {
//     const { dbId, tableName } = req.body;
//     const filePath = req.file.path;
//     const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));

//     let columns = Object.keys(jsonData[0]).map((col) => `${col} TEXT`).join(",");
//     let createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;

//     await cloudflareApi("POST", `/accounts/${ACCOUNT_ID}/d1/database/${dbId}/query`, {
//       sql: createTableQuery,
//     });

//     for (const row of jsonData) {
//       const keys = Object.keys(row).join(",");
//       const values = Object.values(row).map((val) => `'${val}'`).join(",");
//       let insertQuery = `INSERT INTO ${tableName} (${keys}) VALUES (${values})`;

//       await cloudflareApi("POST", `/accounts/${ACCOUNT_ID}/d1/database/${dbId}/query`, { sql: insertQuery });
//     }

//     res.json({ success: true, message: "Table updated successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ✅ 4️⃣ Export Database as .sql File
// app.get("/export-db/:dbId", async (req, res) => {
//   try {
//     const { dbId } = req.params;
//     const tablesQuery = "SELECT name FROM sqlite_master WHERE type='table'";
//     const tables = await cloudflareApi("POST", `/accounts/${ACCOUNT_ID}/d1/database/${dbId}/query`, {
//       sql: tablesQuery,
//     });

//     let sqlDump = "";
//     for (const table of tables.result) {
//       let createQuery = `SELECT sql FROM sqlite_master WHERE name='${table.name}'`;
//       let createRes = await cloudflareApi("POST", `/accounts/${ACCOUNT_ID}/d1/database/${dbId}/query`, {
//         sql: createQuery,
//       });

//       sqlDump += `${createRes.result[0].sql};\n`;

//       let dataQuery = `SELECT * FROM ${table.name}`;
//       let dataRes = await cloudflareApi("POST", `/accounts/${ACCOUNT_ID}/d1/database/${dbId}/query`, {
//         sql: dataQuery,
//       });

//       for (const row of dataRes.result) {
//         let values = Object.values(row).map((val) => `'${val}'`).join(",");
//         sqlDump += `INSERT INTO ${table.name} VALUES (${values});\n`;
//       }
//     }

//     const filePath = `exports/${dbId}.sql`;
//     fs.writeFileSync(filePath, sqlDump);
//     res.download(filePath);
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ✅ 5️⃣ Import .sql File & Restore Database
// app.post("/import-db", upload.single("file"), async (req, res) => {
//   try {
//     const { dbId } = req.body;
//     const filePath = req.file.path;
//     const sqlDump = fs.readFileSync(filePath, "utf8");

//     const queries = sqlDump.split(";").filter((query) => query.trim());
//     for (const query of queries) {
//       await cloudflareApi("POST", `/accounts/${ACCOUNT_ID}/d1/database/${dbId}/query`, { sql: query });
//     }

//     res.json({ success: true, message: "Database imported successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Start Server
// app.listen(3000, () => console.log("Server running on port 3000"));
