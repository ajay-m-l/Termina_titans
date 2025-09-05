import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import scanRoutes from "./routes/scan.js"
import { connectDB } from "./db/index.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to PostgreSQL
connectDB()

// Routes
app.use("/api", scanRoutes)

// Basic health check
app.get("/", (req, res) => {
  res.send("Pentest Backend is running!")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
