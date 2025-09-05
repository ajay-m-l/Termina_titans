import { Badge } from "../ui/badge" // Corrected import path for ui components
import GlassmorphicContainer from "../layout/GlassmorphicContainer"
import { ScrollArea } from "../ui/scroll-area"

export default function LLMInsightsDisplay({ insights }) {
  if (!insights || insights.length === 0) {
    return null
  }

  return (
    <GlassmorphicContainer className="flex-1 min-h-[300px] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-glass-text">LLM Insights</h2>
      <ScrollArea className="flex-1 p-4 border border-glass-border rounded-md bg-glass-accent text-sm text-glass-text">
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
      </ScrollArea>
    </GlassmorphicContainer>
  )
}
