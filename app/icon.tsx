import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: a camera-lens mark in the site's slate and marigold. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f1b26", borderRadius: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 22, border: "6px solid #f2a900" }}>
          <div style={{ display: "flex", width: 14, height: 14, borderRadius: 7, background: "#eef3f2" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
