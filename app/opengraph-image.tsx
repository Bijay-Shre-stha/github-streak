import { ImageResponse } from "next/og";

export const alt = "GitHub Streak Stats: current streak, longest streak and README cards";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#09090b",
          color: "#fafafa",
        }}
      >
        <div style={{ fontSize: 80 }}>GitHub Streak Stats</div>
        <div style={{ fontSize: 40, marginTop: 24, color: "#22c55e" }}>
          Current streak · Longest streak · Total contributions
        </div>
        <div style={{ fontSize: 32, marginTop: 24, color: "#a1a1aa" }}>
          Free streak cards for your profile README
        </div>
      </div>
    ),
    size,
  );
}
