export type HeartbeatWsMessage =
  | { type: "heartbeat"; value: number }
  | { type: "heartbeat-session-start" }
  | { type: "heartbeat-session-average"; value: number; message: string }
  | { type: "heartbeat-session-end" };

type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseHeartbeatWsMessage(rawData: string): HeartbeatWsMessage | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawData);
  } catch {
    return null;
  }

  if (!isJsonObject(parsed) || typeof parsed.type !== "string") {
    return null;
  }

  // Be liberal in what we accept: older/newer backend versions may emit
  // slightly different event names for session state changes.
  const normalizedType = parsed.type.trim().toLowerCase();

  if (normalizedType === "heartbeat") {
    const value = readNumber(parsed.value);
    if (value === null) return null;
    return { type: "heartbeat", value };
  }

  if (
    normalizedType === "heartbeat-session-start" ||
    normalizedType === "session-start" ||
    normalizedType === "session started" ||
    normalizedType === "session-started"
  ) {
    return { type: "heartbeat-session-start" };
  }

  if (
    normalizedType === "heartbeat-session-average" ||
    normalizedType === "session-average" ||
    normalizedType === "session average" ||
    normalizedType === "session-avg" ||
    normalizedType === "session avg"
  ) {
    const value = readNumber(parsed.value);
    if (value === null) return null;
    return {
      type: "heartbeat-session-average",
      value,
      message:
        typeof parsed.message === "string"
          ? parsed.message
          : `Average BPM: ${Math.round(value)}`,
    };
  }

  if (
    normalizedType === "heartbeat-session-end" ||
    normalizedType === "session-end" ||
    normalizedType === "session ended" ||
    normalizedType === "session-ended"
  ) {
    return { type: "heartbeat-session-end" };
  }

  return null;
}
