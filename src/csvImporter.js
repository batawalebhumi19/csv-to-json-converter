import fs from 'fs';
import readline from 'readline';
import { query } from './db.js';
import { parseCsvHeader, parseCsvValues, csvRowToJson } from './csvParser.js';

export async function importCsvAndReport() {
  console.log('Importer: started');

  const filePath = process.env.CSV_FILE_PATH;
  console.log('Importer: CSV_FILE_PATH =', filePath);

  if (!filePath) {
    throw new Error('CSV_FILE_PATH is not set in environment variables');
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`CSV file not found at path: ${filePath}`);
  }

  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  let headers = null;
  let lineNumber = 0;
  let insertedCount = 0;

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    lineNumber++;

    if (lineNumber === 1) {
      headers = parseCsvHeader(trimmed);
      console.log('Importer: header =', headers);
      continue;
    }

    const values = parseCsvValues(trimmed);
    if (!headers || values.length === 0) continue;

    const fullJson = csvRowToJson(headers, values);
    const { name, age, address, ...rest } = fullJson;

    if (!name || !name.firstName || !name.lastName) {
    console.warn(`Skipping line ${lineNumber}: missing name fields`);
    continue;
    }
    if (typeof age !== 'number' || Number.isNaN(age)) {
    console.warn(`Skipping line ${lineNumber}: invalid age`);
    continue;
    }

    const fullName = `${name.firstName} ${name.lastName}`.trim();

    const addressJson = address ? JSON.stringify(address) : null;
    const additionalJson = Object.keys(rest).length ? JSON.stringify(rest) : null;

    try {
    await query(
        'INSERT INTO public.users ("name", age, address, additional_info) VALUES ($1, $2, $3, $4)',
        [fullName, age, addressJson, additionalJson]
    );
    } catch (err) {
        console.error('Insert failed for line', lineNumber);
        console.error('  fullName:', fullName);
        console.error('  addressJson:', addressJson);
        console.error('  additionalJson:', additionalJson);
        console.error(err);
        throw err;
    }
    
    insertedCount++;

    if (insertedCount % 1000 === 0) {
      console.log(`Importer: inserted ${insertedCount} rows so far`);
    }
  }

  console.log(`Importer: finished inserting, total rows = ${insertedCount}`);
  await printAgeDistribution();
}

async function printAgeDistribution() {
  const res = await query(
    `
    SELECT
      SUM(CASE WHEN age < 20 THEN 1 ELSE 0 END) AS lt_20,
      SUM(CASE WHEN age >= 20 AND age < 40 THEN 1 ELSE 0 END) AS bt_20_40,
      SUM(CASE WHEN age >= 40 AND age < 60 THEN 1 ELSE 0 END) AS bt_40_60,
      SUM(CASE WHEN age >= 60 THEN 1 ELSE 0 END) AS gt_60,
      COUNT(*) AS total
    FROM public.users;
    `
  );

  const row = res.rows[0];
  const total = Number(row.total || 0);

  if (!total) {
    console.log('Age distribution: no users found');
    return;
  }

  const pct = c => ((c / total) * 100).toFixed(2);

  const lt20 = Number(row.lt_20 || 0);
  const bt20_40 = Number(row.bt_20_40 || 0);
  const bt40_60 = Number(row.bt_40_60 || 0);
  const gt60 = Number(row.gt_60 || 0);

  console.log('\nAge-Group % Distribution');
  console.log('< 20     ', pct(lt20));
  console.log('20 to 40 ', pct(bt20_40));
  console.log('40 to 60 ', pct(bt40_60));
  console.log('> 60     ', pct(gt60));
}