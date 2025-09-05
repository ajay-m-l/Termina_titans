import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"

dotenv.config()

const API_KEY = process.env.GEMINI_API_KEY

if (!API_KEY) {
  console.error(
    "GEMINI_API_KEY is NOT set in environment variables. LLM insights will be severely limited or unavailable.",
  )
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

export const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null
