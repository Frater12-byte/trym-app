import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FF6B35",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "80px",
        }}
      >
        <div
          style={{
            color: "#FFF8EE",
            fontSize: 260,
            fontWeight: 900,
            fontFamily: "serif",
            letterSpacing: "-8px",
            lineHeight: 1,
          }}
        >
          T
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
