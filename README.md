# Hero Animation — Ameer Suhail Experimental Portfolio

A premium, experimental creative developer portfolio hero experience built around an interactive portrait reveal engine. Moving your cursor or dragging across the portrait unleashes a fluid liquid canvas field that reveals an aligned Spider-Man reveal mask underneath.

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)

---

## ✨ Features

- 💧 **Custom HTML Canvas Liquid Engine**: Built from scratch using HTML5 Canvas and a single high-performance `requestAnimationFrame` loop.
- ⚡ **20-Node Physics Chain**: Node 0 follows cursor input while nodes 1–19 follow each other with organic velocity dampening (stretches into a ribbon on fast movement, pools into a drop when resting).
- 🎭 **Dual Portrait Masking**:
  - Base layer: Original dark portrait of Ameer Suhail.
  - Reveal layer: Aligned Spider-Man mask with custom pixel alignment.
- 📱 **Mobile & Touch Support**: Native touch interaction using Pointer Events API (`setPointerCapture`) with automatic desktop (16:9) and mobile (9:16) viewport asset switching.
- ♿ **Accessibility & Reduced Motion**: Full compliance with `prefers-reduced-motion`, semantic layout, and visually-hidden SEO tags.
- 🎨 **Minimal Void Aesthetics**: High-fashion tech aesthetic featuring `#030304` void background, Google Fonts (`Instrument Sans` & `Fragment Mono`), and custom geometric `AS` monogram.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: HTML5 Canvas API (`requestAnimationFrame` & `globalCompositeOperation = "source-in"`)
- **Fonts**: `Instrument Sans` (UI) & `Fragment Mono` (Technical Labels) via `next/font/google`

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js 18.x** or later installed.

### Installation & Local Run

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Ameersuhail799/hero-animation-ameer.git
   cd hero-animation-ameer
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application live.

---

## 📂 Project Structure

```
├── app/
│   ├── globals.css         # Global design tokens, variables, & keyframe animations
│   ├── layout.tsx          # Root layout with Google Fonts setup & metadata
│   └── page.tsx            # Main entry page rendering CognitionHero
├── components/
│   └── cognition-hero.tsx  # Main canvas liquid reveal engine & hero component
├── public/
│   └── images/
│       ├── Base_image_desktop.png   # 16:9 base portrait
│       ├── Base_image_mobile.png    # 9:16 base portrait
│       ├── Reveal_image_desktop.png # 16:9 Spider-Man reveal portrait
│       └── Reveal_image_mobile.png  # 9:16 Spider-Man reveal portrait
├── package.json
└── README.md
```

---

## 📜 License

Created for **Ameer Suhail** — AI/ML Engineer & Creative Developer.
