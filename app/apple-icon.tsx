import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iPhone and iPad. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f1b26" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 124, height: 124, borderRadius: 62, border: "16px solid #f2a900" }}>
          <div style={{ display: "flex", width: 40, height: 40, borderRadius: 20, background: "#eef3f2" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
