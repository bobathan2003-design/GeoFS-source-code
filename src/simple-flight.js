const canvas = document.getElementById("flight-canvas");
const ctx = canvas.getContext("2d");

const hud = {
  speed: document.getElementById("hud-speed"),
  altitude: document.getElementById("hud-altitude"),
  heading: document.getElementById("hud-heading"),
  throttle: document.getElementById("hud-throttle"),
};

const keys = new Set();
const runway = { x: 0, y: 1800, width: 120, length: 1800 };
let lastTime = performance.now();
let flight;

function resetFlight() {
  flight = {
    x: 0,
    y: -650,
    altitude: 950,
    speed: 118,
    heading: 0,
    pitch: 0,
    bank: 0,
    throttle: 0.58,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(degrees) {
  return ((degrees % 360) + 360) % 360;
}

function formatHeading(degrees) {
  return String(Math.round(normalizeAngle(degrees))).padStart(3, "0") + "°";
}

function update(dt) {
  if (keys.has("KeyR")) resetFlight();

  if (keys.has("KeyW")) flight.throttle += dt * 0.32;
  if (keys.has("KeyS")) flight.throttle -= dt * 0.32;
  flight.throttle = clamp(flight.throttle, 0, 1);

  if (keys.has("ArrowLeft")) flight.bank -= dt * 58;
  if (keys.has("ArrowRight")) flight.bank += dt * 58;
  if (!keys.has("ArrowLeft") && !keys.has("ArrowRight")) flight.bank *= Math.pow(0.2, dt);

  if (keys.has("ArrowUp")) flight.pitch -= dt * 28;
  if (keys.has("ArrowDown")) flight.pitch += dt * 28;
  if (!keys.has("ArrowUp") && !keys.has("ArrowDown")) flight.pitch *= Math.pow(0.34, dt);

  if (keys.has("Space")) {
    flight.bank *= Math.pow(0.04, dt);
    flight.pitch *= Math.pow(0.04, dt);
  }

  flight.bank = clamp(flight.bank, -55, 55);
  flight.pitch = clamp(flight.pitch, -18, 18);

  const targetSpeed = 65 + flight.throttle * 185 - Math.max(0, flight.pitch) * 2.2;
  flight.speed += (targetSpeed - flight.speed) * dt * 0.55;
  flight.speed = clamp(flight.speed, 35, 260);

  flight.heading = normalizeAngle(flight.heading + flight.bank * dt * 0.72);

  const headingRadians = (flight.heading - 90) * Math.PI / 180;
  const distance = flight.speed * dt * 2.15;
  flight.x += Math.cos(headingRadians) * distance;
  flight.y += Math.sin(headingRadians) * distance;

  const climbRate = (flight.pitch * 65 + (flight.throttle - 0.45) * 260) * dt;
  flight.altitude = Math.max(0, flight.altitude + climbRate);

  if (flight.altitude <= 0 && flight.speed > 70) {
    flight.pitch = Math.max(0, flight.pitch);
    flight.altitude = 0;
  }
}

function drawSky(width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#6fc8ff");
  gradient.addColorStop(0.48, "#d8f3ff");
  gradient.addColorStop(0.49, "#447a38");
  gradient.addColorStop(1, "#172817");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
  for (const cloud of [[0.16, 0.2], [0.52, 0.13], [0.8, 0.24]]) {
    const x = width * cloud[0];
    const y = height * cloud[1];
    ctx.beginPath();
    ctx.ellipse(x, y, 70, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 42, y + 6, 58, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 42, y + 8, 52, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function worldToScreen(pointX, pointY, width, height) {
  const scale = clamp(1.1 - flight.altitude / 9000, 0.2, 0.9);
  const dx = pointX - flight.x;
  const dy = pointY - flight.y;
  return {
    x: width / 2 + dx * scale,
    y: height * 0.62 + dy * scale,
    scale,
  };
}

function drawRunway(width, height) {
  const start = worldToScreen(runway.x, runway.y, width, height);
  const end = worldToScreen(runway.x, runway.y + runway.length, width, height);
  const runwayWidth = runway.width * start.scale;

  ctx.save();
  ctx.fillStyle = "#242833";
  ctx.strokeStyle = "#fafafa";
  ctx.lineWidth = Math.max(2, 5 * start.scale);

  ctx.beginPath();
  ctx.moveTo(start.x - runwayWidth, start.y);
  ctx.lineTo(start.x + runwayWidth, start.y);
  ctx.lineTo(end.x + runwayWidth * 1.5, end.y);
  ctx.lineTo(end.x - runwayWidth * 1.5, end.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#ffe66d";
  ctx.setLineDash([28 * start.scale, 22 * start.scale]);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y + 18);
  ctx.lineTo(end.x, end.y - 18);
  ctx.stroke();
  ctx.restore();
}

function drawAircraft(width, height) {
  ctx.save();
  ctx.translate(width / 2, height / 2 + 42);
  ctx.rotate(flight.bank * Math.PI / 180);

  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.beginPath();
  ctx.ellipse(10, 34, 72, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f7fbff";
  ctx.strokeStyle = "#18324f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -62);
  ctx.lineTo(18, 28);
  ctx.lineTo(92, 54);
  ctx.lineTo(18, 62);
  ctx.lineTo(0, 92);
  ctx.lineTo(-18, 62);
  ctx.lineTo(-92, 54);
  ctx.lineTo(-18, 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#67d8ff";
  ctx.beginPath();
  ctx.ellipse(0, -8, 13, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawInstruments(width, height) {
  const horizonY = height * 0.5 + flight.pitch * 5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 150, horizonY);
  ctx.lineTo(width / 2 - 50, horizonY);
  ctx.moveTo(width / 2 + 50, horizonY);
  ctx.lineTo(width / 2 + 150, horizonY);
  ctx.stroke();

  ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
  ctx.fillRect(width / 2 - 110, height - 82, 220, 54);
  ctx.fillStyle = "#9af46e";
  ctx.font = "700 18px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.fillText(`Pitch ${flight.pitch.toFixed(1)}°   Bank ${flight.bank.toFixed(1)}°`, width / 2, height - 48);
}

function draw() {
  const width = canvas.width;
  const height = canvas.height;
  drawSky(width, height);
  drawRunway(width, height);
  drawAircraft(width, height);
  drawInstruments(width, height);

  hud.speed.textContent = `${Math.round(flight.speed)} kt`;
  hud.altitude.textContent = `${Math.round(flight.altitude).toLocaleString()} ft`;
  hud.heading.textContent = formatHeading(flight.heading);
  hud.throttle.textContent = `${Math.round(flight.throttle * 100)}%`;
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
    event.preventDefault();
  }
  keys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

resetFlight();
requestAnimationFrame(loop);
