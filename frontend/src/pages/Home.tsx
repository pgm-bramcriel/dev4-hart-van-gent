import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import MainScene from "@/components/MainScene";
import heartIcon from "@/assets/heart_icon.svg";
import { supabase } from "@/utils/supabase";
import { parseHeartbeatWsMessage } from "@/utils/heartbeatMessages";
import {
  applyHeightLocally,
  getNextHeightAfterSession,
  persistLocationHeight,
  type LocationRow,
} from "@/utils/locationGrowth";

const cameraSettings = {
  fov: 45,
  far: 400,
  position: [0, 0, 5],
};

const HEART_COUNTDOWN_INTERVAL_MS = 30;
const TREE_GROWTH_DURATION_MS = 1200;
const SESSION_RUSTLE_START_INTENSITY = 0.2;
const SESSION_RUSTLE_MAX_INTENSITY = 1;
const SESSION_RUSTLE_STEP = 0.08;
const SESSION_RUSTLE_INTERVAL_MS = 1000;
const RUSTLE_COOLDOWN_STEP = 0.035;
const RUSTLE_COOLDOWN_INTERVAL_MS = 140;
const ROOTS_FILL_TO_FULL_DURATION_MS = 3000;

function startHeartbeatCountdown(
  startValue: number,
  onTick: (value: number) => void,
  onComplete: () => void,
) {
  let currentValue = Math.max(0, Math.round(startValue));
  onTick(currentValue);

  if (currentValue <= 0) {
    onComplete();
    return () => {};
  }

  const intervalId = window.setInterval(() => {
    currentValue -= 3;
    if (currentValue <= 0) {
      onTick(0);
      window.clearInterval(intervalId);
      onComplete();
      return;
    }
    onTick(currentValue);
  }, HEART_COUNTDOWN_INTERVAL_MS);

  return () => {
    window.clearInterval(intervalId);
  };
}

function startHeightGrowthAnimation(
  fromCm: number,
  toCm: number,
  onUpdate: (value: number) => void,
  onComplete: () => void,
) {
  const startedAt = performance.now();
  let frameId = 0;

  const animateFrame = (now: number) => {
    const progress = Math.min((now - startedAt) / TREE_GROWTH_DURATION_MS, 1);
    const nextValue = fromCm + (toCm - fromCm) * progress;
    onUpdate(nextValue);

    if (progress >= 1) {
      onComplete();
      return;
    }

    frameId = window.requestAnimationFrame(animateFrame);
  };

  frameId = window.requestAnimationFrame(animateFrame);

  return () => {
    window.cancelAnimationFrame(frameId);
  };
}

function formatHeightInMeters(heightInCm: number | null) {
  if (heightInCm === null) {
    return "- meter";
  }

  const meters = heightInCm / 100;
  const compactValue = Number(meters.toFixed(2)).toString();
  return `${compactValue} meter`;
}

function Home() {
  const [heartValue, setHeartValue] = useState(0);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [leafRustleIntensity, setLeafRustleIntensity] = useState(0);
  const [rootsFillProgress, setRootsFillProgress] = useState(0);
  const pendingSessionAverageRef = useRef<number | null>(null);
  const mainLocationRef = useRef<LocationRow | null>(null);
  const heartValueRef = useRef(0);
  const sessionRustleIntervalRef = useRef<number | null>(null);
  const rustleCooldownIntervalRef = useRef<number | null>(null);
  const cancelHeartCountdownRef = useRef<(() => void) | null>(null);
  const cancelTreeGrowthRef = useRef<(() => void) | null>(null);
  const rootsFillAnimationFrameRef = useRef<number | null>(null);
  const rootsFillAnimationRunIdRef = useRef(0);
  const configuredMainLocationName = (
    import.meta.env.VITE_MAIN_LOCATION ??
    import.meta.env.MAIN_LOCATION ??
    ""
  )
    .trim()
    .toLowerCase();
  const mainLocation =
    locations.find(
      (location) =>
        location.name.trim().toLowerCase() === configuredMainLocationName,
    ) ??
    locations[0] ??
    null;
  const secondaryLocation =
    locations.find((location) => location.id !== mainLocation?.id) ?? null;

  useEffect(() => {
    mainLocationRef.current = mainLocation;
  }, [mainLocation]);

  useEffect(() => {
    heartValueRef.current = heartValue;
  }, [heartValue]);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3002";
    const socket = new WebSocket(wsUrl);

    function setHeartValueLive(value: number) {
      heartValueRef.current = value;
      setHeartValue(value);
    }

    function stopRunningAnimations() {
      cancelHeartCountdownRef.current?.();
      cancelHeartCountdownRef.current = null;
      cancelTreeGrowthRef.current?.();
      cancelTreeGrowthRef.current = null;
    }

    function stopSessionRustleRamp() {
      if (sessionRustleIntervalRef.current !== null) {
        window.clearInterval(sessionRustleIntervalRef.current);
        sessionRustleIntervalRef.current = null;
      }
    }

    function stopRustleCooldown() {
      if (rustleCooldownIntervalRef.current !== null) {
        window.clearInterval(rustleCooldownIntervalRef.current);
        rustleCooldownIntervalRef.current = null;
      }
    }

    function stopRootsFillAnimation(reset = true) {
      rootsFillAnimationRunIdRef.current += 1;

      if (rootsFillAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(rootsFillAnimationFrameRef.current);
        rootsFillAnimationFrameRef.current = null;
      }

      if (reset) {
        setRootsFillProgress(0);
      }
    }

    function animateRootsFillToFull(durationMs: number) {
      const runId = rootsFillAnimationRunIdRef.current + 1;
      rootsFillAnimationRunIdRef.current = runId;

      if (rootsFillAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(rootsFillAnimationFrameRef.current);
        rootsFillAnimationFrameRef.current = null;
      }

      return new Promise<boolean>((resolve) => {
        const startedAt = performance.now();

        const animate = (now: number) => {
          if (rootsFillAnimationRunIdRef.current !== runId) {
            resolve(false);
            return;
          }

          const progress = Math.min((now - startedAt) / durationMs, 1);
          setRootsFillProgress(progress);

          if (progress >= 1) {
            rootsFillAnimationFrameRef.current = null;
            resolve(true);
            return;
          }

          rootsFillAnimationFrameRef.current =
            window.requestAnimationFrame(animate);
        };

        rootsFillAnimationFrameRef.current =
          window.requestAnimationFrame(animate);
      });
    }

    function startSessionRustleRamp() {
      stopSessionRustleRamp();
      stopRustleCooldown();
      setLeafRustleIntensity(SESSION_RUSTLE_START_INTENSITY);

      sessionRustleIntervalRef.current = window.setInterval(() => {
        setLeafRustleIntensity((previousIntensity) =>
          Math.min(
            SESSION_RUSTLE_MAX_INTENSITY,
            previousIntensity + SESSION_RUSTLE_STEP,
          ),
        );
      }, SESSION_RUSTLE_INTERVAL_MS);
    }

    function startRustleCooldown() {
      stopRustleCooldown();
      rustleCooldownIntervalRef.current = window.setInterval(() => {
        setLeafRustleIntensity((previousIntensity) => {
          const nextIntensity = Math.max(
            0,
            previousIntensity - RUSTLE_COOLDOWN_STEP,
          );
          if (nextIntensity <= 0) {
            stopRustleCooldown();
          }
          return nextIntensity;
        });
      }, RUSTLE_COOLDOWN_INTERVAL_MS);
    }

    async function handleSessionEnd() {
      const averageBpm = pendingSessionAverageRef.current;
      const currentMainLocation = mainLocationRef.current;
      if (averageBpm === null || !currentMainLocation) {
        return false;
      }

      stopRunningAnimations();

      cancelHeartCountdownRef.current = startHeartbeatCountdown(
        heartValueRef.current,
        (nextHeartValue) => {
          setHeartValueLive(nextHeartValue);
        },
        () => {
          cancelHeartCountdownRef.current = null;
        },
      );

      const startHeightCm = currentMainLocation.height ?? 0;
      const nextHeightCm = getNextHeightAfterSession(
        currentMainLocation.height,
        averageBpm,
      );

      cancelTreeGrowthRef.current = startHeightGrowthAnimation(
        startHeightCm,
        nextHeightCm,
        (animatedHeightCm) => {
          setLocations((previousLocations) =>
            applyHeightLocally(
              previousLocations,
              currentMainLocation.id,
              animatedHeightCm,
            ),
          );
        },
        () => {
          cancelTreeGrowthRef.current = null;
          setLocations((previousLocations) =>
            applyHeightLocally(
              previousLocations,
              currentMainLocation.id,
              nextHeightCm,
            ),
          );
          startRustleCooldown();
        },
      );

      const { error } = await persistLocationHeight(
        supabase,
        currentMainLocation.id,
        nextHeightCm,
      );
      if (error) {
        console.error("Error saving grown tree height:", error);
      }
      setRootsFillProgress(0);

      return true;
    }

    socket.onopen = () => {
      console.log(`Connected to WS server: ${wsUrl}`);
    };

    socket.onmessage = async (event) => {
      const message = parseHeartbeatWsMessage(event.data);
      if (!message) {
        console.warn("Received invalid WS message:", event.data);
        return;
      }

      if (message.type === "heartbeat") {
        setHeartValueLive(message.value);
        return;
      }

      if (message.type === "heartbeat-session-start") {
        stopRunningAnimations();
        startSessionRustleRamp();
        stopRootsFillAnimation(true);
        pendingSessionAverageRef.current = null;
        return;
      }

      if (message.type === "heartbeat-session-average") {
        pendingSessionAverageRef.current = message.value;
        return;
      }

      if (message.type === "heartbeat-session-end") {
        stopSessionRustleRamp();
        stopRustleCooldown();
        setLeafRustleIntensity(SESSION_RUSTLE_MAX_INTENSITY);
        const didFinishRootsFill = await animateRootsFillToFull(
          ROOTS_FILL_TO_FULL_DURATION_MS,
        );
        if (!didFinishRootsFill) {
          return;
        }
        const didStartGrowth = await handleSessionEnd();
        if (!didStartGrowth) {
          stopRootsFillAnimation(true);
          startRustleCooldown();
        }
        pendingSessionAverageRef.current = null;
      }
    };

    socket.onerror = (error) => {
      console.error("WS error:", error);
    };

    socket.onclose = () => {
      console.log("WS connection closed");
    };

    return () => {
      stopRunningAnimations();
      stopSessionRustleRamp();
      stopRustleCooldown();
      stopRootsFillAnimation(true);
      socket.close();
    };
  }, []);

  useEffect(() => {
    async function getLocations() {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, height")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching locations:", error);
        return;
      }

      setLocations(data ?? []);
    }

    getLocations();
  }, []);

  return (
    <div className="w-full h-screen relative bg-[#88E1EB]">
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center">
        <div className="flex items-center gap-2 text-black">
          <img src={heartIcon} alt="Heartbeat icon" className="h-10 w-10" />
          <span className="text-3xl font-bold leading-none">{heartValue}</span>
        </div>
      </div>
      <Canvas camera={cameraSettings as any} shadows>
        <Suspense fallback={null}>
          <MainScene
            mainLocationName={mainLocation?.name ?? "Main location"}
            mainLocationHeightLabel={formatHeightInMeters(
              mainLocation?.height ?? null,
            )}
            secondaryLocationName={
              secondaryLocation?.name ?? "Secondary location"
            }
            secondaryLocationHeightLabel={formatHeightInMeters(
              secondaryLocation?.height ?? null,
            )}
            mainLocationHeightCm={mainLocation?.height ?? null}
            secondaryLocationHeightCm={secondaryLocation?.height ?? null}
            leafRustleIntensity={leafRustleIntensity}
            rootsFillProgress={rootsFillProgress}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Home;
