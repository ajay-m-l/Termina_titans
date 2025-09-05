"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import GlassmorphicContainer from "@/components/layout/GlassmorphicContainer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "react-hot-toast"

export default function ReportPage() {
  const { scanId } = useParams()
  const router = useRouter()
  const [scanData, setScanData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

  useEffect(() => {
    if (!scanId) {
      setError("Scan ID is missing.")
      setLoading(false)
      return
    }

    const fetchScanDetails = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/scan-details/${scanId}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setScanData(data)
      } catch (err) {
        console.error("Error fetching scan details:", err)
        setError(err.message || "Failed to load scan report.")
        toast.error(`Failed to load report: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchScanDetails()
  }, [scanId, backendUrl])

  if (loading) {
    return (
      <GlassmorphicContainer className="w-full max-w-5xl mx-auto min-h-[600px] flex items-center justify-center">
        <p className="text-glass-text text-lg">Loading scan report...</p>
      </GlassmorphicContainer>
    )
  }

  if (error) {
    return (
      <GlassmorphicContainer className="w-full max-w-5xl mx-auto min-h-[600px] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4 text-red-400">Error Loading Report</h2>
        <p className="text-red-400 text-center">{error}</p>
        <Button onClick={() => router.back()} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
          <ArrowLeftIcon className="mr-2 h-5 w-5" /> Go Back
        </Button>
      </GlassmorphicContainer>
    )
  }

  if (!scanData) {
    return (
      <GlassmorphicContainer className="w-full max-w-5xl mx-auto min-h-[600px] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Report Not Found</h2>
        <p className="text-gray-400 text-center">The requested scan report could not be found.</p>
        <Button onClick={() => router.back()} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
          <ArrowLeftIcon className="mr-2 h-5 w-5" /> Go Back
        </Button>
      </GlassmorphicContainer>
    )
  }

  const llmInsights = scanData.llm_insights || {}
  const vulnerabilities = llmInsights.vulnerabilities || []
  const keyPoints = llmInsights.keyPoints || []

  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case "critical":
        return "bg-red-700"
      case "high":
        return "bg-red-600"
      case "medium":
        return "bg-yellow-600"
      case "low":
        return "bg-green-600"
      case "informational":
        return "bg-blue-600"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <GlassmorphicContainer className="w-full max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Pentest Report</h1>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="text-white border-white/20 hover:bg-white/10"
        >
          <ArrowLeftIcon className="mr-2 h-5 w-5" /> Back to History
        </Button>
      </div>

      <div className="mb-8 text-gray-300">
        <p>
          <strong>Scan ID:</strong> {scanData.id}
        </p>
        <p>
          <strong>Timestamp:</strong> {format(new Date(scanData.timestamp), "PPPp")}
        </p>
        <p>
          <strong>Target:</strong> {scanData.target_url || "File Upload"}
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">1. Executive Summary</h2>
        <p className="text-gray-300 leading-relaxed">{llmInsights.summary || "No executive summary available."}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
          2. Key Findings / Highlights
        </h2>
        {keyPoints.length > 0 ? (
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            {keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No key findings identified.</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">
          3. Detailed Vulnerabilities
        </h2>
        {vulnerabilities.length > 0 ? (
          <div className="space-y-6">
            {vulnerabilities.map((vulnerability, index) => (
              <div key={index} className="glassmorphic-light p-6 rounded-3xl border border-white/15">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Vulnerability {index + 1}: {vulnerability.vulnerability}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getRiskBadgeColor(vulnerability.riskLevel)}>
                    Risk: {vulnerability.riskLevel || "N/A"}
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-700 text-white">
                    Severity: {vulnerability.severity || "N/A"}
                  </Badge>
                  {vulnerability.cve && (
                    <Badge variant="outline" className="border-blue-400 text-blue-300">
                      CVE: {vulnerability.cve}
                    </Badge>
                  )}
                </div>

                <div className="text-gray-300 space-y-2">
                  <p>
                    <strong>Occurrence:</strong> {vulnerability.occurrence || "N/A"}
                  </p>
                  <p>
                    <strong>Cause:</strong> {vulnerability.cause || "N/A"}
                  </p>
                  <p>
                    <strong>Remediation:</strong> {vulnerability.remediation || "No remediation steps provided."}
                  </p>
                  {vulnerability.mitigation && (
                    <p>
                      <strong>Mitigation:</strong> {vulnerability.mitigation}
                    </p>
                  )}
                  {vulnerability.references && vulnerability.references.length > 0 && (
                    <p>
                      <strong>References:</strong>{" "}
                      {vulnerability.references
                        .map((ref, refIdx) => (
                          <a
                            key={refIdx}
                            href={ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-400 hover:text-blue-300 break-all"
                          >
                            {ref.split("/")[2] || ref}
                          </a>
                        ))
                        .reduce((prev, curr) => [prev, ", ", curr])}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No detailed vulnerabilities identified by LLM.</p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">4. Raw Scan Output</h2>
        <ScrollArea className="glassmorphic-light p-4 h-96 overflow-y-auto text-sm text-gray-200 rounded-3xl">
          <pre className="whitespace-pre-wrap break-words">
            {scanData.scan_output || "No raw scan output available."}
          </pre>
        </ScrollArea>
      </section>

      <div className="text-center text-gray-500 text-sm mt-8 pt-4 border-t border-white/10">
        <p>End of Report</p>
      </div>
    </GlassmorphicContainer>
  )
}
