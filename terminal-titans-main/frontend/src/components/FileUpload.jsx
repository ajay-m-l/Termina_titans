"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import GlassmorphicContainer from "./layout/GlassmorphicContainer"
import { Loader2 } from "lucide-react"

export default function FileUpload({ onScanStart, onScanComplete }) {
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
    setUrl("") // Clear URL if file is selected
    setError("")
  }

  const handleUrlChange = (event) => {
    setUrl(event.target.value)
    setFile(null) // Clear file if URL is entered
    setError("")
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")

    if (!file && !url) {
      setError("Please upload a file or enter a URL.")
      return
    }

    setLoading(true)
    onScanStart()

    const formData = new FormData()
    if (file) {
      formData.append("file", file)
    } else if (url) {
      formData.append("url", url)
    }

    try {
      const backendUrl = import.meta.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
      const response = await fetch(`${backendUrl}/api/scan`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Scan failed")
      }

      const data = await response.json()
      onScanComplete(data.scanOutput, data.llmInsights)
    } catch (err) {
      console.error("Error during scan:", err)
      setError(err.message || "An unexpected error occurred during the scan.")
      onScanComplete("Error: " + (err.message || "Unknown error"), "No insights due to scan error.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassmorphicContainer className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-glass-text">Start New Scan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-glass-text mb-2">
            Upload Scan Output File (e.g., Nikto, Nmap XML)
          </label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-glass-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-glass-accent file:text-glass-text hover:file:bg-glass-border"
          />
        </div>
        <div className="flex items-center justify-center text-glass-text">
          <span className="mx-2">OR</span>
        </div>
        <div>
          <label htmlFor="url-input" className="block text-sm font-medium text-glass-text mb-2">
            Enter Target URL for Live Scan (e.g., Nikto)
          </label>
          <Input
            id="url-input"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={handleUrlChange}
            className="w-full p-2 rounded-md bg-glass-accent border border-glass-border text-glass-text placeholder-glass-text/70 focus:ring-2 focus:ring-glass-border focus:outline-none"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            "Run Scan"
          )}
        </Button>
      </form>
    </GlassmorphicContainer>
  )
}
