import { Badge } from "../ui/badge" // Corrected import path for ui components
import GlassmorphicContainer from "../layout/GlassmorphicContainer"
import { ScrollArea } from "../ui/scroll-area"

export default function ScanOutputDisplay({ output, insights }) {
  return (
    <GlassmorphicContainer className="flex-1 min-h-[300px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-glass-text">Scan Output</h2>
      <ScrollArea className="flex-1 p-4 border border-glass-border rounded-md bg-glass-accent text-sm text-glass-text">
        {output ? (
          <div>
            <pre className="whitespace-pre-wrap break-words">{output}</pre>
            {insights && insights.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2 text-white">Vulnerability Insights:</h4>
                {insights.map((insight, index) => (
                  <div key={index} className="mb-4 p-3 rounded-md bg-glass-accent">
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
                      <strong>Root Cause:</strong> {insight.rootCause}
                    </p>
                    <p className="text-gray-300">
                      <strong>Remediation:</strong> {insight.remediation}
                    </p>
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
    </GlassmorphicContainer>
  )
}
