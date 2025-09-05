import React from "react";

export default function ScanProgressBar({ percent = 0, status = "Idle", toolName = "" }) {
  let color = "bg-blue-500";
  if (percent >= 100) color = "bg-green-500";
  else if (status === "Error") color = "bg-red-500";
  else if (status === "Running" && percent > 70) color = "bg-yellow-500";

  return (
    <div className="w-full my-2">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-300 font-medium">{toolName}</span>
        <span className="text-xs text-gray-400">{status} {percent}%</span>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}