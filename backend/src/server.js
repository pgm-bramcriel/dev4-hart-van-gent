import "dotenv/config";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

const wss = new WebSocketServer({ port: 3002 });
wss.on("connection", () => {
  console.log("Frontend connected via WebSocket");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const TEST_RANDOM_MIN = 60;
const TEST_RANDOM_MAX = 90;
const TEST_RANDOM_INTERVAL_MS = 1000;

setInterval(() => {
  const randomValue =
    Math.floor(Math.random() * (TEST_RANDOM_MAX - TEST_RANDOM_MIN + 1)) +
    TEST_RANDOM_MIN;

  sendWsMessage({
    type: "random-test-value",
    value: randomValue,
    ts: Date.now(),
  });
}, TEST_RANDOM_INTERVAL_MS);

function sendWsMessage(payload) {
  const data = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(data);
  });
}
