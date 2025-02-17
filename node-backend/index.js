import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { getDbFromKv } from "./Middleware/GetDb.js";
import cors from "cors";

import { ClearDatabase, CreateDatabase, EquipmentSearch, ExportDatabaseJsonZip, ExportDbSql, GetEqidDetails, GetRelatedEqidDetails, ImportSqlDb, ManufacturerSearch, RemoveDatabase, SelectedManufacturer, UploadJsonFileData } from "./api/api.js";

// Load environment variables
dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true })); // For parsing form-urlencoded data
app.use(express.json());
app.use(cors());


// 🔹 Setup Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });


// ✅ 1️⃣ Create D1 Database & Store in KV
app.post("/create-db", CreateDatabase);



app.post("/upload", upload.array("file"), getDbFromKv, UploadJsonFileData);

app.get("/export", getDbFromKv, ExportDatabaseJsonZip);

app.post("/get_details", getDbFromKv,GetEqidDetails);

app.post("/get_related_details", getDbFromKv, GetRelatedEqidDetails);

// 🔹 Helper Function: Compute MD5 Hash of File (Required for Cloudflare Import)




app.post(
  "/import",
  upload.single("database"),
  getDbFromKv,
ImportSqlDb
);

app.delete("/remove-db", getDbFromKv,RemoveDatabase);

app.delete("/clear-database", getDbFromKv, ClearDatabase);


app.get("/export-db", getDbFromKv,ExportDbSql);

// get manufacturer

app.post("/manufacturer", getDbFromKv,ManufacturerSearch);

app.post("/equipment", getDbFromKv, EquipmentSearch);

app.post("/selected_manufacturer", getDbFromKv, SelectedManufacturer);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
