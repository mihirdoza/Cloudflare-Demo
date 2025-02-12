import express from "express";
import cors from "cors";
import multer from "multer";
import db from "./DB/DB.js";
import dotenv from "dotenv";

import {
  ClearDatabase,
  EquipmentType,
  ExportDataBase,
  GetAllTables,
  GetDetails,
  GetRelatedDetails,
  ImportDataBase,
  Manufacturer,
  Selected_Manufacturer,
  UploadTables,
} from "./api/api.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// DataBase Connection variable
db;


// This allows multiple reads while a write transaction is in progress.
db.run("PRAGMA journal_mode=WAL;");

// Function to create tables if they don't exist
function initializeDatabase() {
  db.exec(
    `
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS Details (
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

    CREATE TABLE IF NOT EXISTS Related (
        Manufacturer TEXT NOT NULL,
        RelatedManufacturer TEXT NOT NULL,
        PRIMARY KEY (Manufacturer, RelatedManufacturer)
    );

    CREATE TABLE IF NOT EXISTS Search (
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
    CREATE INDEX IF NOT EXISTS idx_search_all_columns ON Search (
    EQID, 
    EQType,
    MfgProdLine, 
    MfgProdNo, 
    MfgDesc, 
    Manufacturer, 
    Attrib
  );

CREATE INDEX IF NOT EXISTS idx_eqid ON Details (EQID);
    `,
    (err) => {
      if (err) {
        console.error("Error creating tables:", err.message);
      } else {
        console.log("Tables initialized successfully.");
      }
    }
  );
}

initializeDatabase();

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

const upload = multer({ storage: multer.memoryStorage() });

// Middleware to log errors
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.statusCode || 500).json({ error: err.message });
});

app.post("/upload", upload.array("file"), UploadTables);

// get All Tables
app.get("/tables", GetAllTables);

// 🏭 **Manufacturer Route** 🏭
app.post("/manufacturer", Manufacturer);

// 🔧 **Equipment Route** 🔧
app.post("/equipment", EquipmentType);

// search api
app.post("/selected_manufacturer", Selected_Manufacturer);

// get Details
app.post("/get_details", GetDetails);

app.post("/get_related_details", GetRelatedDetails);

/**
 * EXPORT FULL DATABASE AS JSON (Zipped)
 */

app.get("/export", ExportDataBase);

/**
 * IMPORT DATABASE (Upload & Replace)
 */
app.post("/import", upload.single("database"), ImportDataBase);

app.delete("/clear-database", ClearDatabase);

app.get("/",async(req,res)=>{
  res.send("Server is Running")

})

const Port = process.env.PORT || 5000;
app.listen(Port, () => console.log(`Server running on port ${Port}`));
