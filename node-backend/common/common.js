import crypto from "crypto";

// Split the keywords by spaces and escape single quotes for safety
export const HandleSearchWord = async (word) => {
  const Sword = await word
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/'/g, "''"));
  return Sword;
};

// current date give in dd/mm/yyyy
export const formatedDate = async () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;
  console.log(`${dd}/${mm}/${yyyy}`);
  return `${dd}/${mm}/${yyyy}`;
};

export async function jsonToSQL(jsonData) {
  let sqlStatements = "";

  for (const tableName in jsonData) {
    const rows = await jsonData[tableName];
    rows.forEach(async (row) => {
      const columns = Object.keys(row).join(", ");
      const values = Object.values(row)
        .map((value) => `'${value}'`)
        .join(", ");
      sqlStatements += `INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${values});\n`;
    });
  }

  return sqlStatements;
}

export function computeMD5(buffer) {
  return crypto.createHash("md5").update(buffer).digest("hex");
}
