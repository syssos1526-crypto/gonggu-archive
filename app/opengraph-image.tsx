import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Next.js 공식 Open Graph 이미지 파일 컨벤션 — 이 파일이 있으면 og:image(그리고
// 별도 twitter-image가 없으므로 twitter:image도) 메타 태그가 자동 생성된다.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [iconBuffer, boldFont, extraBoldFont] = await Promise.all([
    readFile(join(process.cwd(), "public/brand/zen-a-icon.png")),
    readFile(join(process.cwd(), "node_modules/pretendard/dist/public/static/Pretendard-Bold.otf")),
    readFile(
      join(process.cwd(), "node_modules/pretendard/dist/public/static/Pretendard-ExtraBold.otf")
    ),
  ]);
  const iconSrc = `data:image/png;base64,${iconBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#26422A",
          position: "relative",
        }}
      >
        {/* 포인트 컬러는 절제해서 — 상단 얇은 플레임 라인 하나만 장식으로 사용 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            display: "flex",
            width: "100%",
            height: 12,
            backgroundColor: "#EA672D",
          }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconSrc}
          alt="ZEN-A"
          width={220}
          height={220}
          style={{ borderRadius: 40 }}
        />

        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontSize: 100,
            fontWeight: 800,
            fontFamily: "Pretendard",
            color: "#FFEEBC",
            letterSpacing: 14,
          }}
        >
          ZEN-A
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 34,
            fontWeight: 700,
            fontFamily: "Pretendard",
            color: "#D2E8FF",
          }}
        >
          함께 발견하는 공구
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
      fonts: [
        { name: "Pretendard", data: boldFont, weight: 700, style: "normal" },
        { name: "Pretendard", data: extraBoldFont, weight: 800, style: "normal" },
      ],
    }
  );
}
