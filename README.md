# Django Interview Prep - Precision Timestamp Study Player

A minimal, high-efficiency frontend built with **Vite, React, and Tailwind CSS** for studying the 54 Django Interview Questions from [YouTube](https://www.youtube.com/watch?v=hMwGWqyIKEs).

## Features

- 🎯 **Precision Timestamp Playback**: Plays **only** the exact question/answer segment (from its start timestamp to its end timestamp) and stops automatically when the answer ends.
- ✅ **Progress Tracking Checkbox**: Interactive checkbox for every question to mark it completed. Stored locally in `localStorage`.
- 🔁 **Segment Loop & Auto-Next**:
  - **Loop Mode**: Continuously replay the same question answer until mastered.
  - **Auto-Next**: Automatically advance to the next question when the current answer finishes.
- ⚡ **Speed Controls**: Quick toggle between 1x, 1.25x, 1.5x, and 2x playback speed.
- 🔍 **Live Instant Search**: Filter questions by keywords, concepts, or tags (e.g. `ORM`, `CSRF`, `Signals`, `Middleware`, `select_related`).
- 📂 **Categorized by Sections**:
  - **Part 1**: QuerySet & Command Based (11 questions)
  - **Part 2**: Mostly Asked Questions (16 questions)
  - **Part 3**: Common Questions (16 questions)
  - **Part 4**: Advanced & Rarely Asked (11 questions)
- 📝 **Per-Question Note Taking**: Expand any question card to jot down personal notes and answer summaries (persisted in `localStorage`).
- ⌨️ **Keyboard Shortcuts**:
  - `C`: Toggle completed for the active question
  - `→` / `N`: Next question
  - `←` / `P`: Previous question
  - `?`: Shortcuts help

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

## Deploying to Vercel

### Option 1: Via Vercel Web Dashboard (Recommended)
1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import the repository.
4. Framework Preset will automatically detect **Vite**.
5. Click **Deploy**!

### Option 2: Via Vercel CLI
```bash
npm install -g vercel
vercel
```
