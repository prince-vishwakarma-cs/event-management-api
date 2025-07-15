import { Client } from "pg"
import { pool } from "../index.js"

export const dbConnect = async (uri) => {
  const client = new Client({ connectionString: uri })
  try {
    await client.connect()
    console.log("Database connected successfully")
  } catch (e) {
    console.error("Database connection error:", e)
  }
}

export const initializeDatabase = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                date_time TIMESTAMP NOT NULL,
                location VARCHAR(255) NOT NULL,
                capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS registrations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
                registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, event_id)
            )
        `)

        console.log('Database schema initialized successfully')
        return pool
    } catch (error) {
        console.error('Database initialization error:', error)
    }
}
