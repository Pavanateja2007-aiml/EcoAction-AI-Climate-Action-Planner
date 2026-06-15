# 🌿 EcoAction AI — Climate Action Planner

> **AI-Powered Climate Awareness and Carbon Footprint Advisor**

EcoAction AI helps users measure and reduce their environmental impact. Powered by Google Gemini AI, it analyzes your daily activities — travel, energy use, and waste generation — estimates your carbon emissions, and delivers personalized recommendations to help you build sustainable habits.

This project supports **SDG 13: Climate Action** 🌍

[![Live App](https://img.shields.io/badge/Live%20App-AI%20Studio-blue?style=for-the-badge)](https://ai.studio/apps/40518cc7-22ee-41e0-a01d-baecde69562b)
[![TypeScript](https://img.shields.io/badge/TypeScript-97.8%25-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

---

## ✨ Features

- **Carbon Footprint Analysis** — Estimates CO₂ emissions from your travel, energy, and waste habits
- **AI-Personalized Recommendations** — Gemini AI generates actionable tips tailored to your lifestyle
- **Daily Activity Tracking** — Log activities across multiple categories for ongoing awareness
- **SDG 13 Alignment** — Supports the United Nations Sustainable Development Goal on Climate Action
- **Modern, Responsive UI** — Built with React 19, Tailwind CSS v4, and smooth animations via Motion

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| Backend | Node.js, Express, TypeScript (`server.ts`) |
| AI | Google Gemini API (`@google/genai`) |
| Build Tool | Vite 6 |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |

---

## 📁 Project Structure

```
ecoaction-ai---climate-action-planner/
├── index.html          # App entry point
├── server.ts           # Express backend server
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies & scripts
├── metadata.json       # App metadata
├── .env.example        # Environment variable template
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- A **Google Gemini API key** — get one at [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Pavanateja2007-aiml/ecoaction-ai---climate-action-planner.git
   cd ecoaction-ai---climate-action-planner
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example env file and add your Gemini API key:

   ```bash
   cp .env.example .env.local
   ```

   Then open `.env.local` and set:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173` (or the port Vite assigns).

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server (frontend + backend via `tsx`) |
| `npm run build` | Build for production (Vite + esbuild for server) |
| `npm run start` | Run the production server |
| `npm run lint` | Type-check with TypeScript (`tsc --noEmit`) |
| `npm run clean` | Remove build artifacts |

---

## 🌐 Live Demo

Try the app live on Google AI Studio:
👉 [https://ai.studio/apps/40518cc7-22ee-41e0-a01d-baecde69562b](https://ai.studio/apps/40518cc7-22ee-41e0-a01d-baecde69562b)

---

## 🌱 How It Works

1. **Input your daily activities** — transportation choices, home energy usage, diet, and waste generation.
2. **AI calculates your carbon footprint** — using established emission factors and Gemini's analytical capability.
3. **Receive personalized advice** — the AI generates specific, achievable recommendations to lower your impact.
4. **Track your progress** — revisit and update activities over time to see your improvements.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Open a Pull Request

---

## 📄 License

This project is open source. Please check the repository for license details.

---

## 🙏 Acknowledgements

- [Google Gemini AI](https://deepmind.google/technologies/gemini/) — for the AI backbone
- [Google AI Studio](https://aistudio.google.com/) — for hosting and development tools
- [United Nations SDG 13](https://sdgs.un.org/goals/goal13) — Climate Action framework
- [Lucide Icons](https://lucide.dev/) — for clean, open-source icons

---

<div align="center">
  <p>Built with 💚 for a sustainable future</p>
  <p><strong>EcoAction AI</strong> — Small actions, big impact.</p>
</div>
