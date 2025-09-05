import { query } from "../db/index.js"

export async function saveScanResult(targetUrl, scanOutput, llmInsights) {
  try {
    const res = await query("INSERT INTO scans(target_url, scan_output, llm_insights) VALUES($1, $2, $3) RETURNING *", [
      targetUrl,
      scanOutput,
      llmInsights,
    ])
    return res.rows[0]
  } catch (error) {
    console.warn("Database not connected or save failed. Scan result will not be persisted.", error.message)
    // Return a mock scan object so the frontend doesn't break expecting an ID
    return {
      id: Date.now(),
      target_url: targetUrl,
      scan_output: scanOutput,
      llm_insights: llmInsights,
      timestamp: new Date().toISOString(),
    }
  }
}

export async function getScanHistory() {
  try {
    const res = await query("SELECT * FROM scans ORDER BY timestamp DESC")
    return res.rows
  } catch (error) {
    console.warn("Database not connected or history fetch failed. Returning empty history.", error.message)
    return [] // Return empty array if DB is not connected
  }
}

export async function getScanById(scanId) {
  try {
    const res = await query("SELECT * FROM scans WHERE id = $1", [scanId])
    return res.rows[0]
  } catch (error) {
    console.warn(`Database not connected or fetch scan by ID (${scanId}) failed.`, error.message)
    return null // Return null if DB is not connected or scan not found
  }
}
