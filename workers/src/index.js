import { Hono } from 'hono';

const app = new Hono();

/**
 * CORS Middleware
 */
app.use('*', async (c, next) => {
  await next();
  c.res.headers.set('Access-Control-Allow-Origin', '*');
  c.res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
});

/**
 * Build SQL Query with Parameterized Placeholders
 */
app.post('/upload', async (c) => {
	try {
	  const formData = await c.req.formData();
	  const file = formData.get('file');
  
	  if (!file) {
		return c.json({ message: 'No file uploaded.' }, 400);
	  }
  
	  const jsonData = await file.text();
	  const cleanJsonData = jsonData.replace(/^\uFEFF/, ''); // Remove BOM if present
  
	  let parsedData;
	  try {
		parsedData = JSON.parse(cleanJsonData);
	  } catch (err) {
		return c.json({ message: `JSON parsing error: ${err.message}` }, 400);
	  }
  
	  if (!parsedData.SearchInfo || !Array.isArray(parsedData.SearchInfo)) {
		return c.json({ message: "Invalid JSON structure: 'SearchInfo' must be an array." }, 400);
	  }
  
	  const records = parsedData.SearchInfo;
	  const batchSize = 400;
  
	  const createTableSQL = `
	  CREATE TABLE IF NOT EXISTS Search1 (
		EQID TEXT PRIMARY KEY,
		MfgAcronym TEXT,
		EQType TEXT,
		MfgEQType TEXT,
		MfgProdLine TEXT,
		MfgProdNo TEXT,
		MfgDesc TEXT,
		Manufacturer TEXT,
		Attrib TEXT
	  );
	`;
	await c.env.DB.prepare(createTableSQL).run();

	// Insert data in batches
	const insertSQL = `
	  INSERT INTO Search1 (
		EQID, MfgAcronym, EQType, MfgEQType, MfgProdLine, MfgProdNo, MfgDesc, Manufacturer, Attrib
	  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	  ON CONFLICT(EQID) DO NOTHING;
	`;

	for (let i = 0; i < records.length; i += batchSize) {
	  const batch = records.slice(i, i + batchSize);

	  for (const record of batch) {
		try {
		  await c.env.DB.prepare(insertSQL)
			.bind(
			  record.EQID,
			  record.MfgAcronym,
			  record.EQType,
			  record.MfgEQType,
			  record.MfgProdLine,
			  record.MfgProdNo,
			  record.MfgDesc,
			  record.Manufacturer,
			  record.Attrib
			)
			.run();
		} catch (err){
						
			return c.json({ message: `Error processing request: ${err.message}` }, 500);
		}
	}
}
		
  
	  return c.json({ message: 'Data successfully uploaded and processed.' }, 200);
  
	} catch (err) {
	  return c.json({ message: `Error processing request: ${err.message}` }, 500);
	}
  });
  


app.post('/manufacturer', async (c) => {
	try {
	  // Parse the request body
	  const body = await c.req?.json()?.catch(() => null);
	  
	  console.log('Request Body:', body);
  
	  if (!body || Object.keys(body).length === 0) {
		// If the body is empty, return all data from the database
		const sqlQuery = `SELECT DISTINCT Manufacturer FROM search2`;
		console.log('SQL Query for all data:', sqlQuery);
  
		const queryResult = await c.env.DB.prepare(sqlQuery).all();
		const results = queryResult?.results || [];
  
		if (results.length === 0) {
		  return c.json({ manufacturers: [], totalManufacturer: 0 }, 200);
		}
  
		const manufacturers = results.map(row => row.Manufacturer);
		return c.json({ manufacturers, totalManufacturer: manufacturers.length }, 200);
	  }
  
	  const { search, condition } = body || {};
	  const queryCondition = condition || 'OR'; // Default to 'OR' if no condition is provided
  
	  // If search is not provided, return all data
	  if (!search) {
		const sqlQuery = `SELECT DISTINCT Manufacturer FROM search2`;
		console.log('SQL Query for all data (search missing):', sqlQuery);
  
		const queryResult = await c.env.DB.prepare(sqlQuery).all();
		const results = queryResult?.results || [];
  
		if (results.length === 0) {
		  return c.json({ manufacturers: [], totalManufacturer: 0 }, 200);
		}
  
		const manufacturers = results.map(row => row.Manufacturer);
		return c.json({ manufacturers, totalManufacturer: manufacturers.length }, 200);
	  }
  
	  // Split the keywords by spaces and escape single quotes for safety
	  const words = search.split(/\s+/).map(word => word.replace(/'/g, "''"));
	  console.log('Keywords:', words);
  
	  // Build the conditions for each keyword in the search
	  const conditions = words.map(
		word => `
		  (EQID LIKE '%${word}%' OR 
		   MfgAcronym LIKE '%${word}%' OR 
		   EQType LIKE '%${word}%' OR 
		   MfgEQType LIKE '%${word}%' OR 
		   MfgProdLine LIKE '%${word}%' OR 
		   MfgProdNo LIKE '%${word}%' OR 
		   MfgDesc LIKE '%${word}%' OR 
		   Manufacturer LIKE '%${word}%')`
	  );
  
	  // Join the conditions with the provided condition (AND or OR)
	  const sqlCondition = conditions.join(` ${queryCondition} `);
  
	  // Build the SQL query
	  const sqlQuery = `SELECT DISTINCT Manufacturer FROM search2 WHERE ${sqlCondition}`;
	  console.log('SQL Query:', sqlQuery);
  
	  // Execute the query on the D1 database
	  const queryResult = await c.env.DB.prepare(sqlQuery).all();
	  const results = queryResult?.results || [];
  
	  // Return the results as JSON
	  if (results.length === 0) {
		return c.json({ manufacturers: [], totalManufacturer: 0 }, 200);
	  }
  
	  const manufacturers = results.map(row => row.Manufacturer);
	  return c.json({ manufacturers, totalManufacturer: manufacturers.length }, 200);
  
	} catch (error) {
	  console.error('Error:', error.stack || error.message || error);
	  return c.json({ error: 'Server error. Check logs for details.' }, 500);
	}
  });
  


  app.post("/equipment", async (c) => {
	try {
	  // Parse the request body
	  const body = await c.req.json();
	  const { Manufacturer, keywords, condition } = body || {};
	  console.log("Request Body:", { Manufacturer, keywords, condition });
  
	  if (!Manufacturer) {
		return c.json({ error: "Manufacturer is required in the request body." }, 400);
	  }
  
	  let sqlQuery;
  
	  if (!keywords || keywords.trim() === "") {
		// If no keywords, search only by Manufacturer
		sqlQuery = `
		  SELECT EQType, MfgProdLine, MfgProdNo
		  FROM search2
		  WHERE Manufacturer = ?
		`;
		console.log("SQL Query without keywords:", sqlQuery);
	  } else {
		// If keywords are provided, include them in the query
		const words = keywords.split(/\s+/).map((word) => word.replace(/'/g, "''"));
		const validCondition = condition === "OR" ? "OR" : "AND";
  
		const keywordConditions = words.map(
		  (word) => `
		  (EQID LIKE '%${word}%' OR 
		   MfgAcronym LIKE '%${word}%' OR 
		   EQType LIKE '%${word}%' OR 
		   MfgEQType LIKE '%${word}%' OR 
		   MfgProdLine LIKE '%${word}%' OR 
		   MfgProdNo LIKE '%${word}%' OR 
		   MfgDesc LIKE '%${word}%' OR 
		   Manufacturer LIKE '%${word}%')`
		);
  
		const combinedConditions = keywordConditions.join(` ${validCondition} `);
  
		sqlQuery = `
		  SELECT EQType, MfgProdLine, MfgProdNo
		  FROM search2
		  WHERE Manufacturer = ?
		  AND (${combinedConditions})
		`;
		console.log("SQL Query with keywords:", sqlQuery);
	  }
  
	  // Execute the query using Cloudflare D1
	  const queryResult = await c.env.DB.prepare(sqlQuery).bind(Manufacturer).all();
	  console.log("Raw Query Result:", queryResult);
  
	  const result = queryResult?.results || [];
  
	  if (result.length === 0) {
		return c.json({ message: "No related equipment found for the given Manufacturer." }, 200);
	  }
  
	  // Return the array of objects (EQType, MfgProdLine, MfgProdNo)
	  return c.json(result, 200);
  
	} catch (error) {
	  console.error("Error details:", error.stack || error.message || error);
	  return c.json({ error: "Server error. Check logs for details." }, 500);
	}
  });


app.post('/selected_manufacturer', async (c) => {
	try {
	  // Parse the request body
	  const body = await c.req.json();
	  const selectedManufacturer = String(body.selectedManufacturer || "");
	  const selectedEquipmentType = String(body.selectedEquipmentType || "");
	  const selectedProductLine = String(body.selectedProductLine || "");
	  const selectedProductNumber = String(body.selectedProductNumber || "");
	  const keywords = String(body.keywords || "");
	  const condition = String(body.condition || "OR");
  
	  // Validate condition
	
  
	  let sqlQuery = `
		SELECT DISTINCT 
		  EQID, Manufacturer, EQType, MfgProdLine, MfgProdNo, 
		  JSON_EXTRACT(Views, '$[0].ShapeID') AS ShapeID 
		FROM devicedetails2 
		WHERE Manufacturer = ?
	  `;
  
	  // Prepare query parameters
	  const queryParams = [selectedManufacturer];
  
	  // Add conditions for other filters
	  if (selectedEquipmentType !== "") {
		sqlQuery += ` AND EQType = ?`;
		queryParams.push(selectedEquipmentType);
	  }
	  if (selectedProductLine !== "") {
		sqlQuery += ` AND MfgProdLine = ?`;
		queryParams.push(selectedProductLine);
	  }
	  if (selectedProductNumber !== "") {
		sqlQuery += ` AND MfgProdNo = ?`;
		queryParams.push(selectedProductNumber);
	  }
  
	  // Handle keywords if provided
	  if (keywords.trim() !== "") {
		const words = keywords.split(/\s+/).map((word) => word.replace(/'/g, "''"));
		const keywordConditions = words.map(
		  (word) => `
			(EQID LIKE '%${word}%' OR
			 Manufacturer LIKE '%${word}%' OR 
			 MfgAcronym LIKE '%${word}%' OR
			 MfgEQType LIKE '%${word}%' OR 
			 EQType LIKE '%${word}%' OR
			 MfgProdLine LIKE '%${word}%' OR 
			 MfgProdNo LIKE '%${word}%' OR 
			  MfgDesc LIKE '%${word}%' OR
			 JSON_EXTRACT(Views, '$[0].ShapeID') LIKE '%${word}%')`
		);
		const combinedConditions = keywordConditions.join(` ${condition} `);
		sqlQuery += ` AND (${combinedConditions})`;
	  }
  
	  console.log("Executing SQL Query:", sqlQuery);
	  console.log("With Parameters:", queryParams);
  
	  // Execute the query on the D1 database
	  const queryResult = await c.env.DB.prepare(sqlQuery).bind(...queryParams).all();
  
	  // Check if queryResult.results exists and is an array
	  const result = queryResult?.results || [];
  
	  if (result.length === 0) {
		return c.json({ message: "No matching equipment found for the selected filters." }, 200);
	  }
  
	  // Return the result as the response
	  return c.json(result, 200);
  
	} catch (error) {
	  console.error("Error details:", error.stack || error.message || error);
	  return c.json({ error: "Server error. Check logs for details." }, 500);
	}
  });
  

app.get('/', async (c) => {
	try {
		console.log(c.env.DB)
	  // Query to list all tables in the database
	  const result = await c.env.DB.prepare("SELECT * FROM search2").all();
  
	  // Log the tables in the database
	  console.log('Tables in DB:', result);
  
	  // Return the tables in response
	  return c.json({ tables: result }, 200);
	} catch (error) {
	  console.error('Error checking DB:', error);
	  return c.json({ error: 'Database connection failed.' }, 500);
	}
  });
  
  



export default app;
