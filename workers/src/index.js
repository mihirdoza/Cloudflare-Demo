import { Hono } from 'hono';
import { ErrorMessage } from './common/common';
import {
	ClearDataBaseTables,
	EquipmentType,
	ExportDataBase,
	GetDetails,
	GetRelatedDetails,
	GetTables,
	ImportDataBase,
	Manufacturer,
	SelectedManufacturer,
	UploadTable,
} from './api/api';

const app = new Hono();

/**
 * CORS Middleware
 */
app.use('*', async (c, next) => {
	await next();
	c.res.headers.set('Access-Control-Allow-Origin', '*');
	c.res.headers.set('Access-Control-Allow-Methods', 'POST,DELETE,OPTIONS');
	c.res.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
	if (c.req.method === 'OPTIONS') {
		return c.text('', 204);
	}
});

app.onError((err, c) => {
	console.log(err.message);

	const status = err instanceof ErrorMessage ? err.status : 500;
	return c.json({ error: err.message, status }, status);
});

app.post('/upload', UploadTable);

app.post('/manufacturer', Manufacturer);

app.get('/tables', GetTables);

app.post('/equipment', EquipmentType);

app.post('/selected_manufacturer', SelectedManufacturer);

app.post('/get_details', GetDetails);

app.post('/get_related_details', GetRelatedDetails);

app.delete('/clear-database', ClearDataBaseTables);

app.get("/export",ExportDataBase)

app.post("/import",ImportDataBase)

app.get('/', async (c) => {
	return c.json({ message: 'Hello World' });
});

export default app;
