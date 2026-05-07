import "dotenv/config";
import express from "express";
import cors from "cors";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

const SERIAL_PATH = process.env.SERIAL_PORT || "COM3";
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
let currentSessionBpmValues = [];
const BPM_LINE_REGEX = /^Current BPM:\s*([0-9]+(?:\.[0-9]+)?)$/i;
const AVERAGE_BPM_LINE_REGEX = /^Average BPM:\s*([0-9]+(?:\.[0-9]+)?)$/i;
const SESSION_START_REGEX = /^---\s*(?:new\s+)?session\s+started\s*---$/i;
const SESSION_END_REGEX = /^---\s*session\s+ended\s*---$/i;

parser.on("data", (line) => {
  handleIncomingPulseLine(line);
});

const PORT = process.env.PORT || 3001;

app.post("/mock-session", (_req, res) => {
  runMockHeartbeatSessionOnce();
  res.status(202).json({ ok: true, message: "Mock heartbeat session started" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

function handleIncomingPulseLine(line) {
  const msg = line.trim();
  if (!msg) return;

  console.log(`Serial Received: ${msg}`);

  if (SESSION_START_REGEX.test(msg)) {
    startSession();
    return;
  }

  if (SESSION_END_REGEX.test(msg)) {
    endSession();
    return;
  }

  const averageBpm = parseBpmValue(msg, AVERAGE_BPM_LINE_REGEX);
  if (averageBpm !== null) {
    sendSessionAverage(averageBpm);
    return;
  }

  if (!sessionActive) return;

  const bpm = parseBpmValue(msg, BPM_LINE_REGEX);
  if (bpm === null) return;

  currentSessionBpmValues.push(bpm);

  sendWsMessage({
    type: "heartbeat",
    value: bpm,
    ts: Date.now(),
  });
}

function sendWsMessage(payload) {
  const data = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(data);
  });
}

function startSession() {
  sessionActive = true;
  currentSessionBpmValues = [];
  sendWsMessage({ type: "heartbeat-session-start", ts: Date.now() });
}

function endSession() {
  const averageBpm = calculateAverageBpm(currentSessionBpmValues);
  if (averageBpm !== null) {
    sendSessionAverage(averageBpm);
  }

  sessionActive = false;
  currentSessionBpmValues = [];
  sendWsMessage({ type: "heartbeat-session-end", ts: Date.now() });
}

function sendSessionAverage(averageBpm) {
  const roundedAverageBpm = Math.round(averageBpm);
  sendWsMessage({
    type: "heartbeat-session-average",
    value: roundedAverageBpm,
    message: `Average BPM: ${roundedAverageBpm}`,
    ts: Date.now(),
  });
}

function calculateAverageBpm(values) {
  if (!values.length) return null;
  const sum = values.reduce((accumulator, value) => accumulator + value, 0);
  const average = sum / values.length;
  if (!Number.isFinite(average)) return null;
  return average;
}

function parseBpmValue(message, regex) {
  const match = message.match(regex);
  if (!match) return null;

  const value = Math.round(Number.parseFloat(match[1]));
  if (!Number.isFinite(value)) return null;
  return value;
}

function runMockHeartbeatSessionOnce() {
  const mockBpmValues = [68, 71, 73, 75, 74, 72, 70, 69, 71, 73];

  handleIncomingPulseLine("--- Session Started ---");

  mockBpmValues.forEach((bpm, index) => {
    setTimeout(
      () => {
        handleIncomingPulseLine(`Current BPM: ${bpm}`);
      },
      (index + 1) * 1000,
    );
  });

  setTimeout(
    () => {
      handleIncomingPulseLine("--- Session Ended ---");
    },
    (mockBpmValues.length + 1) * 1000,
  );
}
