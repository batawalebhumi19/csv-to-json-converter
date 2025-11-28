function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function setNested(obj, path, value) {
  const parts = path.split('.');
  let curr = obj;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    if (i === parts.length - 1) {
      curr[key] = value;
    } else {
      if (!curr[key] || typeof curr[key] !== 'object') {
        curr[key] = {};
      }
      curr = curr[key];
    }
  }
}

export function csvRowToJson(headers, values) {
  const obj = {};

  for (let i = 0; i < headers.length; i++) {
    const key = headers[i];
    const value = values[i];

    if (value === undefined || value === '') continue;

    if (key.includes('.')) {
      setNested(obj, key, value);
    } else {
      obj[key] = value;
    }
  }

  if (obj.age !== undefined) {
    const a = parseInt(obj.age, 10);
    if (!Number.isNaN(a)) obj.age = a;
  }

  return obj;
}

export function parseCsvHeader(line) {
  return parseCsvLine(line);
}

export function parseCsvValues(line) {
  return parseCsvLine(line);
}