import { Router } from "express"
import multer from "multer"
import { exec } from "child_process"
import { promisify } from "util"
import rateLimit from 'express-rate-limit'
import validator from 'validator'
import xss from 'xss'
import dns from 'dns'
import { promisify as utilPromisify } from 'util'
import { v4 as uuidv4 } from 'uuid'
import axios from "axios"
import { generateGeminiInsights } from "../utils/gemini-analyzer.js"
import { saveScanResult, getScanHistory, getScanById } from "../utils/db-queries.js"

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })
const execPromise = promisify(exec)
const dnsResolve = utilPromisify(dns.resolve)

const scanProgressStore = {}

const CURRENT_USER = 'Prateek-glitch'
const CURRENT_TIMESTAMP = new Date().toISOString().slice(0, 19).replace('T', ' ')

const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many scan requests, please try again later.'
})

async function resolveTarget(target) {
  const url = new URL(target)
  const ips = await dnsResolve(url.hostname)
  return ips[0]
}

function extractDomain(target) {
  const url = new URL(target)
  return url.hostname
}

function validateTarget(target) {
  if (!target || typeof target !== 'string') throw new Error('Target URL is required')
  target = target.trim()
  if (!validator.isURL(target, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true
  })) throw new Error('Invalid URL format. URL must start with http:// or https://')
  const url = new URL(target)
  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    /^192\.168\./.test(url.hostname) ||
    /^10\./.test(url.hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(url.hostname)
  ) throw new Error('Scanning local or private networks is not allowed')
  return true
}

async function execWithSudo(command) {
  const sudoCommand = `sudo -n ${command}`
  const { stdout, stderr } = await execPromise(sudoCommand, {
    timeout: 600000,
    maxBuffer: 1024 * 1024 * 10
  })
  return stdout || stderr
}

async function execWithoutSudo(command) {
  const { stdout, stderr } = await execPromise(command, {
    timeout: 600000,
    maxBuffer: 1024 * 1024 * 10
  })
  return stdout || stderr
}

async function runNmapScan(scanType, targetUrl) {
  const targetIP = await resolveTarget(targetUrl)
  let cmd = ''
  switch(scanType) {
    case 'nmap-sV-A-O':
      cmd = `nmap -Pn -sV -A -O ${targetIP} -T4 --privileged`
      break
    case 'nmap-script-vuln':
      cmd = `nmap -Pn -sV --script vuln ${targetIP} -T4 --privileged`
      break
    default:
      throw new Error('Invalid scan type')
  }
  const output = await execWithSudo(cmd)
  if (!output || output.includes('0 hosts up')) throw new Error('No hosts were found up during the scan. The target might be blocking our probes.')
  return xss(output)
}

async function runNiktoScan(targetUrl) {
  const cmd = `nikto -h ${targetUrl} -Format txt -nointeractive -Tuning 123bde`
  const output = await execWithSudo(cmd)
  if (!output) throw new Error('Nikto scan produced no output')
  return xss(output)
}

async function runWhatWebScan(targetUrl) {
  const cmd = `whatweb -a 3 --no-errors ${targetUrl}`
  const output = await execWithSudo(cmd)
  if (!output) throw new Error('WhatWeb scan produced no output')
  return xss(output)
}

async function runNucleiScan(targetUrl) {
  const cmd = `nuclei -u ${targetUrl} -severity low,medium,high,critical -silent -timeout 5`
  const output = await execWithSudo(cmd)
  if (!output) return "No vulnerabilities found by Nuclei"
  return xss(output)
}

async function runAmassScan(targetUrl) {
  const domain = extractDomain(targetUrl)
  const cmd = `amass enum -passive -d ${domain} -timeout 10`
  const output = await execWithoutSudo(cmd)
  if (!output) return "No subdomains found by Amass"
  return xss(output)
}

async function runHttpxScan(targetUrl) {
  const domain = extractDomain(targetUrl)
  const cmd = `echo ${domain} | httpx -title -tech-detect -status-code -content-length -timeout 10`
  const output = await execWithoutSudo(cmd)
  if (!output) return "No HTTP information found by httpx"
  return xss(output)
}

async function runSubfinderScan(targetUrl) {
  const domain = extractDomain(targetUrl)
  const cmd = `subfinder -d ${domain} -silent -timeout 10`
  const output = await execWithoutSudo(cmd)
  if (!output) return "No subdomains found by Subfinder"
  return xss(output)
}

async function runDnsxScan(targetUrl) {
  const domain = extractDomain(targetUrl)
  const cmd = `echo ${domain} | dnsx -resp -a -aaaa -cname -mx -ns -txt -silent`
  const output = await execWithoutSudo(cmd)
  if (!output) return "No DNS information found by dnsx"
  return xss(output)
}

async function runNaabuScan(targetUrl) {
  const domain = extractDomain(targetUrl)
  const cmd = `naabu -host ${domain} -top-ports 1000 -silent -timeout 10000`
  const output = await execWithoutSudo(cmd)
  if (!output) return "No open ports found by naabu"
  return xss(output)
}

async function runWappalyzerScan(targetUrl) {
  const cmd = `wappalyzer ${targetUrl}`
  const output = await execWithoutSudo(cmd)
  if (!output) return "No technology stack detected by Wappalyzer"
  return xss(output)
}

async function runTestsslScan(targetUrl) {
  const domain = extractDomain(targetUrl)
  const cmd = `testssl.sh --fast --parallel ${domain}:443`
  const output = await execWithoutSudo(cmd)
  if (!output) return "No SSL/TLS information found by testssl.sh"
  return xss(output)
}

async function runFeroxbusterScan(targetUrl) {
  const cmd = `feroxbuster -u ${targetUrl} -t 10 -d 2 -w /usr/share/wordlists/dirb/common.txt --silent`
  const output = await execWithoutSudo(cmd)
  if (!output) return "No directories found by Feroxbuster"
  return xss(output)
}

// -------------------- ZAPROXY INTEGRATION --------------------
const ZAP_API = process.env.ZAP_API || "http://localhost:8080"

// Start spider scan with ZAP
async function runZapSpider(targetUrl) {
  // Start spider scan
  const spiderResp = await axios.get(`${ZAP_API}/JSON/spider/action/scan/`, {
    params: { url: targetUrl, maxChildren: 10 }
  });
  const scanId = spiderResp.data.scan;
  // Poll for spider completion
  let status = "0";
  let tries = 0;
  while (status !== "100" && tries < 20) {
    const statusResp = await axios.get(`${ZAP_API}/JSON/spider/view/status/`, {
      params: { scanId }
    });
    status = statusResp.data.status;
    await new Promise(res => setTimeout(res, 1000));
    tries++;
  }
  // Get spider results
  const resultsResp = await axios.get(`${ZAP_API}/JSON/spider/view/results/`, {
    params: { scanId }
  });
  return resultsResp.data.results || [];
}

// Start active scan with ZAP
async function runZapActiveScan(targetUrl) {
  // Start active scan
  const activeResp = await axios.get(`${ZAP_API}/JSON/ascan/action/scan/`, {
    params: { url: targetUrl }
  });
  const scanId = activeResp.data.scan;
  // Poll for active scan completion
  let status = "0";
  let tries = 0;
  while (status !== "100" && tries < 60) {
    const statusResp = await axios.get(`${ZAP_API}/JSON/ascan/view/status/`, {
      params: { scanId }
    });
    status = statusResp.data.status;
    await new Promise(res => setTimeout(res, 2000));
    tries++;
  }
  // Get alerts
  const alertsResp = await axios.get(`${ZAP_API}/JSON/core/view/alerts/`, {
    params: { baseurl: targetUrl }
  });
  return alertsResp.data.alerts || [];
}

// ZAPROXY Route
router.post("/zap-scan", scanLimiter, async (req, res) => {
  const { target, type } = req.body; // type: "spider" or "active"
  try {
    validateTarget(target);
    let zapResult;
    if (type === "active") {
      zapResult = await runZapActiveScan(target);
    } else {
      zapResult = await runZapSpider(target);
    }
    // AI analysis if desired, otherwise just return scan results
    let insights = { vulnerabilities: [], summary: "", keyPoints: [] };
    if (type === "active" && zapResult.length > 0) {
      insights = await generateGeminiInsights(JSON.stringify(zapResult));
    }
    res.json({
      result: zapResult,
      insights
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// -------------------------------------------------------------

router.post("/scan/start", scanLimiter, async (req, res) => {
  const { scanType, target } = req.body
  try {
    validateTarget(target)
    const scanId = uuidv4()
    scanProgressStore[scanId] = { percent: 0, status: "Starting" }
    setImmediate(async () => {
      try {
        scanProgressStore[scanId] = { percent: 10, status: "Resolving target" }
        let output = ""
        switch (scanType) {
          case "nmap-sV":
            output = await runNmapScan("nmap-sV-A-O", target)
            scanProgressStore[scanId] = { percent: 70, status: "Analyzing output" }
            break
          case "nmap-vuln":
            output = await runNmapScan("nmap-script-vuln", target)
            scanProgressStore[scanId] = { percent: 70, status: "Analyzing output" }
            break
          case "nikto":
            output = await runNiktoScan(target)
            scanProgressStore[scanId] = { percent: 70, status: "Analyzing output" }
            break
          case "whatweb":
            output = await runWhatWebScan(target)
            scanProgressStore[scanId] = { percent: 70, status: "Analyzing output" }
            break
          case "nuclei":
            output = await runNucleiScan(target)
            scanProgressStore[scanId] = { percent: 70, status: "Analyzing output" }
            break
          case "zap-spider":
            output = JSON.stringify(await runZapSpider(target), null, 2)
            scanProgressStore[scanId] = { percent: 70, status: "Analyzing output" }
            break
          case "zap-active":
            output = JSON.stringify(await runZapActiveScan(target), null, 2)
            scanProgressStore[scanId] = { percent: 70, status: "Analyzing output" }
            break
          default:
            scanProgressStore[scanId] = { percent: 100, status: "Error" }
            return
        }
        scanProgressStore[scanId] = { percent: 90, status: "AI analysis" }
        const insights = await generateGeminiInsights(output)
        scanProgressStore[scanId] = { percent: 100, status: "Done", output, vulnerabilities: insights.vulnerabilities || [] }
      } catch (error) {
        scanProgressStore[scanId] = { percent: 100, status: "Error" }
      }
    })
    res.json({ scanId })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get("/scan/progress/:scanId", (req, res) => {
  const scanId = req.params.scanId
  const progress = scanProgressStore[scanId]
  if (!progress) return res.status(404).json({ percent: 0, status: "Not Found" })
  res.json({
    percent: progress.percent,
    status: progress.status,
    output: progress.output || "",
    vulnerabilities: progress.vulnerabilities || []
  })
})

router.post("/run-scans", scanLimiter, async (req, res) => {
  const { targetUrl, selectedTools } = req.body
  try {
    if (!targetUrl || !selectedTools || !Array.isArray(selectedTools) || selectedTools.length === 0) throw new Error('Target URL and at least one tool are required')
    validateTarget(targetUrl)

    let combinedRawOutput = ""
    let combinedVulnerabilities = []
    let combinedSummary = ""
    let combinedKeyPoints = []
    let errors = []

    for (const tool of selectedTools) {
      try {
        let toolOutput = ""
        let toolInsights = { vulnerabilities: [], summary: "", keyPoints: [] }
        switch (tool) {
          case "nmap-sV-A-O":
            toolOutput = await runNmapScan("nmap-sV-A-O", targetUrl)
            break
          case "nmap-script-vuln":
            toolOutput = await runNmapScan("nmap-script-vuln", targetUrl)
            break
          case "nikto":
            toolOutput = await runNiktoScan(targetUrl)
            break
          case "whatweb":
            toolOutput = await runWhatWebScan(targetUrl)
            break
          case "nuclei":
            toolOutput = await runNucleiScan(targetUrl)
            break
          case "amass":
            toolOutput = await runAmassScan(targetUrl)
            break
          case "httpx":
            toolOutput = await runHttpxScan(targetUrl)
            break
          case "subfinder":
            toolOutput = await runSubfinderScan(targetUrl)
            break
          case "dnsx":
            toolOutput = await runDnsxScan(targetUrl)
            break
          case "naabu":
            toolOutput = await runNaabuScan(targetUrl)
            break
          case "wappalyzer":
            toolOutput = await runWappalyzerScan(targetUrl)
            break
          case "testssl":
            toolOutput = await runTestsslScan(targetUrl)
            break
          case "feroxbuster":
            toolOutput = await runFeroxbusterScan(targetUrl)
            break
          case "zap-spider":
            toolOutput = JSON.stringify(await runZapSpider(targetUrl), null, 2)
            break
          case "zap-active":
            toolOutput = JSON.stringify(await runZapActiveScan(targetUrl), null, 2)
            break
          default:
            throw new Error(`Unknown tool selected: ${tool}`)
        }
        toolInsights = await generateGeminiInsights(toolOutput)
        combinedRawOutput += `\n--- Output from ${tool} ---\n${toolOutput}\n`
        combinedVulnerabilities = combinedVulnerabilities.concat(toolInsights.vulnerabilities)
        combinedSummary += `${toolInsights.summary}\n`
        combinedKeyPoints = combinedKeyPoints.concat(toolInsights.keyPoints)
      } catch (error) {
        errors.push(`${tool}: ${error.message}`)
        combinedRawOutput += `\n--- Error from ${tool} ---\n${error.message}\n`
      }
    }

    if (errors.length === selectedTools.length) throw new Error(`All scans failed: ${errors.join('; ')}`)

    const savedScan = await saveScanResult(
      targetUrl,
      combinedRawOutput,
      JSON.stringify({
        vulnerabilities: combinedVulnerabilities,
        summary: combinedSummary.trim(),
        keyPoints: combinedKeyPoints,
        timestamp: CURRENT_TIMESTAMP,
        user: CURRENT_USER,
        errors: errors.length > 0 ? errors : undefined
      })
    )

    res.json({
      message: errors.length > 0 
        ? `Scans completed with some errors for ${targetUrl}` 
        : `Scans completed successfully for ${targetUrl}!`,
      rawOutput: combinedRawOutput,
      vulnerabilities: combinedVulnerabilities,
      summary: combinedSummary.trim(),
      keyPoints: combinedKeyPoints,
      scanId: savedScan.id,
      timestamp: CURRENT_TIMESTAMP,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get("/history", async (req, res) => {
  try {
    const history = await getScanHistory();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router