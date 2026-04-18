import "dotenv/config";
import express from "express";
import cors from "cors";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

const SERIAL_PATH = process.env.SERIAL_PORT || "COM10";
const BAUD = parseInt(process.env.BAUD_RATE || "9600", 10);

const port = new SerialPort({ path: SERIAL_PATH, baudRate: BAUD });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

const wss = new WebSocketServer({ port: 3002 });
wss.on("connection", () => {
  console.log("Frontend connected via WebSocket");
});

port.on("open", () => {
  console.log(`Connected on ${SERIAL_PATH} @ ${BAUD}`);
});

port.on("error", (err) => {
  console.error("Serial Error:", err.message);
});

let sessionActive = false;
const BPM_LINE_REGEX = /^Current BPM:\s*([0-9]+(?:\.[0-9]+)?)$/i;
const SESSION_START_REGEX = /^---\s*(?:new\s+)?session\s+started\s*---$/i;
const SESSION_END_REGEX = /^---\s*session\s+ended\s*---$/i;

parser.on("data", (line) => {
  const msg = line.trim();
  if (!msg) return;

  console.log(`Serial Received: ${msg}`);

  if (SESSION_START_REGEX.test(msg)) {
    sessionActive = true;
    sendWsMessage({ type: "heartbeat-session-start", ts: Date.now() });
    return;
  }

  if (SESSION_END_REGEX.test(msg)) {
    sessionActive = false;
    sendWsMessage({ type: "heartbeat-session-end", ts: Date.now() });
    return;
  }

  if (!sessionActive) return;

  const bpmMatch = msg.match(BPM_LINE_REGEX);
  if (!bpmMatch) return;

  const bpm = Math.round(Number.parseFloat(bpmMatch[1]));
  if (!Number.isFinite(bpm)) return;

  sendWsMessage({
    type: "heartbeat",
    value: bpm,
    ts: Date.now(),
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

function sendWsMessage(payload) {
  const data = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(data);
  });
}
