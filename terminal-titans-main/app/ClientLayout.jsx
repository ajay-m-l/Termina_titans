"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Toaster, toast } from "react-hot-toast" // For notifications
import { StarIcon } from "lucide-react" // For logo and button icon

// Import the page components directly
import DashboardPage from "./dashboard/page"
import HistoryPage from "./history/page"

export default function ClientLayout() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [scanOutput, setScanOutput] = useState("")
  const [llmInsights, setLlmInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentScanId, setCurrentScanId] = useState(null)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

  const handleScanStart = () => {
    setLoading(true)
    setScanOutput("Scanning in progress... Please wait.")
    setLlmInsights([]) // Clear previous insights
    setCurrentScanId(null)
  }

  const handleScanComplete = (output, insights, scanId) => {
    setScanOutput(output)
    setLlmInsights(insights)
    setCurrentScanId(scanId)

    // After setting states:
    console.log("Scan Complete - Output:", output)
    console.log("Scan Complete - Insights:", insights)
    console.log("Scan Complete - Scan ID:", scanId)

    setLoading(false)
  }

  const handleScan = async (scanType) => {
    handleScanStart()

    try {
      const response = await fetch(`${backendUrl}/api/scan/nmap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scanType }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      handleScanComplete(data.rawOutput, data.vulnerabilities, data.scanId)
      toast.success(`Nmap scan (${scanType}) simulated and analyzed!`)
    } catch (error) {
      console.error("Error running Nmap scan:", error)
      handleScanComplete(`Error: ${error.message}`, [], null)
      toast.error(`Failed to run scan: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomToolScan = async (tool) => {
    if (!tool.trim()) {
      toast.error("Please enter a custom tool command.")
      return
    }

    handleScanStart()

    try {
      const response = await fetch(`${backendUrl}/api/scan/custom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tool }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      handleScanComplete(data.rawOutput, data.vulnerabilities, data.scanId)
      toast.success(`${tool} scan simulated and analyzed!`)
    } catch (error) {
      console.error("Error running custom tool scan:", error)
      handleScanComplete(`Error: ${error.message}`, [], null)
      toast.error(`Failed to run custom tool: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFileProcessed = (output, insights, scanId) => {
    handleScanComplete(output, insights, scanId)
  }

  const handleDownloadReport = async () => {
    if (!currentScanId) {
      toast.error("No scan data available to generate a report.")
      return
    }

    try {
      const response = await fetch(`${backendUrl}/api/report/${currentScanId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `pentest_report_${currentScanId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success("PDF report downloaded successfully!")
    } catch (error) {
      console.error("Error downloading report:", error)
      toast.error(`Failed to download report: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <Toaster position="top-right" /> {/* Toast notifications */}
      <div className="glassmorphic w-full max-w-6xl p-6 rounded-3xl shadow-lg flex flex-col">
        {/* Header */}
        <header className="w-full flex justify-between items-center mb-8 px-4 py-2">
          <div className="flex items-center space-x-2">
            <StarIcon className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Pentest App</h1>
          </div>
          <nav className="flex space-x-4">
            <Button
              onClick={() => setActiveTab("dashboard")}
              variant="ghost"
              className={`px-4 py-2 rounded-md text-lg font-semibold transition-colors duration-200 ${
                activeTab === "dashboard" ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Dashboard
            </Button>
            <Button
              onClick={() => setActiveTab("history")}
              variant="ghost"
              className={`px-4 py-2 rounded-md text-lg font-semibold transition-colors duration-200 ${
                activeTab === "history" ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              History
            </Button>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full p-4">
          {activeTab === "dashboard" && (
            <DashboardPage
              scanOutput={scanOutput}
              llmInsights={llmInsights}
              loading={loading}
              currentScanId={currentScanId}
              handleScanStart={handleScanStart}
              handleScanComplete={handleScanComplete}
              handleScan={handleScan}
              handleCustomToolScan={handleCustomToolScan}
              handleFileProcessed={handleFileProcessed}
              handleDownloadReport={handleDownloadReport} // Pass this down for the button within DashboardPage if needed
            />
          )}
          {activeTab === "history" && <HistoryPage />}
        </main>

        {/* Footer */}
        <footer className="w-full text-center text-gray-500 text-sm mt-8 pt-4 border-t border-white/10">
          <p>Pentest App Team 2024</p>
        </footer>
      </div>
    </div>
  )
}
