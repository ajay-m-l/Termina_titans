import { useState, useRef, useEffect } from "react";
import GlassmorphicContainer from "../components/layout/GlassmorphicContainer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "react-hot-toast";

const POLL_INTERVAL = 1200;

export default function Dashboard() {
  const [scanOutput, setScanOutput] = useState("");
  const [customTool, setCustomTool] = useState("");
  const [loading, setLoading] = useState(false);
  const [targetUrl, setTargetUrl] = useState("https://target-planet.com");
  const [selectedTools, setSelectedTools] = useState(new Set());
  const [scanProgress, setScanProgress] = useState({});
  const [activeScans, setActiveScans] = useState({});
  const [vulnerabilityStats, setVulnerabilityStats] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  });

  const pollersRef = useRef({});

  // Fetch vulnerability stats from backend after every scan
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard-summary`);
        if (!res.ok) throw new Error("Failed to fetch dashboard summary");
        const data = await res.json();
        if (
          data &&
          data.statistics &&
          data.statistics.vulnerabilitiesByRisk
        ) {
          setVulnerabilityStats({
            critical: data.statistics.vulnerabilitiesByRisk.Critical || 0,
            high: data.statistics.vulnerabilitiesByRisk.High || 0,
            medium: data.statistics.vulnerabilitiesByRisk.Medium || 0,
            low: data.statistics.vulnerabilitiesByRisk.Low || 0,
            info: data.statistics.vulnerabilitiesByRisk.Info || 0,
          });
        }
      } catch (error) {
        toast.error(`Failed to load vulnerability stats: ${error.message}`);
      }
    }
    fetchStats();
  }, [scanOutput]); // update stats after scan

  useEffect(() => {
    // Clear scan output when target changes
    setScanOutput("");
  }, [targetUrl]);

  const handleToolToggle = (toolId) => {
    const newSelected = new Set(selectedTools);
    if (newSelected.has(toolId)) {
      newSelected.delete(toolId);
    } else {
      newSelected.add(toolId);
    }
    setSelectedTools(newSelected);
  };

  // Start scan, get scanId, and poll for progress
  const handleScan = async (scanType) => {
    setLoading(true);

    setScanOutput("🔄 Initializing scan engines...\n⚡ Loading vulnerability databases...\n🎯 Targeting endpoint...");
    setScanProgress((prev) => ({ ...prev, [scanType]: { percent: 0, status: "Starting" } }));

    let response;
    try {
      response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scan/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanType, target: targetUrl }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      toast.error(`❌ Failed to start scan: ${error.message}`);
      setLoading(false);
      return;
    }
    const { scanId } = await response.json();
    setActiveScans((prev) => ({ ...prev, [scanType]: scanId }));
    setScanProgress((prev) => ({ ...prev, [scanType]: { percent: 0, status: "Starting" } }));

    pollersRef.current[scanType] = setInterval(async () => {
      try {
        const progressResp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scan/progress/${scanId}`);
        if (progressResp.status === 404) return;
        const { percent, status, output } = await progressResp.json();
        setScanProgress((prev) => ({
          ...prev,
          [scanType]: { percent: percent ?? 0, status: status ?? "Running" }
        }));
        if (output) setScanOutput(output);

        if (percent >= 100 || status === "Error" || status === "Done") {
          clearInterval(pollersRef.current[scanType]);
          setLoading(false);
          toast.success(`✅ ${scanType} scan finished!`);
        }
      } catch (error) {
        clearInterval(pollersRef.current[scanType]);
        setLoading(false);
        toast.error(`❌ Scan failed: ${error.message}`);
      }
    }, POLL_INTERVAL);
  };

  const scanTools = [
    {
      id: 'nmap-sV',
      name: 'Nmap (-sV -A -O)',
      description: 'Service & OS detection',
      icon: '🔍',
      color: 'from-blue-500 to-cyan-500',
      risk: 'Low'
    },
    {
      id: 'nmap-vuln',
      name: 'Nmap (--script vuln)',
      description: 'Vulnerability scanning',
      icon: '🛡️',
      color: 'from-yellow-500 to-orange-500',
      risk: 'Medium'
    },
    {
      id: 'nikto',
      name: 'Nikto',
      description: 'Web server scanner',
      icon: '⚡',
      color: 'from-purple-500 to-pink-500',
      risk: 'Medium'
    },
    {
      id: 'whatweb',
      name: 'WhatWeb',
      description: 'Web technology identifier',
      icon: '🌐',
      color: 'from-green-500 to-emerald-500',
      risk: 'Low'
    },
    {
      id: 'nuclei',
      name: 'Nuclei',
      description: 'Fast vulnerability scanner',
      icon: '💥',
      color: 'from-red-500 to-rose-500',
      risk: 'High'
    }
  ];

  const ProgressBar = ({ percent = 0, status = "Idle" }) => {
    let color = "bg-blue-500";
    if (percent >= 100) color = "bg-green-500";
    else if (status === "Error") color = "bg-red-500";
    else if (status === "Running" && percent > 70) color = "bg-yellow-500";
    return (
      <div className="w-full my-2">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-300 font-medium">{status}</span>
          <span className="text-xs text-gray-400">{Math.round(percent)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${percent}%` }} />
        </div>
      </div>
    );
  };

  // Make layout fill more screen (no max-width, more grid columns)
  return (
    <div className="w-full min-h-screen px-0">
      {/* Vulnerability stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(vulnerabilityStats).map(([severity, count]) => (
          <GlassmorphicContainer key={severity} variant="elevated" className="p-4 text-center hover:scale-105 transition-transform duration-200">
            <div className={`text-2xl font-bold ${
              severity === 'critical' ? 'text-red-400' :
              severity === 'high' ? 'text-orange-400' :
              severity === 'medium' ? 'text-yellow-400' :
              severity === 'low' ? 'text-blue-400' : 'text-gray-400'
            }`}>
              {count}
            </div>
            <div className="text-xs text-gray-400 capitalize mt-1">{severity}</div>
          </GlassmorphicContainer>
        ))}
      </div>

      <div className="grid grid-cols-16 gap-8 w-full">
        {/* Mission Control Panel */}
        <div className="col-span-16 lg:col-span-4">
          <GlassmorphicContainer variant="elevated" className="p-6 h-fit">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                  <span className="text-lg animate-pulse">🎯</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Mission Control</h2>
                  <p className="text-xs text-gray-400">Configure and launch security scans</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <label className="text-sm font-semibold text-gray-300">Target Endpoint</label>
                </div>
                <div className="relative">
                  <Input
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter target URL or IP"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🌐
                  </div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <label className="text-sm font-semibold text-gray-300">Scanning Arsenal</label>
                  </div>
                  <div className="text-xs text-gray-400">
                    {selectedTools.size} selected
                  </div>
                </div>
                <div className="space-y-3">
                  {scanTools.map((tool) => (
                    <div
                      key={tool.id}
                      className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                        selectedTools.has(tool.id)
                          ? 'bg-gray-800/50 border-blue-500/50 shadow-lg shadow-blue-500/10'
                          : 'bg-gray-800/20 border-gray-700/30 hover:bg-gray-800/40 hover:border-gray-600/50'
                      }`}
                      onClick={() => handleToolToggle(tool.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                          selectedTools.has(tool.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-600 group-hover:border-gray-500'
                        }`}>
                          {selectedTools.has(tool.id) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}>
                          <span className="text-lg">{tool.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-white">{tool.name}</div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              tool.risk === 'High' ? 'bg-red-500/20 text-red-400' :
                              tool.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {tool.risk}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{tool.description}</div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScan(tool.id);
                          }}
                          disabled={loading}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          {loading && activeScans[tool.id] ? '⏳' : '▶️'}
                        </Button>
                      </div>
                      {/* Progress Bar Placement: Below scan tool info and button */}
                      {scanProgress[tool.id] && (
                        <ProgressBar
                          percent={scanProgress[tool.id].percent}
                          status={scanProgress[tool.id].status}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="space-y-3 pt-4">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    onClick={() => {
                      selectedTools.forEach(toolId => handleScan(toolId));
                    }}
                    disabled={loading || selectedTools.size === 0}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Scanning...</span>
                      </div>
                    ) : (
                      <>🚀 Launch Selected Scans ({selectedTools.size})</>
                    )}
                  </Button>
                  <Button
                    className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white border border-gray-600/50 hover:border-gray-500 py-2 rounded-xl transition-all duration-300"
                    variant="outline"
                  >
                    💻 Advanced Options
                  </Button>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <label className="text-sm font-semibold text-gray-300">Data Analysis</label>
                </div>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-gray-500 transition-colors duration-200 cursor-pointer group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">📁</div>
                  <div className="text-sm text-gray-300 mb-1">Drop files here or click to browse</div>
                  <div className="text-xs text-gray-500">TXT, JSON, XML files supported</div>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></div>
                  <label className="text-sm font-semibold text-gray-300">Custom Arsenal</label>
                </div>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="nmap -sS -O target.com"
                      value={customTool}
                      onChange={(e) => setCustomTool(e.target.value)}
                      className="w-full bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      💻
                    </div>
                  </div>
                  <Button
                    onClick={() => {}}
                    disabled={loading || !customTool.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                  >
                    ⚡
                  </Button>
                </div>
              </div>
            </div>
          </GlassmorphicContainer>
        </div>
        {/* Results Section */}
        <div className="col-span-16 lg:col-span-12">
          <div className="space-y-6">
            {/* Scan Output */}
            <div className="h-96">
              <GlassmorphicContainer variant="elevated" className="p-6 h-full">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <span className="text-sm">💻</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Terminal Output</h2>
                        <p className="text-xs text-gray-400">Real-time scan results and logs</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-black/50 rounded-xl p-4 overflow-y-auto border border-gray-800 font-mono text-sm">
                    {scanOutput ? (
                      <div className="text-green-400 whitespace-pre-wrap">
                        <div className="text-gray-500 mb-2">user@pentest:~$ </div>
                        {scanOutput}
                        <div className="animate-pulse">_</div>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-12 flex flex-col items-center">
                        <div className="text-4xl mb-4 opacity-50">⚡</div>
                        <div>Terminal ready. Execute a scan to see output.</div>
                        <div className="text-xs mt-2 opacity-75">Results will appear here in real-time</div>
                      </div>
                    )}
                  </div>
                </div>
              </GlassmorphicContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}