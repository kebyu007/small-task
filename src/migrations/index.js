import pool from "../configs/db.config.js";

export const TABLE_SCHEMAS = `
    CREATE TABLE IF NOT EXISTS customers(
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(13) UNIQUE NOT NULL,
        credit_limit BIGINT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products(
        id SERIAL PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        price BIGINT NOT NULL,
        stock_qty INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0)
    );

    CREATE TABLE IF NOT EXISTS tariffs(
        months INTEGER NOT NULL CHECK (months IN (3, 6, 12)),
        markup_percent INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contracts(
        id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES customers(id),
        status VARCHAR(10) NOT NULL CHECK (status IN ('active', 'closed')),
        total_price BIGINT NOT NULL,
        down_payment BIGINT NOT NULL,
        markup_amount BIGINT NOT NULL,
        financed_amount BIGINT NOT NULL,
        months INTEGER NOT NULL CHECK (months IN (3, 6, 12)),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contract_items(
        id SERIAL PRIMARY KEY,
        contract_id INT NOT NULL REFERENCES contracts(id),
        product_id INT NOT NULL REFERENCES products(id),
        qty INTEGER NOT NULL CHECK (qty > 0),
        unit_price BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schedule_items(
        id SERIAL PRIMARY KEY,
        contract_id INT NOT NULL REFERENCES contracts(id),
        seq_no INTEGER NOT NULL,
        due_date DATE NOT NULL,
        amount BIGINT NOT NULL,
        paid_amount BIGINT NOT NULL DEFAULT 0 CHECK (paid_amount <= amount),
        status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid'))
    );

    CREATE TABLE IF NOT EXISTS payments(
        id SERIAL PRIMARY KEY,
        contract_id INT NOT NULL REFERENCES contracts(id),
        amount BIGINT NOT NULL CHECK (amount > 0),
        idempotency_key UUID UNIQUE NOT NULL,
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications(
        id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL REFERENCES customers(id),
        type VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_schedule_status_due_date 
    ON schedule_items(status, due_date);
`;

async function migrateSchema() {
  const client = await pool.connect();

  try {
    await client.query(TABLE_SCHEMAS);
    console.log("ALL TABLES MIGRATED!");
  } catch (error) {
    console.log("TABLE MIGRATION ERROR❌", error);
  } finally {
    client.release();
  }
}

await migrateSchema();
