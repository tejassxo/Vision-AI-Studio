# Visions AI: Creative Studio 🌌✨

Visions AI is an immersive, high-performance web application designed for creating, refining, and variation-generating stunning custom artwork using **Gemini 2.5 Flash Image**. Built with a sleek minimalist design, modern typography, custom canvas-based physics particles, and smooth GSAP entrance choreography.

---

## 🎨 Design Philosophy & User Experience

- **Minimalist Slate Theme**: Centered around high contrast, gorgeous negative space, and premium material aesthetics. The studio supports both crisp light and atmospheric dark modes.
- **Rushing Meteors Background**: A fully responsive, lightweight Canvas-based physics animation that adjusts its blending modes and colors seamlessly to match active light or dark aesthetics.
- **GSAP Cinema-Grade Entry**: Choreographed, staggered entry animations for text elements, call-to-actions, and highlights that build a high-end visual greeting card layout.
- **Atmospheric Depth**: Immersive glowing gradients and backdrops active in dark mode to complement liquid reflection, glassmorphic refraction, and glowing cybernetic presets.

---

## ⚡ Core Features

- **Text-to-Image Generation**: Directly query **Gemini 2.5 Flash Image** with custom, descriptive prompts.
- **Intelligent Refinement (Inpainting / Edits)**: Select any generated vision to modify it on-the-fly (e.g., *"add a giant glowing moon"*, *"make it rain"*, *"shift color palette to neon purple"*).
- **Style Presets**: One-click integrations for high-end styles including *Glassmorphism*, *Surrealism*, *Cyberpunk*, *Pencil Sketch*, *Oil Painting*, and advanced futuristic *Gemini Neural Networks*.
- **Subtle Variations**: Effortlessly create sibling variants of an image, preserving the core style and structure while introducing fine detailed differences.
- **Interactive History**: Review previously generated visions with standard key-value local persistence caching across page reloads.
- **Download Ready**: Instantly save your favorite generated canvases in high-fidelity PNG formats.

---

## 🛠️ Technology Stack

- **Frontend Framework**: [React 18+](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling Engine**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [GSAP](https://gsap.com/) (GreenSock) for high-precision landing elements, and [Motion](https://motion.dev/) (Framer) for dynamic UI transitions.
- **AI Core**: `@google/genai` with `gemini-2.5-flash-image` SDK.
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Setup & Installation

Follow these steps to run the application locally or prepare it for custom deployment:

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd visions-ai
npm install
```

### 2. Configure Environment Secrets
Ensure you have your **Gemini API Key** provided in your environment.
```bash
export GEMINI_API_KEY="your-api-key-here"
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```text
├── src/
│   ├── components/
│   │   └── MeteorsCanvas.tsx   # Canvas-based shooting meteor particles
│   ├── lib/
│   │   └── utils.ts            # Utility helpers (e.g., cn Tailwind merger)
│   ├── App.tsx                 # Core studio and landing application layout
│   ├── main.tsx                # Client entry point
│   └── index.css               # Global tailwind integrations and custom web fonts
├── metadata.json               # Application metadata
└── package.json                # Dependencies and deployment scripts
```

---

## 📜 License
This project is licensed under the **Apache-2.0 License**. Feel free to use, modify, and distribute with attribution.
