import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext("2d");

  // Dark background
  ctx.fillStyle = "#0F1117";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // Gold circle
  ctx.fillStyle = "#E8A838";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.38, 0, Math.PI * 2);
  ctx.fill();

  const fontSize = size * 0.44;
  const y = size / 2 + fontSize * 0.35;
  const font = `bold italic ${fontSize}px "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif`;

  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // G — dark blue, slightly right
  ctx.fillStyle = "#1E3A5F";
  ctx.fillText("G", size * 0.57, y);

  // A — dark blue, slightly left, overlapping G
  ctx.fillStyle = "#1E3A5F";
  ctx.fillText("A", size * 0.43, y);

  return canvas.toBuffer("image/png");
}

try {
  mkdirSync("public", { recursive: true });
  writeFileSync("public/icon-192.png", drawIcon(192));
  writeFileSync("public/icon-512.png", drawIcon(512));
  console.log("✓ Icons generated — dark blue A&G on gold circle, dark background");
} catch (e) {
  console.error("Failed:", e.message);
}
