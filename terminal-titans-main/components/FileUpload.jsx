"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"

export default function FileUpload({ onScanStart, onScanComplete }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0])
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.")
      return
    }

    onScanStart() // Notify parent that scan is starting
    setLoading(true)
    const formData = new FormData()
    formData.append("scanFile", selectedFile)

    try {
      const response = await fetch(`${backendUrl}/api/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      toast.success("File uploaded and processed successfully!")
      onScanComplete(data.rawOutput, data.vulnerabilities, data.scanId) // Pass processed data back to parent
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error(`Failed to process file: ${error.message}`)
      onScanComplete(`Error: ${error.message}`, [], null) // Pass error to parent
    } finally {
      setLoading(false)
      setSelectedFile(null) // Clear selected file after upload
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Label htmlFor="scan-file" className="text-white text-lg">
        Upload Pre-Scan File (TXT or JSON)
      </Label>
      <div className="flex items-center space-x-2">
        <Input
          id="scan-file"
          type="file"
          accept=".txt,.json"
          onChange={handleFileChange}
          className="flex-1 bg-white/5 text-white border-white/10 file:text-white file:bg-blue-600 file:border-0 hover:file:bg-blue-700"
        />
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            "Upload & Analyze"
          )}
        </Button>
      </div>
      {selectedFile && <p className="text-sm text-gray-300">Selected file: {selectedFile.name}</p>}
    </div>
  )
}
