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

  // Subtle inner ring
  ctx.strokeStyle = "#C47D1055";
  ctx.lineWidth = size * 0.01;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.33, 0, Math.PI * 2);
  ctx.stroke();

  const fontSize = size * 0.44;
  const y = size / 2 + fontSize * 0.35;

  // Use italic serif — closest to Dancing Script available in Node canvas
  // For true Dancing Script: download .ttf from fonts.google.com and call
  // registerFont('./DancingScript-Bold.ttf', { family: 'Dancing Script' })
  // before createCanvas, then use font-family: 'Dancing Script'
  const font = `bold italic ${fontSize}px "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif`;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // G — dark navy, slightly right
  ctx.fillStyle = "#0F1117";
  ctx.fillText("G", size * 0.57, y);

  // A — cream, slightly left, overlapping G
  ctx.fillStyle = "#F5E6C8";
  ctx.fillText("A", size * 0.43, y);

  return canvas.toBuffer("image/png");
}

try {
  mkdirSync("public", { recursive: true });
  writeFileSync("public/icon-192.png", drawIcon(192));
  writeFileSync("public/icon-512.png", drawIcon(512));
  console.log("✓ Icons generated — public/icon-192.png and public/icon-512.png");
  console.log("  Cream A + navy G on gold circle, dark background");
  console.log("");
  console.log("  Want true Dancing Script cursive?");
  console.log("  1. Download: https://fonts.google.com/specimen/Dancing+Script");
  console.log("  2. Put DancingScript-Bold.ttf in your project root");
  console.log("  3. Add this line before createCanvas():");
  console.log("     registerFont('./DancingScript-Bold.ttf', { family: 'Dancing Script' })");
  console.log("  4. Change font string to: bold italic ${fontSize}px 'Dancing Script', cursive");
} catch (e) {
  console.error("Failed:", e.message);
}
