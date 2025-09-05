"use client"

import { Button } from "@/components/ui/button"

import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import GlassmorphicContainer from "@/components/layout/GlassmorphicContainer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format } from "date-fns"
import { toast } from "react-hot-toast"
import Link from "next/link" // Import Link for navigation

export default function History() {
  const [scanHistory, setScanHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/history`)
        if (!response.ok) {
          throw new Error("Failed to fetch scan history")
        }
        const data = await response.json()
        setScanHistory(data)
      } catch (err) {
        console.error("Error fetching history:", err)
        setError(err.message || "Failed to load scan history.")
        toast.error(`Failed to load history: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [backendUrl])

  if (loading) {
    return (
      <GlassmorphicContainer className="w-full max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-glass-text">Scan History</h2>
        <p className="text-glass-text">Loading history...</p>
      </GlassmorphicContainer>
    )
  }

  if (error) {
    return (
      <GlassmorphicContainer className="w-full max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-glass-text">Scan History</h2>
        <p className="text-red-400">{error}</p>
      </GlassmorphicContainer>
    )
  }

  return (
    <GlassmorphicContainer className="w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-white">Scan History</h2>
      {scanHistory.length === 0 ? (
        <p className="text-gray-400">No scan history available. Run a scan on the Dashboard tab!</p>
      ) : (
        <ScrollArea className="h-[600px] p-4 border border-glass-border rounded-md bg-white/5">
          <Accordion type="single" collapsible className="w-full">
            {scanHistory.map((scan) => (
              <AccordionItem key={scan.id} value={`item-${scan.id}`} className="border-b border-glass-border">
                <AccordionTrigger className="text-glass-text hover:no-underline">
                  Scan on {format(new Date(scan.timestamp), "PPPp")} - Target: {scan.target_url || "File Upload"}
                </AccordionTrigger>
                <AccordionContent className="text-glass-text text-sm p-4 bg-white/5 rounded-b-md">
                  <h3 className="font-semibold mb-2">Scan Output:</h3>
                  <pre className="whitespace-pre-wrap break-words mb-4">{scan.scan_output}</pre>
                  <h3 className="font-semibold mb-2">LLM Insights:</h3>
                  {scan.llm_insights && scan.llm_insights.vulnerabilities ? (
                    <>
                      {scan.llm_insights.summary && <p className="mb-2">{scan.llm_insights.summary}</p>}
                      {scan.llm_insights.keyPoints && scan.llm_insights.keyPoints.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-white mb-2">Key Points:</h4>
                          <ul className="list-disc list-inside text-gray-300">
                            {scan.llm_insights.keyPoints.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {scan.llm_insights.vulnerabilities.length > 0 ? (
                        scan.llm_insights.vulnerabilities.map((insight, index) => (
                          <div key={index} className="mb-4 p-3 rounded-md bg-white/10 border border-white/15">
                            <div className="flex items-center mb-2">
                              <Badge
                                className={`mr-2 ${
                                  insight.severity === "High"
                                    ? "bg-red-600"
                                    : insight.severity === "Medium"
                                      ? "bg-yellow-600"
                                      : "bg-green-600"
                                }`}
                              >
                                {insight.severity}
                              </Badge>
                              <p className="font-medium text-white">{insight.vulnerability}</p>
                            </div>
                            <p className="text-gray-300">
                              <strong>Risk Level:</strong> {insight.riskLevel || "N/A"}
                            </p>
                            <p className="text-gray-300">
                              <strong>Occurrence:</strong> {insight.occurrence || "N/A"}
                            </p>
                            <p className="text-gray-300">
                              <strong>Cause:</strong> {insight.cause || "N/A"}
                            </p>
                            <p className="text-gray-300">
                              <strong>Remediation:</strong> {insight.remediation || "N/A"}
                            </p>
                            {insight.cve && (
                              <p className="text-gray-300">
                                <strong>CVE ID(s):</strong> {insight.cve}
                              </p>
                            )}
                            {insight.references && insight.references.length > 0 && (
                              <p className="text-gray-300">
                                <strong>References:</strong>{" "}
                                {insight.references
                                  .map((ref, refIdx) => (
                                    <a
                                      key={refIdx}
                                      href={ref}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline text-blue-400 hover:text-blue-300"
                                    >
                                      {ref.split("/")[2]}
                                    </a>
                                  ))
                                  .reduce((prev, curr) => [prev, ", ", curr])}
                              </p>
                            )}
                            {insight.mitigation && (
                              <p className="text-gray-300">
                                <strong>Mitigation:</strong> {insight.mitigation}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400">No detailed vulnerabilities identified by LLM for this scan.</p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400">No LLM insights available for this scan.</p>
                  )}
                  {/* NEW: View Report Button */}
                  {scan.id && (
                    <div className="mt-4 text-right">
                      <Link href={`/report/${scan.id}`}>
                        <Button
                          variant="outline"
                          className="text-white border-white/20 hover:bg-white/10 bg-transparent"
                        >
                          View Full Report
                        </Button>
                      </Link>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      )}
    </GlassmorphicContainer>
  )
}
