import { configDotenv } from "dotenv";
import sqlite3 from "sqlite3";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

configDotenv();


if (!process.env.DB_PATH || !process.env.DB_NAME) {
    throw new Error("Missing DB_PATH or DB_NAME in .env file");
  }
  
  // Ensure the folder exists, create if it doesn’t
  if (!existsSync(process.env.DB_PATH)) {
    mkdirSync(process.env.DB_PATH, { recursive: true });
    console.log("Database directory created at:", process.env.DB_PATH);
  }
  
  // Define the physical path for the database file
  const dbPath = join(`${process.env.DB_PATH}`, process.env.DB_NAME);
  
  // Open a persistent SQLite database
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Error opening database:", err.message);
    } else {
      console.log("Connected to SQLite database at:", dbPath);
    }
  });

  export default db;