# DNS Spoofing Lab 🔒

![Simulation Active](https://img.shields.io/badge/Simulation-Active-success)
![Educational Purpose Only](https://img.shields.io/badge/Disclaimer-Educational_Purpose_Only-red)

**Cyber Security Lab 4 – Project 3**

## ⚠️ Disclaimer
**This project is created strictly for educational and academic purposes only.** The tools, techniques, and simulated attacks demonstrated in this repository are intended to help students and security professionals understand network vulnerabilities and how to defend against them. Do not use any concepts presented here to attack or interact with systems and networks without explicit, authorized permission. The author(s) are not responsible for any misuse or damage caused by the information provided in this project.

## 📖 Overview
The **Interactive DNS Spoofing Lab** is a single-page web application designed to simulate and visualize a DNS spoofing (DNS cache poisoning) attack on a local area network (LAN), along with demonstrating an effective modern defence mechanism: **DNS-over-HTTPS (DoH)**.

Featuring a dark, hacker-themed aesthetic with interactive terminal replays and animations, this lab provides a safe, visual environment to understand the mechanics of ARP/DNS spoofing and the cryptographic protections provided by DoH.

## ✨ Features
- **Interactive Network Topology:** Visual representation of the Gateway, Attacker (Kali Linux), and Victim (Windows 10) machines on a shared LAN segment.
- **Attack Simulation:** Step-by-step terminal replay of an attacker crafting a spoof table, hosting a malicious webpage, and executing `dnsspoof`.
- **Victim Logs:** Simulated view of the victim's command prompt and browser network tab during the attack.
- **Defence Implementation Guide:** Interactive guide to configuring DNS-over-HTTPS (DoH) in Google Chrome and Mozilla Firefox.
- **Comparative Analysis Report:** Detailed technical breakdown comparing network traffic and security posture "Before Defence" (UDP Port 53) and "After Defence" (HTTPS/TLS Port 443).

## 🚀 Getting Started

Simply open the `index.html` file in any modern web browser to start the interactive simulation. No server or dependencies are required for the frontend visualizer.

```bash
git clone https://github.com/yourusername/dns-spoofing-lab.git
cd dns-spoofing-lab
# Open index.html in your browser
```

## 🛠️ Built With
- **HTML5** - Semantic structure and layout.
- **CSS3** - Custom styling, "glitch" animations, and dark hacker aesthetic.
- **Vanilla JavaScript** - Interactive logic, terminal animations, and state management.
- **SVG** - Animated network topology diagrams.

## 📁 Project Structure
- `index.html` - The main interactive application.
- `style.css` - Stylesheet for the application.
- `app.js` - JavaScript logic for animations and section switching.
- `DNS_Spoofing_Lab_Report.md` / `report.html` - Comprehensive technical lab report.
- `spoofed_page/` - Contains the simulated malicious landing page shown to the victim.

## 🎓 Academic Context
This project was developed for **Cyber Security Lab 4, Project 3**.
*Instructor: Ishrat Jabeen*
