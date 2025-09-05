"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function ScanOutputDisplay({ output, insights }) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4 text-white">Scan Output & Vulnerabilities</h3>
      <ScrollArea className="glassmorphic p-4 h-96 overflow-y-auto text-sm">
        {output ? (
          <div>
            <pre className="whitespace-pre-wrap break-words text-gray-200">{output}</pre>
            {insights && insights.vulnerabilities && insights.vulnerabilities.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2 text-white">Vulnerability Insights:</h4>
                {insights.vulnerabilities.map((insight, index) => (
                  <div key={index} className="mb-4 p-3 rounded-md bg-white/5 border border-white/10">
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
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400">No scan output to display yet. Run a scan or upload a file.</p>
        )}
      </ScrollArea>
    </div>
  )
}
