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
function buildQuery(search, condition = 'OR') {
	if (!search) {
	  return {
		query: "SELECT DISTINCT Manufacturer FROM search2",
		placeholders: [],
	  };
	}
  
	const columns = [
	  "EQID",
	  "MfgAcronym",
	  "EQType",
	  "MfgEQType",
	  "MfgProdLine",
	  "MfgProdNo",
	  "MfgDesc",
	  "Manufacturer",
	];
  
	const keywords = search.split(" ");
	
	// Creating the keyword clause for each keyword and column combination
	const keywordClauses = keywords.map(keyword => {
	  return columns.map(col => `${col} LIKE ?`).join(" OR ");
	});
  
	// Combining keyword clauses with the provided condition (AND/OR)
	const whereClause = keywordClauses.join(` ${condition} `);
	const query = `
	  SELECT DISTINCT Manufacturer
	  FROM search2
	  WHERE ${whereClause}
	`;
  
	// Creating placeholders for each keyword for all the columns
	const placeholders = keywords.flatMap(keyword =>
	  columns.map(() => `%${keyword}%`)
	);
  
	return { query, placeholders };
  }

/**
 * Main Route for Manufacturer Search
 */
// app.post('/manufacturer', async (c) => {
//   try {
//     // Parse request body
//     const body = await c.req.json() ;
// 	console.log(c.req.body)
//     const { search, condition} = body || {};
//     const queryCondition = condition ? condition : "OR";

//     // Build SQL Query
//     const { query, placeholders } = buildQuery(search, queryCondition);
//     console.log('Executing SQL Query:', query, 'Placeholders:', placeholders);
// console.log("DB===>",c.env)
//     // Execute query on the D1 database
//     const queryResult = await c.env.DB.prepare(query).bind(...placeholders).all();
//     const results = queryResult?.results || [];

//     // Return results
//     if (results.length === 0) {
//       return c.json({ manufacturers: [], totalManufacturer: 0 }, 200);
//     }

//     const manufacturers = results.map((row) => row.Manufacturer);
//     return c.json({ manufacturers, totalManufacturer: manufacturers.length }, 200);
//   } catch (error) {
//     console.error('Error:', error.stack || error.message || error);
//     return c.json({ error: 'Server error. Check logs for details.' }, 500);
//   }
// });

app.post('/manufacturer', async (c) => {
	try {
	  // Parse the request body
	  const body = await c.req.json();
	  console.log('Request Body:', body);
  
	  const { search, condition } = body || {};
	  const queryCondition = condition || 'OR'; // Default to 'OR' if no condition is provided
  
	//   if (!search) {
	// 	return c.json({ manufacturers: [], totalManufacturer: 0 }, 200); // Return empty if no search keyword
	//   }
  
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


  

//   app.post('/selected_manufacturer', async (c) => {
// 	try {
// 	  // Parse the request body
// 	  const body = await c.req.json();
// 	  const selectedManufacturer = String(body.selectedManufacturer);
// 	  const selectedEquipmentType = String(body.selectedEquipmentType);
// 	  const selectedProductLine = String(body.selectedProductLine);
// 	  const selectedProductNumber = String(body.selectedProductNumber);
  
// 	  let sqlQuery = `
// 		SELECT DISTINCT 
// 		  EQID, Manufacturer, EQType, MfgProdLine, MfgProdNo, 
// 		  JSON_EXTRACT(Views, '$[0].ShapeID') AS ShapeID 
// 		FROM devicedetails2 
// 		WHERE Manufacturer = ?
// 	  `;
  
// 	  // Add conditions based on the provided filters
// 	  if (selectedEquipmentType !== "") {
// 		sqlQuery += ` AND EQType = ?`;
// 	  }
// 	  if (selectedProductLine !== "") {
// 		sqlQuery += ` AND MfgProdLine = ?`;
// 	  }
// 	  if (selectedProductNumber !== "") {
// 		sqlQuery += ` AND MfgProdNo = ?`;
// 	  }
  
// 	  // Prepare the query parameters in an array
// 	  const queryParams = [selectedManufacturer];
// 	  if (selectedEquipmentType !== "") queryParams.push(selectedEquipmentType);
// 	  if (selectedProductLine !== "") queryParams.push(selectedProductLine);
// 	  if (selectedProductNumber !== "") queryParams.push(selectedProductNumber);
  
// 	  console.log("Executing SQL Query:", sqlQuery);
// 	  console.log("With Parameters:", queryParams);
  
// 	  // Execute the query on the D1 database
// 	  const queryResult = await c.env.DB.prepare(sqlQuery).bind(...queryParams).all();
  
// 	  // Check if queryResult.results exists and is an array
// 	  const result = queryResult?.results || [];
  
// 	  if (result.length === 0) {
// 		return c.json({ message: "No matching equipment found for the selected filters." }, 200);
// 	  }
  
// 	  // Return the result as the response
// 	  return c.json(result, 200);
  
// 	} catch (error) {
// 	  console.error("Error details:", error.stack || error.message || error);
// 	  return c.json({ error: "Server error. Check logs for details." }, 500);
// 	}
//   });
  
// app.post('/selected_manufacturer', async (c) => {
// 	try {
// 	  // Parse the request body
// 	  const body = await c.req.json();
// 	  const selectedManufacturer = String(body.selectedManufacturer);
// 	  const selectedEquipmentType = String(body.selectedEquipmentType || "");
// 	  const selectedProductLine = String(body.selectedProductLine || "");
// 	  const selectedProductNumber = String(body.selectedProductNumber || "");
// 	  const keywords = String(body.keywords || "");
// 	  const condition = String(body.condition || "AND");
  
// 	  let sqlQuery = `
// 		SELECT DISTINCT 
// 		  EQID, Manufacturer, EQType, MfgProdLine, MfgProdNo, 
// 		  JSON_EXTRACT(Views, '$[0].ShapeID') AS ShapeID 
// 		FROM devicedetails2 
// 		WHERE Manufacturer = ?
// 	  `;
  
// 	  // Prepare the query parameters in an array
// 	  const queryParams = [selectedManufacturer];
  
// 	  // Add conditions based on the provided filters
// 	  if (selectedEquipmentType !== "") {
// 		sqlQuery += ` ${condition} EQType = ?`;
// 		queryParams.push(selectedEquipmentType);
// 	  }
// 	  if (selectedProductLine !== "") {
// 		sqlQuery += ` ${condition} MfgProdLine = ?`;
// 		queryParams.push(selectedProductLine);
// 	  }
// 	  if (selectedProductNumber !== "") {
// 		sqlQuery += ` ${condition} MfgProdNo = ?`;
// 		queryParams.push(selectedProductNumber);
// 	  }
  
// 	  // Handle keywords if provided
// 	  if (keywords.trim() !== "") {
// 		const words = keywords.split(/\s+/).map((word) => word.replace(/'/g, "''"));
// 		const keywordConditions = words.map(
// 		  (word) => `
// 			(EQID LIKE '%${word}%' OR 
// 			 Manufacturer LIKE '%${word}%' OR 
// 			 EQType LIKE '%${word}%' OR 
// 			 MfgProdLine LIKE '%${word}%' OR 
// 			 MfgProdNo LIKE '%${word}%' OR 
// 			 JSON_EXTRACT(Views, '$[0].ShapeID') LIKE '%${word}%')`
// 		);
// 		const combinedConditions = keywordConditions.join(` ${condition} `);
// 		sqlQuery += ` ${condition} (${combinedConditions})`;
// 	  }
  
// 	  console.log("Executing SQL Query:", sqlQuery);
// 	  console.log("With Parameters:", queryParams);
  
// 	  // Execute the query on the D1 database
// 	  const queryResult = await c.env.DB.prepare(sqlQuery).bind(...queryParams).all();
  
// 	  // Check if queryResult.results exists and is an array
// 	  const result = queryResult?.results || [];
  
// 	  if (result.length === 0) {
// 		return c.json({ message: "No matching equipment found for the selected filters." }, 200);
// 	  }
  
// 	  // Return the result as the response
// 	  return c.json(result, 200);
  
// 	} catch (error) {
// 	  console.error("Error details:", error.stack || error.message || error);
// 	  return c.json({ error: "Server error. Check logs for details." }, 500);
// 	}
//   });
  


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
