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

  // Letter A
  ctx.fillStyle = "#0F1117";
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // A in dark blue, & small grey, G in pinkish red
  const fontSize = size * 0.32;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Measure each character to position them
  const aWidth   = ctx.measureText("A").width;
  const ampWidth = ctx.measureText("&").width;
  const gWidth   = ctx.measureText("G").width;
  const total    = aWidth + ampWidth * 0.6 + gWidth;
  let x = size / 2 - total / 2;
  const y = size / 2 + size * 0.02;

  // A — dark navy
  ctx.fillStyle = "#0F1117";
  ctx.textAlign = "left";
  ctx.fillText("A", x, y);
  x += aWidth;

  // & — slightly lighter navy
  ctx.font = `bold ${fontSize * 0.55}px Arial`;
  ctx.fillStyle = "#1E2A3A";
  ctx.fillText("&", x + ampWidth * 0.05, y + fontSize * 0.08);
  x += ampWidth * 0.6;

  // G — dark navy
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = "#0F1117";
  ctx.fillText("G", x, y);

  return canvas.toBuffer("image/png");
}

try {
  mkdirSync("public", { recursive: true });
  writeFileSync("public/icon-192.png", drawIcon(192));
  writeFileSync("public/icon-512.png", drawIcon(512));
  console.log("✓ Icons generated — public/icon-192.png and public/icon-512.png");
} catch (e) {
  console.error("Failed:", e.message);
}
