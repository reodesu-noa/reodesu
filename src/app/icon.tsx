import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "#f0a83a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 200,
          }}
        >
          💴
        </div>
      </div>
    ),
    { ...size }
  );
}
