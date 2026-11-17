/**
 * Portfolio data.
 *
 * With PEXELS_API_KEY set, every photo is loaded live from the Pexels API
 * (https://www.pexels.com/api/) and cached for an hour. Without a key, or if a
 * request fails, the local copies in /public/photos are used instead so the
 * site always works.
 */

export type Photo = {
  id: number;
  title: string;
  tag: string;
  w: number;
  h: number;
  grid: string;
  full: string;
  alt: string;
  color: string;
};

export type Portfolio = { photos: Photo[]; source: "pexels" | "local" };

type Meta = { title: string; tag: string; local: string; w: number; h: number };

/** His Pexels photos: https://www.pexels.com/@jubersahel/ */
const meta: Record<number, Meta> = {
  41052105: { title: "The crossing", tag: "Documentary", local: "/photos/p3.jpg", w: 1400, h: 933 },
  41052107: { title: "River and sky", tag: "Landscape", local: "/photos/p1.jpg", w: 1400, h: 821 },
  41052101: { title: "Casting the net", tag: "Documentary", local: "/photos/p7.jpg", w: 1400, h: 1142 },
  41052103: { title: "Where the water falls", tag: "Landscape", local: "/photos/p5.jpg", w: 1400, h: 933 },
  41052098: { title: "Road home", tag: "Landscape", local: "/photos/p10.jpg", w: 1400, h: 933 },
  41052104: { title: "Hill village, morning", tag: "Documentary", local: "/photos/p4.jpg", w: 1400, h: 933 },
  41052096: { title: "Embankment, dawn", tag: "Street", local: "/photos/p12.jpg", w: 1400, h: 933 },
  41052106: { title: "Morning rays", tag: "Nature", local: "/photos/p2.jpg", w: 1400, h: 1050 },
  41052100: { title: "Storm over the fields", tag: "Landscape", local: "/photos/p8.jpg", w: 1400, h: 922 },
  41052099: { title: "Golden haze", tag: "Landscape", local: "/photos/p9.jpg", w: 1400, h: 807 },
  41052102: { title: "The long walk", tag: "Landscape", local: "/photos/p6.jpg", w: 1400, h: 932 },
  41052097: { title: "Green without end", tag: "Landscape", local: "/photos/p11.jpg", w: 1400, h: 933 },
};

const ids = Object.keys(meta).map(Number);

const fromLocal = (id: number): Photo => {
  const m = meta[id];
  return { id, title: m.title, tag: m.tag, w: m.w, h: m.h, grid: m.local, full: m.local, alt: m.title, color: "#223344" };
};

type PexelsPhoto = {
  width: number;
  height: number;
  avg_color?: string;
  alt?: string;
  src: { large: string; large2x: string };
};

export async function getPortfolio(): Promise<Portfolio> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return { photos: ids.map(fromLocal), source: "local" };

  const results = await Promise.all(
    ids.map(async (id): Promise<PexelsPhoto | null> => {
      try {
        const res = await fetch(`https://api.pexels.com/v1/photos/${id}`, {
          headers: { Authorization: key },
          next: { revalidate: 3600 },
        });
        return res.ok ? ((await res.json()) as PexelsPhoto) : null;
      } catch {
        return null;
      }
    })
  );

  let live = 0;
  const photos = ids.map((id, i) => {
    const j = results[i];
    if (!j) return fromLocal(id);
    live++;
    const m = meta[id];
    return {
      id,
      title: m.title,
      tag: m.tag,
      w: j.width,
      h: j.height,
      grid: j.src.large,
      full: j.src.large2x,
      alt: j.alt || m.title,
      color: j.avg_color || "#223344",
    } satisfies Photo;
  });
  return { photos, source: live > 0 ? "pexels" : "local" };
}

/** Local copies used inside the 3D hero (WebGL textures need same-origin images). */
export const heroPhotos = [
  { src: "/photos/p1.jpg", w: 1400, h: 821 },
  { src: "/photos/p3.jpg", w: 1400, h: 933 },
  { src: "/photos/p7.jpg", w: 1400, h: 1142 },
  { src: "/photos/p5.jpg", w: 1400, h: 933 },
  { src: "/photos/p10.jpg", w: 1400, h: 933 },
  { src: "/photos/p4.jpg", w: 1400, h: 933 },
  { src: "/photos/p12.jpg", w: 1400, h: 933 },
  { src: "/photos/p2.jpg", w: 1400, h: 1050 },
  { src: "/photos/p8.jpg", w: 1400, h: 922 },
  { src: "/photos/p9.jpg", w: 1400, h: 807 },
  { src: "/photos/p6.jpg", w: 1400, h: 932 },
  { src: "/photos/p11.jpg", w: 1400, h: 933 },
];
