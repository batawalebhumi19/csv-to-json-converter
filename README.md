# CSV to Json Converter API

A Node.js service that reads a CSV file, converts dotted keys (like `address.city` or `preferences.notifications.email`) into nested JSON, and imports the data into a PostgreSQL database.

---

## 📦 Prerequisites

- Node.js ≥ 18  
- PostgreSQL ≥ 13  
- npm ≥ 8

---

## 🛠️ Setup Instructions

### 1. Clone the Project

```bash
git clone https://github.com/batawalebhumi19/csv-to-json-converter.git
cd csv-to-json-converter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create .env file in project root 

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=kelp_db

CSV_FILE_PATH=C:/Users/YourName/Desktop/sample.csv
PORT=3000
```

### 4. Setup Postgresql Database 

```bash
CREATE DATABASE kelp;
\c kelp;

CREATE TABLE public.users (
  "name" varchar NOT NULL,
  age int4 NOT NULL,
  address jsonb NULL,
  additional_info jsonb NULL,
  id serial4 NOT NULL,
  PRIMARY KEY (id)
);
```

### 5. Run the application 

```bash
npm run dev
```

### Call the POST api via postman or curl

```bash
http://localhost:3000/import-csv
```
