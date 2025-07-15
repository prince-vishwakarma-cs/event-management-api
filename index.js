import express from "express"
import eventRouter from "./routes/event.js"
import userRouter from "./routes/user.js"
import { DATABASE_URI, PORT } from "./utils/config.js"
import { dbConnect, initializeDatabase } from "./utils/db.js"
import { Pool } from "pg"
const app = express()

export const pool = new Pool({
    connectionString: DATABASE_URI,
})

app.use(express.json())

dbConnect(DATABASE_URI)

initializeDatabase()

app.use("/api/users", userRouter)
app.use("/api/events", eventRouter)

app.get("/", (req, res) => {
  res.json({
    message: "Event Management API",
  })
})

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error)
  res.status(500).json({
    error: "Internal server error",
  })
})

app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export default app
