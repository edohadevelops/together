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
  ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Letter A
  ctx.fillStyle = "#0F1117";
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("A", size / 2, size / 2 + size * 0.02);

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
