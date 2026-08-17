import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0e14",
        }}
      >
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: "#f0a83a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 80,
          }}
        >
          💴
        </div>
      </div>
    ),
    { ...size }
  );
}
