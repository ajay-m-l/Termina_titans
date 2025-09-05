<div align="center">
  <img src="https://github.com/Prateek-glitch/terminal-titans/blob/main/cyberscan-bg.png" alt="CyberScan Logo" width="150" />
  <h1>CyberScan</h1>
  <p><strong>AI-Powered Vulnerability Scanner & Pentesting Dashboard</strong></p>

  <p>
    <a href="https://github.com/Prateek-glitch/terminal-titans/stargazers"><img src="https://img.shields.io/github/stars/Prateek-glitch/terminal-titans?style=for-the-badge&logo=github&color=FFC107" alt="Stars"></a>
    <a href="https://github.com/Prateek-glitch/terminal-titans/network/members"><img src="https://img.shields.io/github/forks/Prateek-glitch/terminal-titans?style=for-the-badge&logo=github&color=4CAF50" alt="Forks"></a>
    <a href="https://github.com/Prateek-glitch/terminal-titans/issues"><img src="https://img.shields.io/github/issues/Prateek-glitch/terminal-titans?style=for-the-badge&logo=github&color=F44336" alt="Issues"></a>
    <a href="https://github.com/Prateek-glitch/terminal-titans/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Prateek-glitch/terminal-titans?style=for-the-badge&logo=github&color=2196F3" alt="License"></a>
  </p>

  <p><i>A modern, full-stack tool for automated pentesting, LLM-powered analysis, and beautiful reporting.</i></p>
</div>

---

## 🚀 Why CyberScan?

**CyberScan** streamlines network reconnaissance and vulnerability scanning by integrating industry-standard tools into a single, intuitive dashboard. It empowers security teams and ethical hackers to automate their workflow, gain AI-driven insights, and generate professional reports with ease.

Our goal is to provide a powerful, open-source, and locally deployable solution with zero paid dependencies.

---

## ✨ Key Features

-   **🤖 AI-Powered Analysis:** Integrates **Google Gemini** to parse scan outputs, explain vulnerabilities, and suggest remediations.
-   **🛠️ Custom Scan Orchestration:** Run scans using a suite of powerful tools like **Nmap**, **Nikto**, and **WhatWeb** right from the UI.
-   **🖥️ Interactive Dashboard:** A sleek, glassmorphic interface built with **React** and **Tailwind CSS** for a modern user experience.
-   **📄 Automated PDF Reports:** Generate clean, professional PDF summaries of your scan results for easy sharing.
-   **🔍 Missing Tool Detection:** Automatically detects required tools and uses the LLM to provide installation instructions.
-   **📂 File Upload & Analysis:** Upload and analyze existing scan reports or log files.
-   **🌐 100% Local & Free:** Runs entirely on your local machine with no external dependencies or subscription fees.

---

## 📸 UI Previews

| Dashboard View                                                                      | Scan Insights & AI Analysis                                                         |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| ![Dashboard](https://github.com/Prateek-glitch/terminal-titans/blob/main/cyber-1.png) | ![Insights](https://github.com/Prateek-glitch/terminal-titans/blob/main/cyber-2.png) |

---

## 🛠️ Tech Stack

| Category      | Technologies                                                                                                                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | ![Next.js](https://img.shields.io/badge/-Next.js-000000?logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/-React-20232A?logo=react&logoColor=61DAFB) ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwindcss)             |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js) ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white)                                                                                                         |
| **LLM** | ![Google Gemini](https://img.shields.io/badge/-Gemini-4285F4?logo=google&logoColor=white)                                                                                                                                                                            |
| **Scanners** | ![Nmap](https://img.shields.io/badge/-Nmap-00457C?logo=nmap) ![Nikto](https://img.shields.io/badge/-Nikto-EE3A43?logo=ruby) ![Httpx](https://img.shields.io/badge/-Httpx-0E76A8?logo=go) ![WhatWeb](https://img.shields.io/badge/-WhatWeb-CC342D?logo=ruby)         |
| **Reporting** | ![PDFKit](https://img.shields.io/badge/-PDFKit-FF9800?logo=adobeacrobatreader)                                                                                                                                                                                       |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql) _(Optional, via Docker)_                                                                                                                                                              |

---

## ⚙️ Getting Started

### Prerequisites

-   **Node.js & npm:** [Download Here](https://nodejs.org/)
-   **Scanning Tools:** You must have the scanning tools (e.g., Nmap, Nikto) installed on your system PATH.

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/Prateek-glitch/terminal-titans.git](https://github.com/Prateek-glitch/terminal-titans.git)
    cd terminal-titans
    ```

2.  **Install Dependencies:**
    ```bash
    # Install backend dependencies
    npm install

    # Navigate to the frontend directory and install its dependencies
    cd frontend
    npm install
    ```

3.  **Set Up Environment Variables:**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

---

## 🚀 Usage

1.  **Start the Backend Server:**
    From the root directory:
    ```bash
    npm start
    ```

2.  **Start the Frontend Application:**
    In a separate terminal, from the `frontend` directory:
    ```bash
    npm run dev
    ```

3.  **Open Your Browser:**
    Navigate to `http://localhost:3000` to access the CyberScan dashboard.

---

## 🙌 Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or improvements, please feel free to:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeatureName`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some amazing feature'`).
5.  Push to the branch (`git push origin feature/YourFeatureName`).
6.  Open a Pull Request.

Please read our `CONTRIBUTING.md` for more details on our code of conduct and the process for submitting pull requests.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
