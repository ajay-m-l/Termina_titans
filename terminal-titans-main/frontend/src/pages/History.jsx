"use client"

import { useState, useEffect } from "react"
import GlassmorphicContainer from "../components/layout/GlassmorphicContainer"
import { ScrollArea } from "../components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"
import { format } from "date-fns"

export default function History() {
  const [scanHistory, setScanHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const backendUrl = import.meta.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
        const response = await fetch(`${backendUrl}/api/history`)
        if (!response.ok) {
          throw new Error("Failed to fetch scan history")
        }
        const data = await response.json()
        setScanHistory(data)
      } catch (err) {
        console.error("Error fetching history:", err)
        setError(err.message || "Failed to load scan history.")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

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
      <h2 className="text-xl font-semibold mb-4 text-glass-text">Scan History</h2>
      {scanHistory.length === 0 ? (
        <p className="text-glass-text">No scan history available. Run a scan on the Dashboard page!</p>
      ) : (
        <ScrollArea className="h-[600px] p-4 border border-glass-border rounded-md bg-glass-accent">
          <Accordion type="single" collapsible className="w-full">
            {scanHistory.map((scan) => (
              <AccordionItem key={scan.id} value={`item-${scan.id}`} className="border-b border-glass-border">
                <AccordionTrigger className="text-glass-text hover:no-underline">
                  Scan on {format(new Date(scan.timestamp), "PPPp")} - Target: {scan.target_url || "File Upload"}
                </AccordionTrigger>
                <AccordionContent className="text-glass-text text-sm p-4 bg-glass-accent rounded-b-md">
                  <h3 className="font-semibold mb-2">Scan Output:</h3>
                  <pre className="whitespace-pre-wrap break-words mb-4">{scan.scan_output}</pre>
                  <h3 className="font-semibold mb-2">LLM Insights:</h3>
                  <pre className="whitespace-pre-wrap break-words">{scan.llm_insights}</pre>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      )}
    </GlassmorphicContainer>
  )
}
