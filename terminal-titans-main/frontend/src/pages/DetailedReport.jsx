import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LLMInsightsDisplay from "../components/dashboard/LLMInsightsDisplay";

export default function DetailedReport() {
  const { scanId } = useParams();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    // Build your backend endpoint based on whether scanId is present
    const endpoint = scanId
      ? `${import.meta.env.VITE_BACKEND_URL}/api/llm-insights/${scanId}`
      : `${import.meta.env.VITE_BACKEND_URL}/api/llm-insights`;

    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch insights.");
        return res.json();
      })
      .then((data) => {
        // Adjust this if your backend returns a different structure
        setInsights(data.insights || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unknown error occurred.");
        setLoading(false);
      });
  }, [scanId]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl mt-6">
        <h1 className="text-3xl font-bold mb-6 text-white">
          {scanId ? `Detailed LLM Security Insights (Scan #${scanId})` : "LLM Security Insights"}
        </h1>
        {loading && (
          <div className="text-gray-400 text-lg text-center py-10">Loading insights...</div>
        )}
        {error && (
          <div className="text-red-500 text-lg text-center py-10">{error}</div>
        )}
        {!loading && !error && insights.length === 0 && (
          <div className="text-gray-400 text-lg text-center py-10">
            No insights available for this report.
          </div>
        )}
        {!loading && !error && insights.length > 0 && (
          <LLMInsightsDisplay insights={insights} />
        )}
      </div>
    </div>
  );
}