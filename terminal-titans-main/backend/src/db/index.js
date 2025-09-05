import pg from "pg"
import dotenv from "dotenv"

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

let dbConnected = false // New flag

export const connectDB = async () => {
  try {
    await pool.connect() // This line ensures connection before proceeding
    console.log("Connected to PostgreSQL database")
    dbConnected = true // <--- MOVE THIS LINE HERE: Set flag to true AFTER successful connection, BEFORE createTables
    await createTables() // Now createTables will run with dbConnected = true
  } catch (err) {
    console.error("Database connection error (continuing without DB persistence):", err)
    dbConnected = false // Set flag to false on connection error
    // Removed: process.exit(1)
  }
}

const createTables = async () => {
  // The `if (!dbConnected)` check here is now valid because dbConnected is true if we reach this point
  // from a successful connectDB call.
  if (!dbConnected) {
    console.warn("Skipping table creation: Database not connected. (This should not happen if connectDB succeeded)")
    return
  }
  try {
    const client = await pool.connect() // Get a client from the pool
    await client.query(`
      CREATE TABLE IF NOT EXISTS scans (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        target_url VARCHAR(255),
        scan_output TEXT NOT NULL,
        llm_insights TEXT NOT NULL
      );
    `)
    client.release() // Release the client back to the pool
    console.log("Scans table ensured to exist.")
  } catch (err) {
    console.error("Error creating tables:", err)
  }
}

// New `query` export:
export const query = (text, params) => {
  if (!dbConnected) {
    console.warn("Database not connected. Skipping DB query:", text)
    return Promise.reject(new Error("Database not connected."))
  }
  return pool.query(text, params)
}
