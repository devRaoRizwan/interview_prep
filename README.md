# Backend Dev Journey - 10-Day Focused Interview Prep

A clean, distraction-free web app for mastering 54 core backend development & Django interview questions at a disciplined pace of **5 questions per day** across a **10-day roadmap**.

Inspired by [comback2026.vercel.app](https://comback2026.vercel.app/).

## Key Features

- 🎯 **One Video at a Time**: No overwhelming feeds. Focus on one question, master it, and unlock the next.
- 🔒 **Progression Lock**:
  - Questions are locked until the preceding question is marked as completed.
  - Keeps you disciplined and focused on small, daily milestones.
  - Can toggle "Progression Lock" ON/OFF anytime in the sidebar.
- ⏱️ **Precision Segment Playback**:
  - Automatically plays **only that question's exact answer** (starts at question timestamp and stops automatically at the end of the answer).
  - Replay answer, $\pm5\text{s}$ scrub controls, speed toggles (1x, 1.25x, 1.5x, 2x), and loop answer mode.
- 📚 **In-Depth Reading & Articles**:
  - Every single question includes curated direct links to official Django documentation and Real Python guides.
- 📅 **10-Day Structured Roadmap**:
  - **Day 1**: CLI & Environment Setup (Q1 – Q5)
  - **Day 2**: QuerySet & Basic CRUD (Q6 – Q10)
  - **Day 3**: Architecture & Request Flow (Q11 – Q15)
  - **Day 4**: ORM, Migrations & Server (Q16 – Q20)
  - **Day 5**: Security & Query Optimization (Q21 – Q25)
  - **Day 6**: Static Files & Comparisons (Q26 – Q30)
  - **Day 7**: Views, Auth & Q Objects (Q31 – Q35)
  - **Day 8**: URLs, DRF, Middleware & Sessions (Q36 – Q40)
  - **Day 9**: Signals, Context & Exceptions (Q41 – Q45)
  - **Day 10**: Advanced Models, Views & Caching (Q46 – Q54)
- 📝 **Personal Interview Notes**:
  - Scratchpad for each question stored automatically in `localStorage`.
- ✅ **One-Click Checkbox**:
  - Prominent "Mark as Done & Unlock Next Question" button with immediate unlock feedback.

## Running Locally

```bash
cd /home/rao/Desktop/PREP
npm run dev
```

Open `http://localhost:5173` in your browser.

## Deploying to Vercel

```bash
git add .
git commit -m "Deploy 10-day locked playlist"
git push origin main
```
Import the repository on [vercel.com/new](https://vercel.com/new) and click **Deploy**.
