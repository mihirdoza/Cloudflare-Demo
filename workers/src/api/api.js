import { HandleSearchWord } from '../common/common';
import JSZip from 'jszip';

// Function to log errors to Cloudflare
async function logErrorToCloudflare(c, logData) {
	for (const log of logData) {
		c.executionCtx.waitUntil(console.error(log)); // This ensures logs are saved to Cloudflare logs
	}
}

// table names
const SearchTable = 'Search';
const RelatedTable = 'Related';
const DeviceDetailsTable = 'Details';

export const UploadTable = async (c) => {
	let logData = [];
	const BATCH_SIZE = 200;

	try {
		const formData = await c.req.formData();
		const files = formData.getAll('file');
		const tableName = formData.get('tableName');

		if (!files || files.length === 0 || !tableName) {
			logData.push('No files or table name provided.');
			throw new ErrorMessage(400, 'No files or table name provided.');
		}

		if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
			logData.push('Invalid table name.');
			throw new ErrorMessage(400, 'Invalid table name.');
		}

		let success = true;

		for (const file of files) {
			let jsonData;
			try {
				const fileContent = await file.text();
				const cleanJsonData = fileContent.replace(/^﻿/, ''); // Remove BOM if present
				jsonData = JSON.parse(cleanJsonData);
			} catch (err) {
				success = false;
				logData.push(`Error reading or parsing file ${file.name}: ${err.message}`);
				throw new ErrorMessage(400, `Error reading or parsing file ${file.name}`);
			}

			const dynamicKey = Object.keys(jsonData).find((key) => Array.isArray(jsonData[key]));
			if (!dynamicKey || !jsonData[dynamicKey].length) {
				success = false;
				logData.push(`Invalid JSON structure in file ${file.name}.`);
				throw new ErrorMessage(400, `Invalid JSON structure in file ${file.name}.`);
			}

			const records = jsonData[dynamicKey];
			const keys = Array.from(new Set(records.flatMap((row) => Object.keys(row))));

			// Prepare insert query
			const placeholders = keys.map(() => '?').join(', ');
			const insertQuery = `INSERT OR REPLACE INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;

			let startIndex = 0;
			while (startIndex < records.length) {
				const batch = records.slice(startIndex, startIndex + BATCH_SIZE);
				const batchValues = batch.map((row) => keys.map((key) => (row[key] !== undefined ? row[key] : null)));

				try {
					await c.env.DB.batch(batchValues.map((values) => c.env.DB.prepare(insertQuery).bind(...values)));
					logData.push(`Inserted batch from index ${startIndex}, Total rows: ${batch.length}`);
				} catch (err) {
					success = false;
					logData.push(`Error inserting batch at index ${startIndex} for file ${file.name}: ${err.message}`);
				}

				startIndex += BATCH_SIZE;
			}
		}

		const response = success
			? { message: 'All files uploaded successfully.', logData }
			: { message: 'Errors occurred during processing.', logData };

		c.executionCtx.waitUntil(logErrorToCloudflare(c, logData));

		return c.json(response, success ? 200 : 500);
	} catch (err) {
		c.executionCtx.waitUntil(logErrorToCloudflare(c, logData));
		return c.json({ message: 'Internal server error', logData }, 500);
	}
};

export const Manufacturer = async (c) => {
	try {
		// Parse the request body
		const body = await c.req?.json()?.catch(() => null);

		console.log('Request Body:', body);

		const { search, condition } = body || {};
		const queryCondition = condition || 'OR'; // Default to 'OR' if no condition is provided

		if (!search) {
			const sqlQuery = `SELECT DISTINCT Manufacturer FROM ${SearchTable} ORDER BY Manufacturer ASC`;
			console.log('Without Search Query ==>', sqlQuery);

			try {
				const queryResult = await c.env.DB.prepare(sqlQuery).all();

				console.log(queryResult);
				const results = queryResult?.results || [];
				if (results.length !== 0) {
					const manufacturers = results.map((row) => row.Manufacturer);
					return c.json({ manufacturers, totalManufacturer: manufacturers.length }, 200);
				}
			} catch (err) {
				throw new ErrorMessage(400, `${err}`);
			}
		}

		// Split the keywords by spaces and escape single quotes for safety
		const words = await HandleSearchWord(search);

		console.log('Keywords:', words);

		const queryStrategies = [
			(word) => `${word}%`, // Query no-1: `%{word}`
			(word) => `%${word}`, // Query no-2: `{word}%`
			(word) => `%${word}%`, // Query no-3: `%{word}%`
		];

		let results = [];
		let manufacturers = [];

		// Sequentially apply query strategies
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
			const sqlQuery = `SELECT DISTINCT Manufacturer FROM ${SearchTable} WHERE ${sqlCondition} ORDER BY Manufacturer ASC`;
			console.log('SQL Query:', sqlQuery);

			// Execute the query
			const queryResult = await c.env.DB.prepare(sqlQuery).all();
			results = queryResult?.results || [];

			if (results.length > 0) {
				// Break loop if results are found
				manufacturers = results.map((row) => row.Manufacturer);
				break;
			}
		}

		// Return results if any, else return empty response
		if (manufacturers.length === 0) {
			return c.json({ manufacturers: [], totalManufacturer: 0 }, 200);
		}

		return c.json({ manufacturers, totalManufacturer: manufacturers.length }, 200);
	} catch (error) {
		console.error('Error:', error.stack || error.message || error);

		// return c.json({ message: 'Internal server error', logData }, 500);

		return c.json({ error: error.message }, 500);
	}
};

export const GetTables = async (c) => {
	try {
		const { DB } = c.env;

		// Query to fetch all table names
		const tablesQuery = await DB.prepare(
			"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_kv' AND name NOT LIKE 'sqlite_sequence';"
		).all();

		if (!tablesQuery.results || tablesQuery.results.length === 0) {
			return c.json({ message: 'No tables found in the database' }, 404);
		}

		// Format the table names as requested
		const tables = tablesQuery.results.map((table) => ({ name: table.name }));

		return c.json({ tables }, 200);
	} catch (error) {
		return c.json({ error: error.message }, 500);
	}
};

export const EquipmentType = async (c) => {
	try {
		// Parse the request body
		const body = await c.req.json();
		const { Manufacturer, keywords, condition, isRelated } = body || {};
		console.log('Request Body equipment:', { Manufacturer, keywords, condition, isRelated });

		if (!Manufacturer) {
			return c.json({ error: 'Manufacturer is required in the request body.' }, 400);
		}

		let results = [];
		const validCondition = condition === 'OR' ? 'OR' : 'AND';

		let manufacturers = [Manufacturer];

		// Fetch related manufacturers if `isRelated` is true
		if (isRelated) {
			try {
				const relatedQuery = `SELECT DISTINCT RelatedManufacturer FROM ${RelatedTable} WHERE Manufacturer = ?`;
				const relatedManufacturers = await c.env.DB.prepare(relatedQuery).bind(Manufacturer).all();

				if (relatedManufacturers?.results?.length > 0) {
					manufacturers.push(...relatedManufacturers.results.map((row) => row.RelatedManufacturer));
				}
			} catch (err) {
				return c.json({ error: `Error fetching related manufacturers: ${err.message}` }, 400);
			}
		}

		// If no keywords, search only by Manufacturer and related manufacturers
		if (!keywords || keywords.trim() === '') {
			const sqlQuery = `
          SELECT DISTINCT EQType, MfgProdLine, MfgProdNo
          FROM ${SearchTable}
          WHERE Manufacturer IN (${manufacturers.map(() => '?').join(',')})
          ORDER BY EQType ASC
        `;
			console.log('SQL Query without keywords:', sqlQuery);

			const queryResult = await c.env.DB.prepare(sqlQuery)
				.bind(...manufacturers)
				.all();
			results = queryResult?.results || [];

			if (results.length === 0) {
				return c.json({ message: 'No related equipment found for the given Manufacturer.' }, 200);
			}

			return c.json(results, 200);
		}

		// Handle keyword-based search
		const words = await HandleSearchWord(keywords);
		console.log('Keywords:', words);

		// Query strategies
		const queryStrategies = [
			(word) => `${word}%`, // `%word`
			(word) => `%${word}`, // `word%`
			(word) => `%${word}%`, // `%word%`
		];

		// Sequential search through query strategies
		for (const strategy of queryStrategies) {
			const keywordConditions = words.map(
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

			const combinedConditions = keywordConditions.join(` ${validCondition} `);

			const sqlQuery = `
          SELECT DISTINCT EQType, MfgProdLine, MfgProdNo
          FROM ${SearchTable}
          WHERE Manufacturer IN (${manufacturers.map(() => '?').join(',')})
          AND (${combinedConditions})
          ORDER BY EQType ASC
        `;
			console.log('SQL Query with Keywords:', sqlQuery);

			const queryResult = await c.env.DB.prepare(sqlQuery)
				.bind(...manufacturers)
				.all();
			results = queryResult?.results || [];

			if (results.length > 0) {
				return c.json(results, 200);
			}
		}

		// If no results found after all strategies
		return c.json({ message: 'No related equipment found for the given Manufacturer and keywords.' }, 200);
	} catch (error) {
		console.error('Error details:', error.stack || error.message || error);
		return c.json({ error: 'Server error. Check logs for details.' }, 500);
	}
};

export const SelectedManufacturer = async (c) => {
	try {
		// Parse the request body
		const body = await c.req.json();
		const selectedManufacturer = String(body.selectedManufacturer || '');
		const selectedEquipmentType = String(body.selectedEquipmentType || '');
		const selectedProductLine = String(body.selectedProductLine || '');
		const selectedProductNumber = String(body.selectedProductNumber || '');
		const keywords = String(body.keywords || '');
		const condition = String(body.condition || 'OR');
		const isRelated = body.isRelated || false;
		const attribute = body.filterAttribute;

		if (!selectedManufacturer) {
			return c.json({ error: 'Manufacturer is required in the request body.' }, 400);
		}

		let manufacturers = [selectedManufacturer];

		// Fetch related manufacturers if `isRelated` is true
		if (isRelated) {
			try {
				const relatedQuery = `SELECT DISTINCT RelatedManufacturer FROM ${RelatedTable} WHERE Manufacturer = ?`;
				const relatedManufacturers = await c.env.DB.prepare(relatedQuery).bind(selectedManufacturer).all();

				if (relatedManufacturers?.results?.length > 0) {
					manufacturers.push(...relatedManufacturers.results.map((row) => row.RelatedManufacturer));
				}
			} catch (err) {
				return c.json({ error: `Error fetching related manufacturers: ${err.message}` }, 400);
			}
		}

		// Base SQL query
		let sqlQuery = `
       SELECT DISTINCT 
            EQID, Manufacturer, EQType, MfgProdLine, MfgProdNo
          FROM ${SearchTable}
        WHERE Manufacturer IN (${manufacturers.map(() => '?').join(',')})
      `;

		// Prepare query parameters
		const queryParams = [...manufacturers];

		console.log('Body data:', selectedManufacturer, selectedEquipmentType, selectedProductLine, selectedProductNumber);

		// Add conditions for other filters
		if (selectedEquipmentType !== '') {
			sqlQuery += ` AND EQType = ?`;
			queryParams.push(selectedEquipmentType);
		}
		if (selectedProductLine !== '') {
			sqlQuery += ` AND MfgProdLine = ?`;
			queryParams.push(selectedProductLine);
		}
		if (selectedProductNumber !== '') {
			sqlQuery += ` AND MfgProdNo = ?`;
			queryParams.push(selectedProductNumber);
		}
		if (selectedProductNumber !== '') {
			sqlQuery += ` AND MfgProdNo = ?`;
			queryParams.push(selectedProductNumber);
		}
		if (attribute != 0) {
			sqlQuery += ` AND attrib = ?`;
			queryParams.push(attribute);
		}

		let results = [];

		// Handle keyword-based search if provided
		if (keywords.trim() !== '') {
			const words = await HandleSearchWord(keywords);
			console.log('Keywords:', words);

			// Define query strategies
			const queryStrategies = [
				(word) => `${word}%`, // Strategy 1: word%
				(word) => `%${word}`, // Strategy 2: %word
				(word) => `%${word}%`, // Strategy 3: %word%
			];

			// Sequentially apply strategies
			for (const strategy of queryStrategies) {
				const keywordConditions = words.map(
					(word) => `
              (EQID LIKE '${strategy(word)}' OR
               Manufacturer LIKE '${strategy(word)}' OR 
               MfgAcronym LIKE '${strategy(word)}' OR
               MfgEQType LIKE '${strategy(word)}' OR 
               EQType LIKE '${strategy(word)}' OR
               MfgProdLine LIKE '${strategy(word)}' OR 
               MfgProdNo LIKE '${strategy(word)}' OR 
               MfgDesc LIKE '${strategy(word)}')`
				);

				const combinedConditions = keywordConditions.join(` ${condition} `);

				// Extend SQL query with keyword conditions
				const fullQuery = `${sqlQuery} AND (${combinedConditions})`;
				console.log('Executing SQL Query with strategy:', fullQuery);
				console.log('With Parameters:', queryParams);

				try {
					const queryResult = await c.env.DB.prepare(fullQuery)
						.bind(...queryParams)
						.all();
					results = queryResult?.results || [];

					if (results.length > 0) {
						return c.json(results, 200);
					}
					return c.json(results, 200);
				} catch (err) {
					return c.json({ error: err.message }, 400);
				}
			}
		}

		// If no keywords or no results found from keyword search, execute base query
		if (!keywords) {
			try {
				const queryResult = await c.env.DB.prepare(sqlQuery)
					.bind(...queryParams)
					.all();
				results = queryResult?.results || [];
				return c.json(results, 200);
			} catch (err) {
				return c.json({ error: err.message }, 400);
			}
		}
	} catch (error) {
		console.error('Error details:', error.stack || error.message || error);
		return c.json({ error: error.message }, 500);
	}
};

export const GetDetails = async (c) => {
	const logData = [];
	try {
		const { selectedEQID } = await c.req.json();

		if (!selectedEQID) {
			logData.push('selectedEQID is required in the request body.');
			return c.json({ message: 'selectedEQID is required in the request body.' }, 400);
		}

		const query = `
        SELECT 
          s.EQID, EQType, MfgEQType, MfgProdLine, MfgProdNo, MfgDesc, 
          Manufacturer, Width, SlotsNeeded
        FROM Search s  
        LEFT JOIN Details d ON d.EQID = s.EQID  
        WHERE s.EQID = ?;
      `;

		const stmt = c.env.DB.prepare(query);
		const row = await stmt.bind(selectedEQID).first();

		if (!row) {
			return c.json({ message: 'No data found for the given EQID.' }, 404);
		}

		return c.json({ message: 'fetch Selected EQID Details', row, logData });
	} catch (err) {
		logData.push(err.message);
		console.error('Error:', err);
		return c.json({ message: 'Internal Server Error', error: err.message, logData }, 500);
	}
};

export const GetRelatedDetails = async (c) => {
	const logData = [];
	try {
		const { selectedEQID } = await c.req.json();

		if (!selectedEQID) {
			return c.json({ message: 'selectedEQID is required in the request body.' }, 400);
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
        FROM ${SearchTable} s  
        LEFT JOIN ${DeviceDetailsTable} d 
          ON d.EQID = s.EQID  
        WHERE s.EQID IN (  
          SELECT json_extract(value, '$.EQIDRelation')
          FROM ${DeviceDetailsTable}, json_each(Details.EQIDRelation)
          WHERE ${DeviceDetailsTable}.EQID = ?
        );
      `;
		console.log('query', query);
		const stmt = c.env.DB.prepare(query);
		console.log('stmt', stmt);
		const rows = await stmt.bind(selectedEQID).all();
		console.log('rows', rows);
		return c.json({ relatedDetails: rows, logData });
	} catch (error) {
		logData.push(`Unexpected error: ${error.message}`);
		console.error('Unexpected error:', error);
		return c.json({ message: 'Internal Server Error', error: error.message, logData }, 500);
	}
};

export const ClearDataBaseTables = async (c) => {
	const logData = [];
	try {
		// Fetch all table names (excluding system tables)
		const tablesQuery =
			"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_kv' AND name NOT LIKE 'sqlite_sequence';";
		const tablesResult = await c.env.DB.prepare(tablesQuery).all();
		const tables = tablesResult.results || [];

		if (!tables.length) {
			return c.json({ message: 'No tables found to clear.', logData }, 200);
		}

		// Create batch operations
		const batchOps = tables.flatMap((table) => [
			c.env.DB.prepare(`DELETE FROM ${table.name};`), // Clear table data
			c.env.DB.prepare(`UPDATE sqlite_sequence SET seq = 0 WHERE name = ?;`).bind(table.name), // Reset auto-increment
		]);

		// Execute batch transaction
		await c.env.DB.batch(batchOps);

		return c.json({ message: 'All tables cleared successfully!', logData }, 200);
	} catch (error) {
		logData.push(`Failed to clear database: ${error.message}`);

		return c.json(
			{
				message: 'Failed to clear database',
				error: error.message,
				logData,
			},
			500
		);
	}
};

export const ExportDataBase = async (c) => {
	const logData = [];
	try {
		// Get all table names
		const tablesQuery =
			"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_kv' AND name NOT LIKE 'sqlite_sequence';";
		const tablesResult = await c.env.DB.prepare(tablesQuery).all();
		const tables = tablesResult.results.map((table) => table.name);

		const date = new Date().toISOString().split('T')[0]; // Format date as YYYY-MM-DD

		// Create a new JSZip instance
		const zip = new JSZip();

		// Fetch table data and add to ZIP
		await Promise.all(
			tables.map(async (table) => {
				const rows = await c.env.DB.prepare(`SELECT * FROM ${table}`).all();
				const jsonData = { [table]: rows.results }; // Table name as key
				zip.file(`${table}.json`, JSON.stringify(jsonData, null, 2)); // Add JSON directly to ZIP
			})
		);

		// Generate the ZIP file
		const zipContent = await zip.generateAsync({ type: 'uint8array' });

		// Set response headers for ZIP file download
		c.header('Content-Disposition', `attachment; filename="database_backup_${date}.zip"`);
		c.header('Content-Type', 'application/zip');

		return new Response(zipContent, { status: 200 });
	} catch (error) {
		console.error('Export error:', error);
		logData.push(`Export error: ${error.message}`);
		return c.json({ message: error.message, logData }, 500);
	}
};

export const ImportDataBase = async (c) => {
	const logData = [];
	const BATCH_SIZE = 200; // Batch size for inserting rows

	try {
		const formData = await c.req.formData();
		const file = formData.get('database');

		if (!file) {
			return c.json({ message: 'No file uploaded' }, 400);
		}

		// Read ZIP file from memory
		const zip = await JSZip.loadAsync(file.arrayBuffer());
		const jsonFiles = Object.keys(zip.files).filter((fileName) => fileName.endsWith('.json'));

		if (jsonFiles.length === 0) {
			logData.push('No JSON files found in ZIP');
			throw new Error('No JSON files found in ZIP');
		}

		// Enable foreign key constraints
		await c.env.DB.prepare('PRAGMA foreign_keys = ON;').run();

		for (const fileName of jsonFiles) {
			const content = JSON.parse(await zip.file(fileName).async('text'));
			const tableName = Object.keys(content)[0]; // Table name
			const rows = content[tableName];

			if (!Array.isArray(rows) || rows.length === 0) {
				logData.push(`No valid data found in ${fileName}`);
				continue;
			}

			// Check if table exists
			const tableExistsQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`;
			const tableExistsResult = await c.env.DB.prepare(tableExistsQuery).bind(tableName).first();
			const tableExists = !!tableExistsResult;

			let createTableQuery = null;

			// Use predefined schema if table matches
			if (!tableExists) {
				if (tableName === DeviceDetailsTable) {
					createTableQuery = `
            CREATE TABLE ${DeviceDetailsTable} (
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
            CREATE INDEX IF NOT EXISTS idx_eqid ON ${DeviceDetailsTable} (EQID);
          `;
				} else if (tableName === RelatedTable) {
					createTableQuery = `
            CREATE TABLE  ${RelatedTable} (
              Manufacturer TEXT NOT NULL,
              RelatedManufacturer TEXT NOT NULL,
              PRIMARY KEY (Manufacturer, RelatedManufacturer)
            );
           CREATE INDEX IF NOT EXISTS idx_related on ${RelatedTable}(Manufacturer);
          `;
				} else if (tableName === SearchTable) {
					createTableQuery = `
            CREATE TABLE  ${SearchTable} (
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
             CREATE INDEX IF NOT EXISTS idx_search_all_columns ON ${SearchTable} (
              EQID, 
              EQType,
              MfgProdLine, 
              MfgProdNo, 
              MfgDesc, 
              Manufacturer, 
              Attrib
            );
          `;
				} else {
					// If table does not exist and not predefined, create dynamically
					const columns = Object.keys(rows[0])
						.map((col) => `${col} TEXT`) // Default type TEXT for unknown tables
						.join(', ');
					createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;
				}

				if (createTableQuery) {
					await c.env.DB.prepare(createTableQuery).run();
					logData.push(`Table ${tableName} created successfully`);
				}
			}

			// Prepare batch insert statement
			const columns = new Set();
			rows.forEach((row) => Object.keys(row).forEach((col) => columns.add(col)));
			const columnList = Array.from(columns);
			const placeholders = columnList.map(() => '?').join(', ');
			const insertQuery = `INSERT OR REPLACE INTO ${tableName} (${columnList.join(', ')}) VALUES (${placeholders})`;

			// Batch insert data
			for (let i = 0; i < rows.length; i += BATCH_SIZE) {
				const batch = rows.slice(i, i + BATCH_SIZE);
				const batchValues = batch.map((row) => columnList.map((col) => (row[col] !== undefined ? row[col] : null)));

				try {
					await c.env.DB.batch(batchValues.map((values) => c.env.DB.prepare(insertQuery).bind(...values)));
					logData.push(`Inserted ${batch.length} records into ${tableName} (Batch: ${i / BATCH_SIZE + 1})`);
				} catch (error) {
					logData.push(`Batch insert error in ${tableName}: ${error.message}`);
				}
			}
		}

		return c.json({ message: 'Database successfully updated!', logData });
	} catch (error) {
		console.error('Import error:', error);
		logData.push(error.message);
		return c.json({ message: 'Failed to import database', error: error.message, logData }, 500);
	}
};
