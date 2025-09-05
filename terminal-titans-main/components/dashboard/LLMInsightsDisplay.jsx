"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function LLMInsightsDisplay({ insights }) {
  // Transform the raw array into the expected format
  const transformData = (raw) => {
    if (!raw) return null;
    
    // If already in correct format, return as-is
    if (raw.summary && raw.vulnerabilities) return raw;
    
    // If it's an array (your current case)
    if (Array.isArray(raw)) {
      return {
        summary: "Vulnerability Analysis Results",
        keyPoints: [
          `Found ${raw.length} security issues`,
          `Highest severity: ${raw.reduce((max, v) => 
            ['Critical','High','Medium','Low','Informational'].indexOf(v.severity) < 
            ['Critical','High','Medium','Low','Informational'].indexOf(max) 
              ? v.severity : max, 'Informational')}`
        ],
        vulnerabilities: raw
      }
    }
    
    return null;
  };

  const displayData = transformData(insights);

  if (!displayData) {
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4 text-white">LLM-Generated Vulnerability Insights</h3>
        <div className="glassmorphic p-6 rounded-xl h-96 overflow-y-auto text-gray-400">
          No LLM insights to display yet. Run a scan.
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4 text-white">LLM-Generated Vulnerability Insights</h3>
      
      <div className="glassmorphic rounded-xl overflow-hidden">
        <ScrollArea className="h-[500px] p-6">
          {/* Summary Section */}
          <div className="mb-8">
            <h4 className="font-medium text-white mb-3 text-lg">Overview</h4>
            <p className="text-gray-300 whitespace-pre-line backdrop-blur-sm bg-white/5 rounded-lg p-4">
              {displayData.summary}
            </p>
          </div>

          {/* Key Points */}
          {displayData.keyPoints?.length > 0 && (
            <div className="mb-8">
              <h4 className="font-medium text-white mb-3 text-lg">Key Findings</h4>
              <ul className="space-y-2">
                {displayData.keyPoints.map((point, i) => (
                  <li 
                    key={`point-${i}`}
                    className="glassmorphic-light p-3 rounded-lg text-gray-300"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Vulnerabilities */}
          <div className="space-y-5">
            <h4 className="font-medium text-white text-lg">Detailed Vulnerabilities</h4>
            
            {displayData.vulnerabilities?.length > 0 ? (
              displayData.vulnerabilities.map((vuln, i) => (
                <div 
                  key={`vuln-${i}`}
                  className="glassmorphic-vuln p-5 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Badge
                      variant={
                        vuln.severity === 'Critical' ? 'destructive' :
                        vuln.severity === 'High' ? 'destructive' : 
                        vuln.severity === 'Medium' ? 'warning' : 'default'
                      }
                      className="capitalize text-sm py-1 px-3"
                    >
                      {vuln.severity}
                    </Badge>
                    <h5 className="font-medium text-white text-lg">
                      {vuln.vulnerability}
                    </h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {vuln.riskLevel && (
                      <div className="glassmorphic-light p-3 rounded-lg">
                        <span className="text-gray-400">Risk Level:</span> 
                        <span className="text-white ml-2">{vuln.riskLevel}</span>
                      </div>
                    )}
                    
                    {vuln.occurrence && (
                      <div className="glassmorphic-light p-3 rounded-lg">
                        <span className="text-gray-400">Occurrence:</span> 
                        <span className="text-white ml-2">{vuln.occurrence}</span>
                      </div>
                    )}
                    
                    {vuln.cause && (
                      <div className="glassmorphic-light p-3 rounded-lg md:col-span-2">
                        <span className="text-gray-400">Root Cause:</span> 
                        <span className="text-white ml-2">{vuln.cause}</span>
                      </div>
                    )}
                    
                    <div className="glassmorphic-light p-3 rounded-lg md:col-span-2">
                      <span className="text-gray-400">Remediation:</span> 
                      <span className="text-white ml-2">{vuln.remediation || 'No fix provided'}</span>
                    </div>
                    
                    {vuln.cve && (
                      <div className="glassmorphic-light p-3 rounded-lg">
                        <span className="text-gray-400">CVE:</span> 
                        <span className="text-white ml-2">{vuln.cve}</span>
                      </div>
                    )}
                  </div>

                  {vuln.references?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-gray-400 mb-2">References:</p>
                      <div className="flex flex-wrap gap-2">
                        {vuln.references.map((ref, i) => (
                          <a
                            key={`ref-${i}`}
                            href={ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glassmorphic-light px-3 py-1 rounded-full text-blue-400 hover:text-blue-300 text-xs"
                          >
                            {new URL(ref).hostname}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="glassmorphic-light p-4 rounded-lg text-center text-gray-400">
                No vulnerabilities detected
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
