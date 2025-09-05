import { model } from "../config/gemini.js"

// Current settings
const CURRENT_USER = 'Prateek-glitch'
const CURRENT_TIMESTAMP = '2025-07-12 19:17:21'

export async function generateGeminiInsights(input) {
  if (!model) {
    console.warn("Gemini model not available. Skipping LLM insights generation.")
    return {
      vulnerabilities: [],
      summary: "LLM insights disabled due to missing GEMINI_API_KEY. Please set it in your backend/.env file.",
      keyPoints: [],
    }
  }

  try {
    let prompt = ''
    const parsedInput = typeof input === 'string' ? input : JSON.parse(input)

    if (parsedInput.type === 'patch_recommendations') {
      prompt = `Generate detailed patch recommendations for the following vulnerabilities found during a security scan.
      Consider dependencies, testing requirements, and potential impacts when suggesting fixes.

      Vulnerabilities to analyze:
      ${JSON.stringify(parsedInput.vulnerabilities, null, 2)}

      Format the output as a JSON object with the following structure:
      {
        "patches": [
          {
            "vulnerability": "Name of the vulnerability",
            "severity": "Critical/High/Medium/Low",
            "remediation": "Detailed step-by-step instructions to fix the vulnerability",
            "complexity": "High/Medium/Low",
            "dependencies": ["List of required dependencies or prerequisites"],
            "testing_required": true/false,
            "critical_system": true/false,
            "impact": "Description of potential impact during/after patching",
            "rollback_plan": "Steps to reverse the changes if needed",
            "verification_steps": ["List of steps to verify the fix"],
            "estimated_time": "Estimated time to implement in hours"
          }
        ],
        "deployment_strategy": "Overall strategy for deploying these patches",
        "testing_requirements": ["List of specific testing requirements"],
        "estimated_timeline": "Total estimated time for all patches",
        "risk_assessment": {
          "pre_patch_risk": "Risk level before patching",
          "post_patch_risk": "Expected risk level after patching",
          "implementation_risk": "Risk level during implementation"
        }
      }

      Consider the following in your recommendations:
      1. Priority order based on severity
      2. Dependencies between patches
      3. System downtime requirements
      4. Testing needs
      5. Rollback procedures
      6. Verification steps

      Current timestamp: ${CURRENT_TIMESTAMP}
      Analysis requested by: ${CURRENT_USER}`

    } else {
      // Your existing vulnerability analysis prompt
      prompt = `Analyze the following network scan output for vulnerabilities.
      Extract key vulnerabilities, their severity (High, Medium, Low, Informational), how they occurred, what causes them, specific remediation steps, and if applicable, CVE IDs and relevant references (URLs). Also, provide a concise overall summary of the findings and a list of key takeaways/points.
      Assign a risk level (Critical, High, Medium, Low, Informational) to each vulnerability.

      Format the output as a JSON object with the following keys:
      - "summary": (string) A concise overall summary of the findings.
      - "keyPoints": (array of strings) A list of important takeaways or highlights.
      - "vulnerabilities": (array of objects) Each object should have:
        - "vulnerability": (string) Name or description of the vulnerability.
        - "severity": (string) High, Medium, Low, Informational.
        - "riskLevel": (string) Critical, High, Medium, Low, Informational.
        - "occurrence": (string) How this vulnerability was observed or occurred in the scan.
        - "cause": (string) What is the underlying cause of this vulnerability.
        - "remediation": (string) Detailed steps to fix this vulnerability.
        - "cve": (string, optional) Relevant CVE ID (e.g., CVE-2023-1234). If multiple, list them comma-separated.
        - "references": (array of strings, optional) URLs to external resources for more information.
        - "mitigation": (string, optional) Steps to reduce the impact if immediate remediation is not possible.

      Example JSON structure:
      {
        "summary": "The scan identified several critical and high-severity vulnerabilities, primarily related to outdated software and exposed administrative interfaces. Immediate action is required to patch systems and secure access points.",
        "keyPoints": [
          "Outdated Apache version detected.",
          "Exposed phpMyAdmin interface.",
          "Missing security headers."
        ],
        "vulnerabilities": [
          {
            "vulnerability": "Outdated Apache HTTP Server Version",
            "severity": "High",
            "riskLevel": "High",
            "occurrence": "Nmap scan revealed Apache/2.4.41 (Ubuntu) which is known to have multiple vulnerabilities.",
            "cause": "The web server software is not updated to the latest stable version, leaving it susceptible to known exploits.",
            "remediation": "Upgrade Apache HTTP Server to the latest stable version (e.g., 2.4.58 or newer) and apply all security patches.",
            "cve": "CVE-2021-40438, CVE-2021-44790",
            "references": ["https://httpd.apache.org/security/vulnerabilities_24.html"],
            "mitigation": "Implement a Web Application Firewall (WAF) to filter malicious requests."
          }
        ]
      }

      Scan Output:
      ${typeof parsedInput === 'string' ? parsedInput : parsedInput.scanOutput}`
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    console.log(`[${CURRENT_TIMESTAMP}] Raw LLM response text:`, text)

    // Attempt to parse the JSON. Gemini might sometimes return extra text.
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)
    let parsedJson

    if (jsonMatch && jsonMatch[1]) {
      parsedJson = JSON.parse(jsonMatch[1])
    } else {
      // Fallback if code block is not used, try to parse directly
      parsedJson = JSON.parse(text)
    }

    console.log(`[${CURRENT_TIMESTAMP}] Parsed LLM JSON:`, parsedJson)

    // Validate the structure based on request type
    if (parsedInput.type === 'patch_recommendations') {
      if (!parsedJson.patches || !Array.isArray(parsedJson.patches)) {
        throw new Error("Invalid JSON structure from Gemini. Missing patches array.")
      }
    } else {
      if (
        !parsedJson ||
        typeof parsedJson.summary !== "string" ||
        !Array.isArray(parsedJson.keyPoints) ||
        !Array.isArray(parsedJson.vulnerabilities)
      ) {
        throw new Error("Invalid JSON structure from Gemini. Missing summary, keyPoints, or vulnerabilities array.")
      }
    }

    return parsedJson
  } catch (error) {
    console.error(`[${CURRENT_TIMESTAMP}] Error generating Gemini insights:`, error)
    if (parsedInput?.type === 'patch_recommendations') {
      return {
        patches: [],
        deployment_strategy: "Error generating patch recommendations",
        testing_requirements: ["Failed to generate due to LLM error"],
        estimated_timeline: "Unknown due to error",
        error: error.message
      }
    } else {
      return {
        vulnerabilities: [],
        summary: `Error generating LLM insights: ${error.message}. Please ensure GEMINI_API_KEY is correct and try again.`,
        keyPoints: ["Failed to generate key points due to LLM error."],
      }
    }
  }
}