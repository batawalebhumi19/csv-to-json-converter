import express from 'express';
import dotenv from 'dotenv';
import { importCsvAndReport } from './csvImporter.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/import-csv', async (req, res) => {
  importCsvAndReport()
    .then(() => console.log('CSV import finished'))
    .catch(err => console.error('CSV import failed:', err));

  res.json({ message: 'CSV import started. Check server logs for progress.' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});