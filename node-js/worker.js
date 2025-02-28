export default {
    async fetch(request, env) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Account-Id,X-Worker-Name, Authorization',
          },
        });
      }
  
      const url = new URL(request.url);
  
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",  // Allow all origins (change to specific domains for security)
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",  // Allowed methods
        "Access-Control-Allow-Headers": "Authorization,  Content-Type",  // Allowed headers
      };
  
  
      const { headers } = request;
      const authToken = headers.get("Authorization"); // Token passed as "Bearer <token>"
      const accountId = headers.get("X-Account-Id"); // Account ID from frontend
      const workerName = headers.get("X-Worker-Name");// Worker Name 
  
      if (!authToken || !accountId) {
        return new Response(JSON.stringify({ error: "Missing authentication details" }), { status: 401, headers: corsHeaders });
      }
      // Validate token and account ID
      const isValid = await validateToken(authToken, accountId);
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid token or account ID" }), { status: 403, headers: corsHeaders });
      }
      const auth = { authToken, accountId, workerName }
  
  
  
      if (request.method === 'POST') {
  
        if (url.pathname === '/bind-database') {
          return bindDatabase(request, env, auth);
        }
  
        if (url.pathname === '/unbind-database') {
          return unbindDatabase(request, env, auth);
        }
  
        if (url.pathname === '/equipment') {
          return await EquipmentType({ req: request, env, auth });
        }
        if (url.pathname === '/selected_manufacturer') {
          return await SelectedManufacturer(request, env, auth);
        }
  
        if (url.pathname === '/manufacturer') {
          return ManufacturerSearch(request, env, auth);
        }
        if (url.pathname === '/database/create') {
          return createDatabase(request, auth);
        }
        if (url.pathname === '/database-upload-json') {
          return uploadJsonDatabase(request, env, auth);
        }
        if (url.pathname === '/database-download-json') {
          return downloadJsonDatabase(request, env, auth);
        }
        if (url.pathname === '/backup/initiate') {
          return DatabaseBackupInitiate(request, env, auth)
        }
        if (url.pathname === "/purge-tables") {
  
          return RemoveAllTables(request, env, auth);
        }
  
      }
      if (request.method === 'GET') {
  
  
  
  
        if (url.pathname === '/databases') {
          return listDatabases(auth);
        }
        if (url.pathname === '/binding') {
  
          return AttachDatabaseInfo(auth)
        }
  
  
  
  
  
      }
  
      if (request.method === 'DELETE') {
        const match = url.pathname.match(/^\/database\/([^/]+)$/)
  
        if (match) {
          const databaseId = match[1]; // Extracted database ID
          return deleteDatabase(request, databaseId, auth);
        }
  
  
  
      }
  
      return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
    }
  };
  
  const HandleSearchWord = async (word) => {
    const Sword = await word.trim().split(/\s+/).map((word) => word.replace(/'/g, "''"));
    return Sword;
  }
  
  
  export function sanitize(value) {
    if (value === undefined || value === null) return "NULL"; // Use "NULL" for SQL
    if (typeof value === 'string') {
      return value.replace(/'/g, "''");
    }
    return value;
  }
  
  
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true', // Ensures CORS works with credentials
    'Content-Type': 'application/json'
  };
  
  
  // const worker_name = "workers"
  // const account_id = "dd9b190e5bb824e610cd76610082c40b"  // Replace with your account ID
  // const api_token = "KmIs29SB_Ef3ZZ7oNy9RDPRwuLRf0KVvTE6z1Q5J"  // Replace with your API token
  // const workers_api_url = `https://api.cloudflare.com/client/v4/accounts/${account_id}/workers/scripts/${worker_name}`
  // const api_url = `https://api.cloudflare.com/client/v4/accounts/${account_id}`
  
  
  
  
  
  /**
   * Validate the token and check if it belongs to the given account.
   */
  async function validateToken(token, accountId) {
  
    console.log("AUTH DEtail==>", token, accountId)
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}`, {
      method: "GET",
      headers: {
        "Authorization": `${token}`,
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    console.log("is auth data==>", data)
    return data.success; // If the API call succeeds, the token is valid for the given account.
  }
  
  
  const ManufacturerSearch = async (request, env, auth) => {
    try {
      if (!auth.workerName) {
        return new Response(JSON.stringify({ error: 'Worker Name Not Found! ' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
      // Parse the request body
      const body = await request.json().catch(() => null);
  
      console.log('Request Body:', body);
  
      const { search, condition } = body || {};
      const queryCondition = condition || 'OR'; // Default to 'OR' if no condition is provided
  
  
      // Fetch current bindings
      const bindingResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/workers/scripts/${auth.workerName}/bindings`, {
        method: 'GET',
        headers: {
          ...corsHeaders,
          "Authorization": `${auth.authToken}`
        }
      });
  
      if (!bindingResponse.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch existing bindings.' }), {
          status: bindingResponse.status,
          headers: corsHeaders
        });
      }
  
      const existingBindings = await bindingResponse.json();
      console.log('Existing bindings:', existingBindings);
  
      // Check if the specific database is bound
      const targetBinding = await existingBindings.result.find(binding =>
        binding.type === 'd1'
      );
      // Check if any binding exists
      if (!targetBinding) {
        return new Response(JSON.stringify({ error: 'No bindings found for this worker.' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
  
      console.log(targetBinding)
  
  
  
  
      if (!search) {
        const sqlQuery = `SELECT DISTINCT Manufacturer FROM search ORDER BY Manufacturer ASC`;
        console.log('Without Search Query ==>', sqlQuery);
  
        try {
          const queryResult = await env.DB.prepare(sqlQuery).all();
  
          console.log(queryResult);
          const results = queryResult?.results || [];
          if (results.length !== 0) {
            const manufacturers = results.map((row) => row.Manufacturer);
            // Add CORS headers allowing all origins
            return new Response(JSON.stringify({ manufacturers, totalManufacturer: manufacturers.length }), {
              status: 200,
              headers: corsHeaders
            });
          }
        } catch (err) {
          throw new Error(`${err}`);
        }
      }
  
      const HandleSearchWord = async (word) => {
        const Sword = await word.trim().split(/\s+/).map((word) => word.replace(/'/g, "''"));
        return Sword;
      }
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
        const sqlQuery = `SELECT DISTINCT Manufacturer FROM search WHERE ${sqlCondition} ORDER BY Manufacturer ASC`;
        console.log('SQL Query:', sqlQuery);
  
        // Execute the query
        const queryResult = await env.DB.prepare(sqlQuery).all();
        results = queryResult?.results || [];
  
        if (results.length > 0) {
          // Break loop if results are found
          manufacturers = results.map((row) => row.Manufacturer);
          break;
        }
      }
  
      // Return results if any, else return empty response
      if (manufacturers.length === 0) {
        return new Response(JSON.stringify({ manufacturers: [], totalManufacturer: 0 }), {
          status: 200,
          headers: corsHeaders
        });
      }
  
      // Add CORS headers to the final response
      return new Response(JSON.stringify({ manufacturers, totalManufacturer: manufacturers.length }), {
        status: 200,
        headers: corsHeaders
      });
    } catch (error) {
      console.error('Error:', error.stack || error.message || error);
  
      // Add CORS headers in case of error
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  };
  
  const EquipmentType = async (c) => {
    try {
      const body = await c.req.json();
      const { Manufacturer, keywords, condition, isRelated } = body || {};
      console.log('Request Body equipment:', { Manufacturer, keywords, condition, isRelated });
  
      if (!Manufacturer) {
        return new Response(JSON.stringify({ error: 'Manufacturer is required.' }), { status: 400, headers: corsHeaders });
      }
  
      let results = [];
      const validCondition = condition === 'OR' ? 'OR' : 'AND';
      let manufacturers = [Manufacturer];
  
      // Fetch related manufacturers if `isRelated` is true
      if (isRelated) {
        try {
          const relatedQuery = `SELECT DISTINCT RelatedManufacturer FROM Related WHERE Manufacturer = ?`;
          const relatedManufacturers = await c.env.DB.prepare(relatedQuery).bind(Manufacturer).all();
  
          if (relatedManufacturers?.results?.length > 0) {
            manufacturers.push(...relatedManufacturers.results.map((row) => row.RelatedManufacturer));
          }
        } catch (err) {
          return new Response(JSON.stringify({ error: `Error fetching Related manufacturers: ${err.message}` }), { status: 400, headers: corsHeaders });
        }
      }
  
      // Search without keywords
      if (!keywords?.trim()) {
        const sqlQuery = `
                SELECT DISTINCT EQType, MfgProdLine, MfgProdNo
                FROM Search
                WHERE Manufacturer IN (${manufacturers.map(() => '?').join(',')})
                ORDER BY EQType ASC
              `;
  
        const queryResult = await c.env.DB.prepare(sqlQuery).bind(...manufacturers).all();
        results = queryResult?.results || [];
  
        return new Response(JSON.stringify(results.length ? results : { message: 'No related equipment found.' }), { status: 200, headers: corsHeaders });
      }
  
      // Keyword-based search
      const words = await HandleSearchWord(keywords);
      const queryStrategies = [(w) => `${w}%`, (w) => `%${w}`, (w) => `%${w}%`];
  
      for (const strategy of queryStrategies) {
        const conditions = words.map(
          (word) => `
                  (EQID LIKE '${strategy(word)}' OR 
                  MfgAcronym LIKE '${strategy(word)}' OR 
                  EQType LIKE '${strategy(word)}' OR 
                  MfgProdLine LIKE '${strategy(word)}' OR 
                  MfgProdNo LIKE '${strategy(word)}' OR 
                  MfgDesc LIKE '${strategy(word)}' OR 
                  Manufacturer LIKE '${strategy(word)}')`
        ).join(` ${validCondition} `);
  
        const sqlQuery = `
                SELECT DISTINCT EQType, MfgProdLine, MfgProdNo
                FROM Search
                WHERE Manufacturer IN (${manufacturers.map(() => '?').join(',')})
                AND (${conditions})
                ORDER BY EQType ASC
              `;
  
        const queryResult = await c.env.DB.prepare(sqlQuery).bind(...manufacturers).all();
        results = queryResult?.results || [];
  
        if (results.length > 0) {
          return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
        }
      }
  
      return new Response(JSON.stringify({ message: 'No matching equipment found.' }), { status: 200, headers: corsHeaders });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: 'Server error. Check logs for details.' }), { status: 500, headers: corsHeaders });
    }
  };
  
  const SelectedManufacturer = async (request, env, auth) => {
    try {
      const body = await request.json();
      const {
        selectedManufacturer = '',
        selectedEquipmentType = '',
        selectedProductLine = '',
        selectedProductNumber = '',
        keywords = '',
        condition = 'OR',
        isRelated = false,
        filterAttribute: attribute = 0
      } = body;
  
      if (!selectedManufacturer) {
        return new Response(JSON.stringify({ error: 'Manufacturer is required.' }), { status: 400, headers: corsHeaders });
      }
  
      let manufacturers = [selectedManufacturer];
  
      // Fetch related manufacturers if `isRelated` is true
      if (isRelated) {
        try {
          const relatedQuery = `SELECT DISTINCT RelatedManufacturer FROM Related WHERE Manufacturer = ?`;
          const relatedManufacturers = await env.DB.prepare(relatedQuery).bind(selectedManufacturer).all();
  
          if (relatedManufacturers?.results?.length > 0) {
            manufacturers.push(...relatedManufacturers.results.map((row) => row.RelatedManufacturer));
          }
        } catch (err) {
          return new Response(JSON.stringify({ error: `Error fetching related manufacturers: ${err.message}` }), { status: 400, headers: corsHeaders });
        }
      }
  
      // Base SQL query
      let sqlQuery = `
              SELECT DISTINCT EQID, Manufacturer, EQType, MfgProdLine, MfgProdNo
              FROM Search
              WHERE Manufacturer IN (${manufacturers.map(() => '?').join(',')})
            `;
  
      // Prepare query parameters
      const queryParams = [...manufacturers];
  
      // Add conditions for other filters
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
      if (attribute) {
        sqlQuery += ` AND attrib = ?`;
        queryParams.push(attribute);
      }
  
      let results = [];
  
      // Handle keyword-based search if provided
      if (keywords.trim()) {
        const words = await HandleSearchWord(keywords);
  
        // Define query strategies
        const queryStrategies = [
          (word) => `${word}%`,
          (word) => `%${word}`,
          (word) => `%${word}%`
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
          const fullQuery = `${sqlQuery} AND (${combinedConditions})`;
  
          try {
            const queryResult = await env.DB.prepare(fullQuery).bind(...queryParams).all();
            results = queryResult?.results || [];
  
            if (results.length > 0) {
              return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
            }
  
            // If the loop finishes without returning, provide an empty response
            return new Response(JSON.stringify({ message: "No results found." }), { status: 200, headers: corsHeaders });
  
          } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
          }
        }
      }
  
      // If no keywords or results, execute base query
      if (!keywords) {
        try {
          const queryResult = await env.DB.prepare(sqlQuery).bind(...queryParams).all();
          results = queryResult?.results || [];
          return new Response(JSON.stringify(results), { status: 200, headers: corsHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
        }
      }
    } catch (error) {
      console.error('Error details:', error.stack || error.message || error);
      return new Response(JSON.stringify({ error: 'Internal server error.' }), { status: 500, headers: corsHeaders });
    }
  };
  
  
  const GetDetails = async (c) => {
    const logData = [];
    try {
      const { selectedEQID } = await c.req.json();
  
      if (!selectedEQID) {
        logData.push('selectedEQID is required in the request body.');
        return new Response(JSON.stringify({ message: 'selectedEQID is required in the request body.' }), { status: 400, headers: corsHeaders });
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
        return new Response(JSON.stringify({ message: 'No data found for the given EQID.' }), { status: 404, headers: corsHeaders });
      }
  
      return new Response(JSON.stringify({ message: 'Fetched selected EQID details', row, logData }), { status: 200, headers: corsHeaders });
    } catch (err) {
      logData.push(err.message);
      console.error('Error:', err);
      return new Response(JSON.stringify({ message: 'Internal Server Error', error: err.message, logData }), { status: 500, headers: corsHeaders });
    }
  };
  
  
  const GetRelatedDetails = async (c) => {
    const logData = [];
    try {
      const { selectedEQID } = await c.req.json();
  
      if (!selectedEQID) {
        return new Response(JSON.stringify({ message: 'selectedEQID is required in the request body.' }), { status: 400, headers: corsHeaders });
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
                FROM Details , json_each(Details.EQIDRelation)
                WHERE Details.EQID = ?
              );
            `;
  
      const stmt = c.env.DB.prepare(query);
      const rows = await stmt.bind(selectedEQID).all();
  
      return new Response(JSON.stringify({ relatedDetails: rows, logData }), { status: 200, headers: corsHeaders });
    } catch (error) {
      logData.push(`Unexpected error: ${error.message}`);
      console.error('Unexpected error:', error);
      return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message, logData }), { status: 500, headers: corsHeaders });
    }
  };
  
  
  
  
  
  async function bindDatabase(request, env, auth) {
    try {
      const { database_id } = await request.json();
      console.log(database_id)
      if (!database_id) {
        return new Response(JSON.stringify({ error: 'database_id is required in the request body.' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
      if (!auth.workerName) {
        return new Response(JSON.stringify({ error: 'Worker Name Not Found! ' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
      // Fetch current bindings
      const bindingResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/workers/scripts/${auth.workerName}/bindings`, {
        method: 'GET',
        headers: {
          ...corsHeaders,
          "Authorization": `${auth.authToken}`
        }
      });
      console.log(bindingResponse)
      if (!bindingResponse.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch existing bindings.' }), {
          status: bindingResponse.status,
          headers: corsHeaders
        });
      }
  
      const existingBindings = await bindingResponse.json();
      console.log('Existing bindings:', existingBindings);
  
      // Check if the database is already bound
      const isAlreadyBound = await existingBindings.result?.some(binding =>
        binding.type === 'd1' && binding.id == database_id
      );
  
      if (isAlreadyBound) {
        return new Response(JSON.stringify({ error: 'Database already bound with this database' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
  
  
  
  
  
      // Fetch the existing worker script content
      const scriptResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/workers/scripts/${auth.workerName}`, {
        method: 'GET',
        headers: {
          "Authorization": `${auth.authToken}`
        }
      });
  
      if (scriptResponse.status !== 200) {
        const errorContent = await scriptResponse.text();
        return new Response(JSON.stringify({ error: `Error fetching worker script: ${errorContent}` }), {
          status: scriptResponse.status,
          headers: corsHeaders
        });
      }
  
  
      let existing_script = await scriptResponse.text();
      if (!existing_script) {
        return new Response(JSON.stringify({ error: 'No existing script found.' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
      // Extract script properly
      const startIndex = existing_script.indexOf("export default {");
      if (startIndex !== -1) {
        existing_script = existing_script.substring(startIndex);
      } else {
        return new Response(JSON.stringify({ error: 'Invalid script format. No "export default" found.' }), {
          status: 400,
          headers: corsHeaders
        });
      }
      // Find the last occurrence of '}' and trim everything after it
      const lastIndex = existing_script.lastIndexOf("}");
      if (lastIndex !== -1) {
        existing_script = existing_script.substring(0, lastIndex + 1);
      }
  
      let binding_data;
  
      binding_data = {
        "main_module": "worker.js",
        "type": "javascript",
        "bindings": [
          {
            "type": "d1",
            "name": "DB",
            "id": database_id
          },
          {
            "type": "r2_bucket",
            "name": "MY_BUCKET",
            "bucket_name": "dharvee"
          }
        ]
  
  
      }
  
      console.log(existing_script)
      const formData = new FormData();
      formData.append("metadata", new Blob([JSON.stringify(binding_data)], { type: "application/json" }), "metadata.json");
      formData.append("script", new Blob([existing_script], { type: "application/javascript+module" }), "worker.js");
  
      // Update Worker with new bindings
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/workers/scripts/${auth.workerName}`, {
        method: 'PUT',
        headers: {
          "Authorization": `${auth.authToken}`
        },
        body: formData
      });
  
      const responseBody = await response.json();
      if (response.status === 200) {
        return new Response(JSON.stringify({ message: "D1 Database bound successfully to the Worker!", existingBindings }), {
          status: 200,
          headers: corsHeaders
        });
      } else {
        return new Response(JSON.stringify({ error: responseBody }), {
          status: response.status,
          headers: corsHeaders
        });
      }
    } catch (error) {
      console.error('Error:', error.stack || error.message || error);
      return new Response(JSON.stringify({ error: 'Server error. Check logs for details.' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
  
  
  
  async function listDatabases(auth) {
    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/d1/database`, {
        method: 'GET',
        headers: {
          "Authorization": `${auth.authToken}`,
          "Content-Type": "application/json"
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({ error: `Failed to fetch databases: ${errorText}` }), {
          status: response.status,
          headers: corsHeaders
        });
      }
  
      const responseBody = await response.json();
  
      const databases = await responseBody.result
        .map(db => ({
          id: db.uuid,
          name: db.name
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sorting by name
  
      return new Response(JSON.stringify({ databases, total: databases.length }), {
        status: 200,
        headers: corsHeaders
      });
  
    } catch (error) {
      console.error('Error:', error.stack || error.message || error);
      return new Response(JSON.stringify({ error: 'Server error. Check logs for details.' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
  
  
  async function deleteDatabase(request, databaseId, auth) {
  
  
    if (!databaseId) {
      return new Response(JSON.stringify({ error: "databaseId is required in the request body." }), {
        status: 400,
        headers: corsHeaders
      });
    }
  
  
  
    try {
      const deleteUrl = `https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/d1/database/${databaseId}`;
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          "Authorization": `${auth.authToken}`,
          "Content-Type": "application/json"
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({ error: `Failed to delete database: ${errorText}` }), {
          status: response.status,
          headers: corsHeaders
        });
      }
  
      return new Response(JSON.stringify({ message: `Database ${databaseId} deleted successfully.` }), {
        status: 200,
        headers: corsHeaders
      });
  
    } catch (error) {
      console.error('Error:', error.stack || error.message || error);
      return new Response(JSON.stringify({ error: 'Server error. Check logs for details.' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
  
  
  
  
  
  async function createDatabase(request, auth) {
    try {
      const body = await request.json().catch(() => null);
      if (!body || !body.name) {
        return new Response(JSON.stringify({ error: "Database name is required in the request body." }), {
          status: 400,
          headers: corsHeaders,
        });
      }
  
      const databaseName = body.name;
  
      // Step 1: Create a new D1 database
      const createDbResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/d1/database`, {
        method: 'POST',
        headers: {
          "Authorization": `${auth.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: databaseName }),
      });
  
      if (!createDbResponse.ok) {
        const errorText = await createDbResponse.text();
        return new Response(JSON.stringify({ error: `Failed to create database: ${errorText}` }), {
          status: createDbResponse.status,
          headers: corsHeaders,
        });
      }
  
      const dbResult = await createDbResponse.json();
  
      console.log("dbResult", dbResult)
      const databaseId = dbResult.result.uuid; // Extract the newly created DB ID
  
      // Step 2: Execute Queries to Create Tables
      const createTablesQuery = `
          CREATE TABLE IF NOT EXISTS Related (
            Manufacturer TEXT NOT NULL,
            RelatedManufacturer TEXT NOT NULL,
            PRIMARY KEY (Manufacturer, RelatedManufacturer)
          );
    
          CREATE INDEX IF NOT EXISTS idx_related_manufacturer ON Related (Manufacturer);
    
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
    
          CREATE INDEX IF NOT EXISTS idx_search_all ON Search (
            EQID, MfgAcronym, EQType, MfgEQType, MfgProdLine, MfgProdNo, MfgDesc, Manufacturer, Attrib
          );
    
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
    
          CREATE INDEX IF NOT EXISTS idx_details_eqid ON Details (EQID);
        `;
  
      // Execute SQL statements using Cloudflare's `exec` API
      const execQueryResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/d1/database/${databaseId}/query`, {
        method: 'POST',
        headers: {
          "Authorization": `${auth.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: createTablesQuery }),
      });
  
      if (!execQueryResponse.ok) {
        const errorText = await execQueryResponse.text();
        return new Response(JSON.stringify({ error: `Failed to create tables: ${errorText}` }), {
          status: execQueryResponse.status,
          headers: corsHeaders,
        });
      }
  
      return new Response(
        JSON.stringify({
          message: `Database '${databaseName}' created successfully and tables initialized.`,
          databaseId: databaseId,
        }),
        { status: 200, headers: corsHeaders }
      );
  
    } catch (error) {
      console.error('Error:', error.stack || error.message || error);
      return new Response(JSON.stringify({ error: 'Server error. Check logs for details.' }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }
  
  
  
  
  
  
  
  async function unbindDatabase(request, env, auth) {
    try {
  
      if (!auth.workerName) {
        return new Response(JSON.stringify({ error: 'Worker Name Not Found! ' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
  
  
      // Fetch current bindings
      const bindingResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/workers/scripts/${auth.workerName}/bindings`, {
        method: 'GET',
        headers: {
          ...corsHeaders,
          "Authorization": `${auth.authToken}`
        }
      });
  
      if (!bindingResponse.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch existing bindings.' }), {
          status: bindingResponse.status,
          headers: corsHeaders
        });
      }
  
      const existingBindings = await bindingResponse.json();
      console.log('Existing bindings:', existingBindings);
  
      // Check if the specific database is bound
      const targetBinding = await existingBindings.result.find(binding =>
        binding.type === 'd1'
      );
      // Check if any binding exists
      if (!targetBinding) {
        return new Response(JSON.stringify({ error: 'No bindings found for this worker.' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
  
      console.log(targetBinding)
  
  
  
  
  
      // Fetch the existing worker script content
      const scriptResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/workers/scripts/${auth.workerName}`, {
        method: 'GET',
        headers: {
          "Authorization": `${auth.authToken}`
        }
      });
  
      if (scriptResponse.status !== 200) {
        const errorContent = await scriptResponse.text();
        return new Response(JSON.stringify({ error: `Error fetching worker script: ${errorContent}` }), {
          status: scriptResponse.status,
          headers: corsHeaders
        });
      }
  
  
      let existing_script = await scriptResponse.text();
      if (!existing_script) {
        return new Response(JSON.stringify({ error: 'No existing script found.' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
      // Extract script properly
      const startIndex = existing_script.indexOf("export default {");
      if (startIndex !== -1) {
        existing_script = existing_script.substring(startIndex);
      } else {
        return new Response(JSON.stringify({ error: 'Invalid script format. No "export default" found.' }), {
          status: 400,
          headers: corsHeaders
        });
      }
      // Find the last occurrence of '}' and trim everything after it
      const lastIndex = existing_script.lastIndexOf("}");
      if (lastIndex !== -1) {
        existing_script = existing_script.substring(0, lastIndex + 1);
      }
  
      let binding_data;
  
      binding_data = {
        "main_module": "worker.js",
        "type": "javascript",
        "bindings": [
  
          {
            "type": "r2_bucket",
            "name": "MY_BUCKET",
            "bucket_name": "dharvee"
          }
        ]
  
  
      }
  
  
      console.log(existing_script)
      const formData = new FormData();
      formData.append("metadata", new Blob([JSON.stringify(binding_data)], { type: "application/json" }), "metadata.json");
      formData.append("script", new Blob([existing_script], { type: "application/javascript+module" }), "worker.js");
  
      // Update Worker with new bindings
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/workers/scripts/${auth.workerName}`, {
        method: 'PUT',
        headers: {
          "Authorization": `${auth.authToken}`
        },
        body: formData
      });
  
      const responseBody = await response.json();
      if (response.status === 200) {
        return new Response(JSON.stringify({ message: "D1 Database detach successfully from the Worker!", targetBinding }), {
          status: 200,
          headers: corsHeaders
        });
      } else {
        return new Response(JSON.stringify({ error: responseBody }), {
          status: response.status,
          headers: corsHeaders
        });
      }
    } catch (error) {
      console.error('Error:', error.stack || error.message || error);
      return new Response(JSON.stringify({ error: 'Server error. Check logs for details.' }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
  
  
  
  
  
  
  
  
  
  
  function convertJsonToSql(jsonData) {
    let sqlCommands = "";
    for (const [tableName, rows] of Object.entries(jsonData)) {
      if (!Array.isArray(rows)) {
        throw new Error(`Invalid JSON format: ${tableName} should be an array of rows`);
      }
      for (const row of rows) {
        const columns = Object.keys(row).join(", ");
        const values = Object.values(row)
          .map(value => {
            if (typeof value === "string") {
              return `'${value.replace(/'/g, "''")}'`;
            } else if (value === null || value === undefined) {
              return "NULL";
            } else {
              return value;
            }
          })
          .join(", ");
        sqlCommands += `INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${values});\n`;
      }
    }
    return sqlCommands;
  }
  
  
  
  async function uploadJsonDatabase(request, env, auth) {
    try {
  
      if (!auth.workerName) {
        return new Response(JSON.stringify({ error: 'Worker Name Not Found! ' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
      // Log the request size for debugging
      const contentLength = request.headers.get("content-length");
      console.log(`Request size: ${contentLength} bytes`);
  
      // Check for size limit - Cloudflare has a 100MB limit
      if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024) {
        return new Response(JSON.stringify({
          success: false,
          error: "Request exceeds the 100MB size limit",
          size: `${(parseInt(contentLength) / (1024 * 1024)).toFixed(2)}MB`
        }), {
          status: 413, // Payload Too Large
          headers: corsHeaders
        });
      }
  
      let database_id;
      let combinedSql = "";
  
      // Check if the request is multipart/form-data
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        try {
          const formData = await request.formData();
  
          // Log all received keys for debugging
          const receivedKeys = [];
          for (const [key, _] of formData.entries()) {
            receivedKeys.push(key);
          }
          console.log(`Received form data keys: ${receivedKeys.join(', ')}`);
  
          // Fetch current bindings
          try {
            const bindingResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/workers/scripts/${auth.workerName}/bindings`, {
              method: 'GET',
              headers: {
                ...corsHeaders,
                "Authorization": `${auth.authToken}`
              }
            });
  
            if (!bindingResponse.ok) {
              return new Response(JSON.stringify({
                error: 'Failed to fetch bindings',
                status: bindingResponse.status,
                statusText: bindingResponse.statusText
              }), {
                status: bindingResponse.status,
                headers: corsHeaders
              });
            }
  
            const existingBindings = await bindingResponse.json();
            console.log('Bindings fetched successfully');
  
            // Find D1 database binding
            const targetBinding = existingBindings.result.find(binding => binding.type === 'd1');
            if (!targetBinding) {
              return new Response(JSON.stringify({ error: 'No D1 database bindings found' }), {
                status: 400,
                headers: corsHeaders
              });
            }
  
            database_id = targetBinding.id;
            console.log(`Using database ID: ${database_id}`);
          } catch (bindingError) {
            console.error('Error fetching bindings:', bindingError);
            return new Response(JSON.stringify({
              error: 'Error fetching database bindings',
              details: bindingError.message
            }), {
              status: 500,
              headers: corsHeaders
            });
          }
  
          // Process the JSON files
          let fileFound = false;
          let totalDataSize = 0;
  
          for (const [key, value] of formData.entries()) {
            console.log(`Processing form entry: ${key}`);
  
            let textContent = "";
  
            try {
              if (value && typeof value.arrayBuffer === "function") {
                const fileSize = value.size;
                totalDataSize += fileSize;
  
                console.log(`File ${key} size: ${(fileSize / 1024).toFixed(2)}KB`);
  
                if (totalDataSize > 95 * 1024 * 1024) { // 95MB limit to be safe
                  return new Response(JSON.stringify({
                    error: "Combined data size exceeds safe limit",
                    size: `${(totalDataSize / (1024 * 1024)).toFixed(2)}MB`
                  }), {
                    status: 413,
                    headers: corsHeaders
                  });
                }
  
                textContent = await value.text();
                fileFound = true;
              } else if (typeof value === "string") {
                textContent = value;
                fileFound = true;
              }
  
              if (textContent) {
                let jsonData;
                try {
                  jsonData = JSON.parse(textContent);
                  combinedSql += convertJsonToSql(jsonData) + "\n";
                  console.log(`Successfully processed JSON data for ${key}`);
                } catch (jsonError) {
                  console.error(`JSON parsing error for ${key}:`, jsonError);
                  return new Response(JSON.stringify({
                    error: `Invalid JSON format in ${key}`,
                    details: jsonError.message
                  }), {
                    status: 400,
                    headers: corsHeaders
                  });
                }
              }
            } catch (fileError) {
              console.error(`Error processing file ${key}:`, fileError);
              return new Response(JSON.stringify({
                error: `Error processing file ${key}`,
                details: fileError.message
              }), {
                status: 500,
                headers: corsHeaders
              });
            }
          }
  
          if (!fileFound) {
            return new Response(JSON.stringify({
              error: "No valid JSON files provided",
              receivedKeys
            }), {
              status: 400,
              headers: corsHeaders
            });
          }
        } catch (formDataError) {
          console.error('Error processing form data:', formDataError);
          return new Response(JSON.stringify({
            error: 'Failed to process form data',
            details: formDataError.message
          }), {
            status: 500,
            headers: corsHeaders
          });
        }
      } else {
        // Handle non-multipart requests (your existing code)
        try {
          const body = await request.json();
          database_id = body.database_id;
  
          if (body.json_files && Array.isArray(body.json_files)) {
            for (const jsonData of body.json_files) {
              combinedSql += convertJsonToSql(jsonData) + "\n";
            }
          } else if (body.json_file && typeof body.json_file === "object") {
            combinedSql = convertJsonToSql(body.json_file);
          } else if (body.sql_file) {
            combinedSql = body.sql_file;
          } else {
            return new Response(JSON.stringify({
              error: "JSON body must contain 'json_file' or 'json_files' field"
            }), {
              status: 400,
              headers: corsHeaders
            });
          }
        } catch (bodyError) {
          console.error('Error parsing request body:', bodyError);
          return new Response(JSON.stringify({
            error: 'Failed to parse request body',
            details: bodyError.message
          }), {
            status: 400,
            headers: corsHeaders
          });
        }
      }
  
      // Check SQL data size
      const fileData = new TextEncoder().encode(combinedSql);
      const sqlSize = fileData.length;
      console.log(`Generated SQL size: ${(sqlSize / 1024).toFixed(2)}KB`);
  
      if (sqlSize > 95 * 1024 * 1024) { // 95MB safety limit
        return new Response(JSON.stringify({
          error: "Generated SQL data exceeds size limit",
          size: `${(sqlSize / (1024 * 1024)).toFixed(2)}MB`
        }), {
          status: 413,
          headers: corsHeaders
        });
      }
  
      if (!fileData.length) {
        return new Response(JSON.stringify({ error: "Failed to generate SQL content" }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
      // Your existing code for MD5 hash calculation and import process...
      try {
        // Calculate MD5 hash
        const hashBuffer = await crypto.subtle.digest("MD5", fileData);
        const etagHex = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");
        console.log("File etag generated");
  
        // Initialize import
        const initResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/d1/database/${database_id}/import`,
          {
            method: "POST",
            headers: {
              'Authorization': `${auth.authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: "init",
              etag: etagHex
            })
          }
        );
  
        if (!initResponse.ok) {
          const errorText = await initResponse.text();
          console.error("Import initialization failed:", errorText);
          return new Response(JSON.stringify({
            error: "Failed to initialize import",
            status: initResponse.status,
            details: errorText
          }), {
            status: initResponse.status,
            headers: corsHeaders
          });
        }
  
        const initData = await initResponse.json();
        console.log("Import initialized successfully");
  
        // Handle different response scenarios as in your original code
        if (initData.result?.status === "complete") {
          return new Response(JSON.stringify({
            success: true,
            message: "Files  imported successfully",
            status: "complete",
            details: initData.result
          }), {
            status: 200,
            headers: corsHeaders
          });
        }
  
        if (initData.result?.upload_url) {
          try {
            // Upload SQL file
            const uploadResponse = await fetch(initData.result.upload_url, {
              method: "PUT",
              headers: { "Content-Type": "application/sql" },
              body: fileData
            });
  
            if (!uploadResponse.ok) {
              const errorText = await uploadResponse.text();
              console.error("File upload failed:", errorText);
              return new Response(JSON.stringify({
                error: "Failed to upload SQL file",
                status: uploadResponse.status,
                details: errorText
              }), {
                status: uploadResponse.status,
                headers: corsHeaders
              });
            }
  
            console.log("SQL file uploaded successfully");
  
            // Trigger ingest process
            const ingestResponse = await fetch(
              `https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/d1/database/${database_id}/import`,
              {
                method: "POST",
                headers: {
                  'Authorization': `${auth.authToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  action: "ingest",
                  etag: etagHex,
                  filename: initData.result.filename
                })
              }
            );
  
            if (!ingestResponse.ok) {
              const errorText = await ingestResponse.text();
              console.error("Ingest process failed:", errorText);
              return new Response(JSON.stringify({
                error: "Failed to start import ingest",
                status: ingestResponse.status,
                details: errorText
              }), {
                status: ingestResponse.status,
                headers: corsHeaders
              });
            }
  
            const ingestData = await ingestResponse.json();
            console.log("Ingest process started successfully");
  
            if (!ingestData.success) {
              return new Response(JSON.stringify({
                error: "Import started but reported failure",
                details: ingestData
              }), {
                status: 500,
                headers: corsHeaders
              });
            }
  
            return new Response(JSON.stringify({
              success: true,
              message: "Files imported successfully",
              status: "in_progress",
              bookmark: ingestData.result?.at_bookmark,
              details: ingestData.result
            }), {
              status: 202,
              headers: corsHeaders
            });
          } catch (uploadError) {
            console.error("Error during file upload or ingest:", uploadError);
            return new Response(JSON.stringify({
              error: "Error during file upload or ingest process",
              details: uploadError.message
            }), {
              status: 500,
              headers: corsHeaders
            });
          }
        } else if (initData.result?.at_bookmark) {
          return new Response(JSON.stringify({
            success: true,
            message: "File Import Successfully",
            status: "in_progress",
            bookmark: initData.result.at_bookmark,
            details: initData.result
          }), {
            status: 202,
            headers: corsHeaders
          });
        } else {
          return new Response(JSON.stringify({
            error: "Unexpected response from import initialization",
            details: initData
          }), {
            status: 500,
            headers: corsHeaders
          });
        }
      } catch (importError) {
        console.error("Error during import process:", importError);
        return new Response(JSON.stringify({
          error: "Error during database import process",
          details: importError.message
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    } catch (error) {
      console.error("Unhandled error in uploadJsonDatabase:", error);
      return new Response(JSON.stringify({
        success: false,
        error: "Server error processing your request",
        details: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
  
  
  
  
  
  
  
  
  async function RemoveAllTables(request, env, auth) {
    try {
  
      if (!auth.workerName) {
        return new Response(JSON.stringify({ error: 'Worker Name Not Found! ' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
      let database_id;
  
  
      // Fetch current bindings
      const bindingResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/workers/scripts/${auth.workerName}/bindings`, {
        method: 'GET',
        headers: {
          ...corsHeaders,
          "Authorization": `${auth.authToken}`
        }
      });
  
      if (!bindingResponse.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch existing bindings.' }), {
          status: bindingResponse.status,
          headers: corsHeaders
        });
      }
  
      const existingBindings = await bindingResponse.json();
      console.log('Existing bindings:', existingBindings);
  
      // Check if the specific database is bound
      const targetBinding = await existingBindings.result.find(binding =>
        binding.type === 'd1'
      );
      // Check if any binding exists
      if (!targetBinding) {
        return new Response(JSON.stringify({ error: 'No bindings found for this worker.' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
      database_id = await targetBinding.id
      console.log(targetBinding)
  
      // Fetch table names
      const getTablesResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/d1/database/${database_id}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `${auth.authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sql: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_KV' AND name NOT LIKE 'prefix%';",
          }),
        }
      );
  
      const tablesData = await getTablesResponse.json();
      if (!getTablesResponse.ok || !tablesData.result || !tablesData.result[0]?.results.length) {
        return new Response(JSON.stringify({ message: "No tables found" }), {
          status: 404,
          headers: corsHeaders,
        });
      }
  
      const tables = tablesData.result[0].results;
      const deletedTables = [];
  
      for (const table of tables) {
        const tableName = table.name;
  
        // Drop the table
        const dropTableResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/d1/database/${database_id}/query`,
          {
            method: "POST",
            headers: {
              Authorization: `${auth.authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sql: `DELETE FROM ${tableName};` }),
          }
        );
  
        const dropTableData = await dropTableResponse.json();
        if (dropTableResponse.ok) {
          deletedTables.push(tableName);
        } else {
          console.error(`Failed to delete table ${tableName}:`, dropTableData);
        }
      }
  
      return new Response(JSON.stringify({ message: "All Records For Tables Are Deletetd", deletedTables }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (error) {
      console.error("Table deletion failed:", error);
      return new Response(JSON.stringify({ message: "Table deletion failed", error: error.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }
  
  
  
  
  
  
  
  // 🔹 Request Cloudflare API for database export URL
  async function requestExportURL1(database_id, auth) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/d1/database/${database_id}/export`;
    const headers = {
      Authorization: `${auth.authToken}`,
      "Content-Type": "application/json",
    };
  
    try {
      console.log("🔹 Requesting Export URL...");
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ action: "init" }),
      });
  
      const responseData = await response.json();
      console.log("✅ Export URL Response:", responseData);
  
      if (responseData.success) {
        return responseData.result.signed_url;
      } else {
        throw new Error(responseData.errors[0]?.message || "Failed to get export URL");
      }
    } catch (error) {
      console.error("❌ Error getting export URL:", error.message || error);
      throw error;
    }
  }
  
  
  // 🔹 Export and modify database backup before storing it in Cloudflare R2
  async function DatabaseBackupInitiate(request, env, auth) {
    try {
  
      if (!auth.workerName) {
        return new Response(JSON.stringify({ error: 'Worker Name Not Found! ' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
      let database_id;
      let database_name;
  
  
  
      // Fetch current bindings
      const bindingResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/workers/scripts/${auth.workerName}/bindings`, {
        method: 'GET',
        headers: {
          ...corsHeaders,
          "Authorization": `${auth.authToken}`
        }
      });
  
      if (!bindingResponse.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch existing bindings.' }), {
          status: bindingResponse.status,
          headers: corsHeaders
        });
      }
  
      const existingBindings = await bindingResponse.json();
      console.log('Existing bindings:', existingBindings);
  
      // Check if the specific database is bound
      const targetBinding = await existingBindings.result.find(binding =>
        binding.type === 'd1'
      );
      // Check if any binding exists
      if (!targetBinding) {
        return new Response(JSON.stringify({ error: 'No bindings found for this worker.' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
      database_id = await targetBinding.id
      console.log(targetBinding)
  
  
  
      const getDbName = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/d1/database/${database_id}`, {
        method: 'GET',
        headers: {
          ...corsHeaders,
          "Authorization": `${auth.authToken}`
        }
      });
  
      if (!getDbName.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch existing Database Name' }), {
          status: getDbName.status,
          headers: corsHeaders
        });
      }
      const existingBindingDB = await getDbName.json();
      if (!existingBindingDB?.result?.name) {
        return new Response(JSON.stringify({ error: 'Datbase Name Not Found' }), {
          status: getDbName.status,
          headers: corsHeaders
        });
      }
      database_name = await existingBindingDB?.result?.name;
  
      // 1️⃣ Get Export URL
      const exportUrl = await requestExportURL1(database_id, auth);
      console.log("🔹 Export URL Received:", exportUrl);
  
      // 2️⃣ Fetch SQL Dump from Cloudflare API using streaming
      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch SQL dump");
      }
  
      // 3️⃣ Process SQL Dump in a streaming manner (line by line)
      const processedSQL = await processSqlDump(response.body);
  
      // 4️⃣ Generate Backup File Name (Database Name + Timestamp)
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // Format: YYYY-MM-DDTHH-MM-SS
      const filename = `${database_name}_${timestamp}.sql`;
  
      // 5️⃣ Upload Modified SQL Dump to Cloudflare R2
      await env.MY_BUCKET.put(filename, processedSQL, {
        httpMetadata: { contentType: "text/plain" },
      });
  
      console.log("✅ Modified Backup saved to R2:", filename);
  
      return new Response(
        JSON.stringify({
          success: true,
          message: "Backup created with modified SQL",
          file: filename,
        }),
        { status: 200, headers: corsHeaders }
      );
    } catch (error) {
      console.error("❌ Backup Failed:", error.message || error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  
  // 🔹 Process SQL dump in a streaming way to avoid memory overload
  async function processSqlDump(stream) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
  
    // Create a TransformStream to process the data in a streaming way
    const { readable, writable } = new TransformStream();
  
    // Start the processing in a separate promise
    const processingPromise = (async () => {
      const writer = writable.getWriter();
  
      // Use a sliding window approach
      let buffer = "";
      const lookBehind = 20; // Characters to keep for context between chunks
  
      try {
        while (true) {
          const { done, value } = await reader.read();
  
          if (done) {
            // Process any remaining buffer content
            if (buffer) {
              const processedFinalChunk = applyReplacementsWithLookAround(buffer);
              await writer.write(encoder.encode(processedFinalChunk));
            }
            break;
          }
  
          // Add new chunk to buffer
          buffer += decoder.decode(value, { stream: true });
  
          // Only process a portion of the buffer, keeping some for context
          if (buffer.length > 1024) {  // Process in ~1KB chunks
            const processPosition = buffer.length - lookBehind;
  
            // Find a good boundary (preferably after semicolon and newline)
            let splitPoint = buffer.lastIndexOf(';\n', processPosition);
            if (splitPoint === -1 || splitPoint < processPosition - 200) {
              // If no good boundary found within reasonable distance, use space or newline
              splitPoint = buffer.lastIndexOf('\n', processPosition);
              if (splitPoint === -1 || splitPoint < processPosition - 100) {
                splitPoint = buffer.lastIndexOf(' ', processPosition);
                if (splitPoint === -1 || splitPoint < processPosition - 50) {
                  // Worst case, just split at the position
                  splitPoint = processPosition;
                }
              }
            }
  
            // Get the part to process now
            const partToProcess = buffer.substring(0, splitPoint);
  
            // Apply replacements and write to output stream
            const processedPart = applyReplacementsWithLookAround(partToProcess);
            await writer.write(encoder.encode(processedPart));
  
            // Keep remaining part for next iteration
            buffer = buffer.substring(splitPoint);
          }
        }
  
        await writer.close();
      } catch (error) {
        await writer.abort(error);
        throw error;
      }
    })();
  
    // Return the readable part of the transform stream
    return new Response(readable).arrayBuffer();
  }
  
  // Apply replacements with context awareness
  function applyReplacementsWithLookAround(text) {
    // More precise regex patterns with word boundaries
    return text
      .replace(/(?<!\w)INSERT\s+INTO(?!\w)/g, "INSERT OR REPLACE INTO")
      .replace(/(?<!\w)CREATE\s+TABLE(?!\w)/g, "CREATE TABLE IF NOT EXISTS")
      .replace(/(?<!\w)CREATE\s+INDEX(?!\w)/g, "CREATE INDEX IF NOT EXISTS");
  }
  
  
  
  
  
  
  
  
  async function downloadJsonDatabase(request, env, auth) {
    try {
      if (!auth.workerName) {
        return new Response(JSON.stringify({ error: 'Worker Name Not Found! ' }), {
          status: 400,
          headers: corsHeaders
        });
      }
      
      let database_id;
      
      // Fetch current bindings
      const bindingResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/workers/scripts/${auth.workerName}/bindings`, {
        method: 'GET',
        headers: {
          ...corsHeaders,
          "Authorization": `${auth.authToken}`
        }
      });
      
      if (!bindingResponse.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch existing bindings.' }), {
          status: bindingResponse.status,
          headers: corsHeaders
        });
      }
      
      const existingBindings = await bindingResponse.json();
      console.log('Existing bindings:', existingBindings);
      
      // Check if the specific database is bound
      const targetBinding = existingBindings.result.find(binding =>
        binding.type === 'd1'
      );
      // Check if any binding exists
      if (!targetBinding) {
        return new Response(JSON.stringify({ error: 'No bindings found for this worker.' }), {
          status: 400,
          headers: corsHeaders
        });
      }
      
      database_id = targetBinding.id;
      console.log(targetBinding);
      
      const url = `https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/d1/database/${database_id}/query`;
      
      // Get all tables
      const getTablesResponse = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': `${auth.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_KV' AND name NOT LIKE 'prefix%';" })
      });
      
      if (!getTablesResponse.ok) {
        throw new Error(`Failed to get tables: ${getTablesResponse.statusText}`);
      }
      
      const tablesData = await getTablesResponse.json();
      const tables = tablesData.result?.[0]?.results || [];
      console.log(tables);
      if (tables.length == 0) {
        return new Response(JSON.stringify({ error: 'No Tables Found ' }), {
          status: 404,
          headers: corsHeaders
        });
      }
      
      // Process tables one at a time and keep only metadata in memory
      const files = [];
      
      // Process tables in sequence rather than in parallel to reduce memory pressure
      for (const table of tables) {
        const tableName = table.name;
        
        const tableDataResponse = await fetch(url, {
          method: "POST",
          headers: {
            'Authorization': `${auth.authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sql: `SELECT * FROM ${tableName}` })
        });
        
        if (!tableDataResponse.ok) {
          throw new Error(`Failed to get data for table ${tableName}: ${tableDataResponse.statusText}`);
        }
        
        const tableData = await tableDataResponse.json();
        // Convert directly to string to avoid holding both object and string in memory
        const tableJson = JSON.stringify({ [tableName]: tableData.result[0]?.results || [] }, null, 2);
        
        // Encode file as base64 and immediately release the original data
        const base64Content = btoa(unescape(encodeURIComponent(tableJson)));
        
        files.push({
          filename: `${tableName}.json`,
          content: base64Content
        });
      }
      
      // Return file metadata and content
      return new Response(JSON.stringify({ success: true, files }), {
        headers: corsHeaders
      });
      
    } catch (error) {
      console.error("Export Error:", error);
      return new Response(JSON.stringify({ success: false, error: error.message, headers: corsHeaders }), { status: 500 });
    }
  }
  
  
  
  const AttachDatabaseInfo = async (auth) => {
  
    try {
  
      if (!auth.workerName) {
        return new Response(JSON.stringify({ error: 'Worker Name Not Found! ' }), {
          status: 400,
          headers: corsHeaders
        });
      }
  
  
      // Fetch current bindings
      const bindingResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/workers/scripts/${auth.workerName}/bindings`, {
        method: "GET",
        headers: {
          ...corsHeaders,
          "Authorization": `${auth.authToken}`,
        },
      });
  
      if (!bindingResponse.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch existing bindings." }),
          { status: bindingResponse.status, headers: corsHeaders }
        );
      }
  
      const existingBindings = await bindingResponse.json();
      console.log("Existing bindings:", existingBindings);
  
      // Check if the specific database is bound
      const targetBinding = existingBindings.result.find(
        (binding) => binding.type === "d1"
      );
  
      if (!targetBinding) {
        return new Response(
          JSON.stringify({ error: "No bindings found for this worker." }),
          { status: 400, headers: corsHeaders }
        );
      }
  
      const database_id = targetBinding.id;
      console.log("Database ID:", database_id);
  
      // Fetch database name
      const getDbName = await fetch(`https://api.cloudflare.com/client/v4/accounts/${auth.accountId}/d1/database/${database_id}`, {
        method: "GET",
        headers: {
          ...corsHeaders,
          "Authorization": `${auth.authToken}`,
        },
      });
  
      if (!getDbName.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch Database Name" }),
          { status: getDbName.status, headers: corsHeaders }
        );
      }
  
      const existingBindingDB = await getDbName.json();
  
      if (!existingBindingDB?.result?.name) {
        return new Response(
          JSON.stringify({ error: "Database Name Not Found" }),
          { status: getDbName.status, headers: corsHeaders }
        );
      }
  
      const database_name = await existingBindingDB.result.name;
      console.log("Database Name:", database_name);
  
      return new Response(
        JSON.stringify({ database_id, database_name }),
        { status: 200, headers: corsHeaders }
      );
  
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Internal Server Error", details: error.message }),
        { status: 500, headers: corsHeaders }
      );
    }
  
  
  }