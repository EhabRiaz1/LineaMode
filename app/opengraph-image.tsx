import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Lineamode Apparel — From Idea to Execution";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#E1E1DC",
          color: "#201C1D",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "Helvetica, Arial, sans-serif",
            textTransform: "uppercase",
            letterSpacing: 4,
            fontSize: 14,
            opacity: 0.6,
          }}
        >
          <span>LINEA — MODE  ·  Apparel</span>
          <span>Est. Islamabad</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 18,
              textTransform: "uppercase",
              letterSpacing: 4,
              opacity: 0.6,
              fontFamily: "Helvetica, Arial, sans-serif",
            }}
          >
            From Idea to Execution
          </span>
          <span
            style={{
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: -3,
              fontWeight: 300,
            }}
          >
            Engineered
          </span>
          <span
            style={{
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: -3,
              fontStyle: "italic",
              fontWeight: 200,
            }}
          >
            knit. Considered.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontSize: 16,
            opacity: 0.55,
          }}
        >
          <span>End-to-end clothing manufacturer · Knitwear · Performance polyester</span>
          <span>www.lineamode.com</span>
        </div>
      </div>
    ),
    size,
  );
}
