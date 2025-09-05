"use client"

import { useState } from "react"
import GlassmorphicContainer from "@/components/layout/GlassmorphicContainer"
import ScanOutputDisplay from "@/components/dashboard/ScanOutputDisplay"
import FileUpload from "@/components/FileUpload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import {
  Loader2, ArrowUpRight, Satellite, Shield, Search, Activity, Zap,
  Globe2, ServerCrash, Bug, Radar, Globe, TerminalSquare, Layers, MoreHorizontal
} from "lucide-react"
import LLMInsightsDisplay from "@/components/dashboard/LLMInsightsDisplay"

export default function Dashboard() {
  const [scanOutput, setScanOutput] = useState("")
  const [llmInsights, setLlmInsights] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentScanId, setCurrentScanId] = useState(null)
  const [targetUrl, setTargetUrl] = useState("")
  const [selectedTools, setSelectedTools] = useState([])
  const [showAllTools, setShowAllTools] = useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

  const allToolConfigs = [
    { id: "nmap-sV-A-O", name: "Nmap (-sV -A -O)", icon: Search, description: "Service & OS detection" },
    { id: "nmap-script-vuln", name: "Nmap (--script vuln)", icon: Shield, description: "Vulnerability scanning" },
    { id: "nikto", name: "Nikto", icon: Activity, description: "Web server scanner" },
    { id: "whatweb", name: "WhatWeb", icon: Satellite, description: "Web technology identifier" },
    { id: "nuclei", name: "Nuclei", icon: Zap, description: "Fast vulnerability scanner" },
    { id: "amass", name: "Amass", icon: Globe2, description: "Passive subdomain enumeration" },
    { id: "httpx", name: "Httpx", icon: Globe, description: "HTTP probing and fingerprinting" },
    { id: "subfinder", name: "Subfinder", icon: Radar, description: "Subdomain discovery" },
    { id: "dnsx", name: "DNSx", icon: ServerCrash, description: "DNS record discovery" },
    { id: "naabu", name: "Naabu", icon: Bug, description: "Port scanning" },
    { id: "wappalyzer", name: "Wappalyzer", icon: TerminalSquare, description: "Tech stack detection" },
    { id: "testssl", name: "TestSSL.sh", icon: Shield, description: "SSL/TLS vulnerability scanner" },
    { id: "feroxbuster", name: "Feroxbuster", icon: Layers, description: "Content discovery via fuzzing" }
  ]

  const toolConfigs = showAllTools ? allToolConfigs : allToolConfigs.slice(0, 5)

  const handleScanStart = () => {
    setLoading(true)
    setScanOutput("🛰️ Initiating deep space scan... Please wait.")
    setLlmInsights([])
    setCurrentScanId(null)
  }

  const handleScanComplete = (output, insights, scanId) => {
    setScanOutput(output)
    setLlmInsights(insights)
    setCurrentScanId(scanId)
    setLoading(false)
  }

  const handleToolChange = (tool) => {
    setSelectedTools((prev) => (prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]))
  }

  const handleRunSelectedScans = async () => {
    if (!targetUrl.trim()) {
      toast.error("Please enter a target URL.")
      return
    }
    if (selectedTools.length === 0) {
      toast.error("Please select at least one scan tool.")
      return
    }

    handleScanStart()

    try {
      const response = await fetch(`${backendUrl}/api/run-scans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl, selectedTools }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      handleScanComplete(data.rawOutput, data.vulnerabilities, data.scanId)
      toast.success(`🌌 Deep scan completed for ${targetUrl}!`)
    } catch (error) {
      console.error("Error running selected scans:", error)
      handleScanComplete(`Error: ${error.message}`, [], null)
      toast.error(`Failed to run scans: ${error.message}`)
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
      a.download = `space_pentest_report_${currentScanId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success("🚀 PDF report downloaded successfully!")
    } catch (error) {
      console.error("Error downloading report:", error)
      toast.error(`Failed to download report: ${error.message}`)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      <GlassmorphicContainer className="col-span-1 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400/50 scrollbar-track-transparent">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Satellite className="h-8 w-8 text-blue-400" />
            <h2 className="text-2xl font-bold">Mission Control</h2>
          </div>

          <Label htmlFor="target-url" className="text-lg">🎯 Target</Label>
          <Input
            id="target-url"
            type="url"
            placeholder="https://target-planet.com"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="space-input text-black"
            disabled={loading}
          />

          <h3 className="text-lg font-semibold">🛡️ Select Scanning Arrays</h3>
          <div className="grid grid-cols-1 gap-4">
            {toolConfigs.map((tool) => {
              const IconComponent = tool.icon
              return (
                <div key={tool.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <input
                    type="checkbox"
                    id={tool.id}
                    checked={selectedTools.includes(tool.id)}
                    onChange={() => handleToolChange(tool.id)}
                    disabled={loading}
                    className="space-checkbox"
                  />
                  <IconComponent className="h-5 w-5 text-blue-400" />
                  <div className="flex-1">
                    <Label htmlFor={tool.id} className="space-label block">
                      {tool.name}
                    </Label>
                    <p className="text-sm text-gray-400">{tool.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <Button
            onClick={() => setShowAllTools((prev) => !prev)}
            className="space-button w-full py-3"
            variant="secondary"
          >
            <MoreHorizontal className="mr-2 h-5 w-5" />
            {showAllTools ? "Show Less Tools" : "Show More Tools"}
          </Button>

          <Button
            onClick={handleRunSelectedScans}
            disabled={loading || !targetUrl.trim() || selectedTools.length === 0}
            className="space-button w-full py-4 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                🚀 Launching Deep Scan...
              </>
            ) : (
              <>
                <Satellite className="mr-2 h-5 w-5" />
                Launch Scanning
              </>
            )}
          </Button>

          <div className="pt-4 border-t border-white/10">
            <h4 className="text-md font-medium mb-2">📡 Upload Data for analysis</h4>
            <FileUpload onScanStart={handleScanStart} onScanComplete={handleFileProcessed} />
          </div>
        </div>
      </GlassmorphicContainer>

      <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
        <GlassmorphicContainer>
          <ScanOutputDisplay output={scanOutput} insights={llmInsights} />
        </GlassmorphicContainer>
        <GlassmorphicContainer>
          <LLMInsightsDisplay insights={llmInsights} />
        </GlassmorphicContainer>
        <GlassmorphicContainer className="text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <ArrowUpRight className="h-8 w-8 text-yellow-400" />
              <h3 className="text-xl font-semibold">Mission Report</h3>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              📋 Generate a comprehensive report with all scan results and vulnerability analysis.
            </p>
            <Button
              onClick={handleDownloadReport}
              disabled={!currentScanId || loading}
              className="space-button px-8 py-4"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <ArrowUpRight className="mr-2 h-5 w-5" />
                  Download Mission Report
                </>
              )}
            </Button>
            {!currentScanId && !loading && (
              <p className="text-sm text-gray-400 mt-2">
                🌟 Complete a scanning mission to enable report generation
              </p>
            )}
          </div>
        </GlassmorphicContainer>
      </div>
    </div>
  )
}
