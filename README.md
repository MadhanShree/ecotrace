# 🌱 EcoTrace — Your Personal Carbon Coach

> Built for **PromptWars Virtual · Main Challenge 3 — Carbon Footprint Awareness Platform**

Most carbon calculators stop at a number and leave you feeling guilty. **EcoTrace goes one step further: it turns that number into a ranked, personalized action plan and lets you simulate the payoff before you commit.** Understand → track → *actually reduce*.

**Live demo:** _add your deployed link here_
**Demo video / LinkedIn build post:** _add your link here_

---

## Why this is different

The brief asks for a platform that helps people "understand, track, and reduce their carbon footprint through **simple actions and personalized insights**." Most submissions will nail "understand" (a calculator) and stop. EcoTrace is built around the harder, higher-value half — *reduce*:

1. **Impact-per-effort ranking.** Every recommended action computes its *personal* saving from your own data, then sorts by **biggest cut for least effort** — so the highest-leverage, lowest-friction wins surface first instead of a generic checklist.
2. **Live "what-if" simulator.** Toggle the actions you'd realistically do and watch your projected footprint fall in real time, with a clear "you'd hit the Paris-aligned target" moment. This converts an abstract tonnage into agency.
3. **Commitment tracking — the actual "track".** Commit to a set of actions and EcoTrace remembers them: a persistent plan banner shows what you committed to, how long ago, and a check-in streak. This is what makes it a platform, not a one-shot calculator.
4. **Personalized AI coaching (Google Gemini).** A short, human weekly nudge generated from your profile — with a built-in rules-based fallback so the app is **fully functional with zero API keys** for evaluation.
5. **One-tap sharing.** A "Share on LinkedIn" card with a ready-made caption (pre-filled with your tonnage and committed savings), closing the loop to public awareness.
6. **Transparent, defensible methodology.** Emission factors are documented and sourced (below), not magic numbers.

## Features

- Four-step onboarding quiz (transport, diet, home energy, lifestyle)
- Animated footprint breakdown by category + benchmark comparison (you vs. global average, Paris 2030 target, US average)
- Personalized, ranked action cards with per-action CO₂ savings, effort, and cost
- Real-time reduction simulator with "trees equivalent" intuition pump
- Commit-to-a-plan tracking with a persistent banner, day counter, and check-ins
- "Share on LinkedIn" card with an auto-generated caption
- Results and your plan persist locally between visits; "Update answers" preserves your inputs
- Charts lazy-loaded for a fast first paint; fully responsive, no backend required

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 + Vite | Fast, modern, trivially deployable as a static site |
| Charts | Recharts | Clean, responsive data viz |
| AI | Google Gemini (`gemini-2.5-flash`) | Personalized coaching on Google's free tier; aligns with the Google for Developers partnership |
| Persistence | `localStorage` | Zero-infra, privacy-friendly (your data never leaves your browser) |
| Hosting | Vercel / Netlify (static) | One-command deploy |

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
npm run preview  # preview the build
```

## Testing & quality

The project ships with a Vitest unit + component test suite and an ESLint config.

```bash
npm test     # run the test suite (Vitest)
npm run lint # static analysis (ESLint)
```

Tests cover the footprint engine (`calculator`), the impact-ranking logic (`actions`),
commitment persistence (`commitments`), the coaching fallback (`ai`), and the onboarding
component. CI (`.github/workflows/ci.yml`) runs lint, tests, and a production build on every push.

## Enable AI coaching (optional)

The app works fully without this — it falls back to a built-in coach.

```bash
cp .env.example .env
# then set VITE_GEMINI_API_KEY=your_key   (FREE, no card: https://aistudio.google.com/app/apikey)
```

> Security: a client-side key is fine for a demo (Gemini allows browser calls and you can restrict the key by HTTP referrer in Google AI Studio / Cloud Console). For a hardened production deploy, move it server-side behind a serverless function.

## Deploy in one step

**Vercel:** import the repo → framework preset **Vite** → (optionally add `VITE_GEMINI_API_KEY`) → Deploy.
**Netlify:** build command `npm run build`, publish directory `dist`.

## Methodology & sources

EcoTrace produces **directional estimates** from published average emission factors — enough to compare choices and prioritize, not an audited inventory. All factors live in `src/lib/factors.js`.

- **Transport** — per-km factors for petrol/diesel/hybrid/EV and rail/bus; per-trip flight factors. Based on UK DEFRA 2023 greenhouse gas conversion factors.
- **Diet** — annual dietary footprints by pattern (heavy-meat → vegan), based on Poore & Nemecek (2018, *Science*) and Scarborough et al. (2014).
- **Home energy** — grid electricity factor (global average ~0.4 kg CO₂e/kWh, adjusted for your renewable share) plus heating by fuel type; shared emissions divided across household size.
- **Goods** — annual consumption footprint banded by shopping intensity.
- **Benchmarks** — per-capita figures from Our World in Data / Global Carbon Project; Paris-aligned 2030 target (~2.3 t) from IPCC 1.5 °C pathways.

Factors