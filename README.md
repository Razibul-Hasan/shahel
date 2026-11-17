# Shahel — photographer portfolio

Portfolio site for Juber Ahmed Sahel, a documentary and landscape photographer from Bangladesh.

Built with Next.js (App Router), TypeScript, GSAP, Lenis and three.js. The hero is a 3D field of his photographs that the camera flies through as you scroll.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Portfolio images (Pexels API)

The portfolio grid loads his photos from the Pexels API and caches them for an hour.

1. Get a free key at https://www.pexels.com/api/
2. Copy `.env.example` to `.env.local` and set `PEXELS_API_KEY`
3. Restart the dev server

Without a key the site uses the local copies in `public/photos`. The same data is available as JSON at `/api/portfolio`.

To add a new photo, add its Pexels ID to `meta` in `lib/portfolio.ts`.

## Where things are

- `components/Site.tsx` — page sections, navigation, mobile menu, lightbox
- `components/HeroScene.tsx` — three.js hero
- `lib/contact.ts` — email, phone and social links
- `lib/portfolio.ts` — portfolio data and Pexels API fetch
- `app/globals.css` — all styles
