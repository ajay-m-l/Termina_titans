# 🛡️ CyberScan

**AI-Powered Vulnerability Scanner & Pentesting Dashboard**  

[![GitHub stars](https://img.shields.io/github/stars/ajay-m-l/Termina_titans?style=social)](https://github.com/ajay-m-l/Termina_titans/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ajay-m-l/Termina_titans?style=social)](https://github.com/ajay-m-l/Termina_titans/network/members)
[![GitHub issues](https://img.shields.io/github/issues/ajay-m-l/Termina_titans)](https://github.com/ajay-m-l/Termina_titans/issues)
[![GitHub license](https://img.shields.io/github/license/ajay-m-l/Termina_titans)](./LICENSE)

A modern, full-stack tool for **automated pentesting**, **LLM-powered analysis**, and **beautiful reporting**.

---

## 🚀 Why CyberScan?

CyberScan streamlines **network reconnaissance** and **vulnerability scanning** by integrating industry-standard tools into a single, intuitive dashboard.  
It empowers security teams and ethical hackers to automate workflows, gain AI-driven insights, and generate professional reports with ease.  

**Goal:** Provide a **powerful, open-source**, and **locally deployable** solution with **zero paid dependencies**.  

---

## ✨ Key Features
- 🤖 **AI-Powered Analysis** – Integrates Google Gemini to parse scan outputs, explain vulnerabilities, and suggest remediations.  
- 🛠️ **Custom Scan Orchestration** – Run scans using Nmap, Nikto, Httpx, and WhatWeb directly from the UI.  
- 🖥️ **Interactive Dashboard** – Glassmorphic UI built with React + Tailwind CSS.  
- 📄 **Automated PDF Reports** – Generate clean summaries of scan results for easy sharing.  
- 🔍 **Missing Tool Detection** – Auto-detects required tools & provides installation help.  
- 📂 **File Upload & Analysis** – Import and analyze existing reports/logs.  
- 🌐 **100% Local & Free** – Runs on your machine, no subscriptions or external dependencies.  

---

## 📸 UI Previews
| Dashboard | Insights & AI Analysis |
|-----------|------------------------|
| ![Dashboard](./assets/dashboard.png) | ![Insights](./assets/insights.png) |

---

## 🛠️ Tech Stack

| Category   | Technologies |
|------------|--------------|
| Frontend   | Next.js, React, Tailwind CSS |
| Backend    | Node.js, Express |
| LLM        | Google Gemini |
| Scanners   | Nmap, Nikto, Httpx, WhatWeb |
| Reporting  | PDFKit |
| Database   | PostgreSQL (Optional, via Docker) |

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js & npm** → [Download Here](https://nodejs.org/)  
- **Scanning Tools** → Ensure tools like `Nmap`, `Nikto` are installed and added to your system PATH.  

### Installation
```bash
# Clone the Repository
git clone https://github.com/ajay-m-l/Termina_titans.git
cd terminal-titans-main

# Install backend dependencies
npm install

# Navigate to frontend and install dependencies
cd frontend
npm install

🚀 Usage
# Start backend (from root directory)
npm start

# Start frontend (in another terminal, inside frontend folder)
npm run dev


Then open http://localhost:3000
 in your browser to access the CyberScan dashboard.

🙌 Contributing

Contributions are welcome!

Fork the repository

Create a new branch (git checkout -b feature/YourFeature)

Make your changes

Commit (git commit -m "Add feature")

Push (git push origin feature/YourFeature)

Open a Pull Request

Please check the CONTRIBUTING.md for guidelines.
