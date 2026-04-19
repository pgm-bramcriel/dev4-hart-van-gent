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
  const pendingSessionAverageRef = useRef<number | null>(null);
  const mainLocationRef = useRef<LocationRow | null>(null);
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
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3002";
    const socket = new WebSocket(wsUrl);

    async function handleSessionEnd() {
      const averageBpm = pendingSessionAverageRef.current;
      const currentMainLocation = mainLocationRef.current;
      if (averageBpm === null || !currentMainLocation) {
        return;
      }

      const nextHeightCm = getNextHeightAfterSession(
        currentMainLocation.height,
        averageBpm,
      );

      setLocations((previousLocations) =>
        applyHeightLocally(
          previousLocations,
          currentMainLocation.id,
          nextHeightCm,
        ),
      );

      const { error } = await persistLocationHeight(
        supabase,
        currentMainLocation.id,
        nextHeightCm,
      );
      if (error) {
        console.error("Error saving grown tree height:", error);
      }
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
        setHeartValue(message.value);
        return;
      }

      if (message.type === "heartbeat-session-start") {
        pendingSessionAverageRef.current = null;
        return;
      }

      if (message.type === "heartbeat-session-average") {
        pendingSessionAverageRef.current = message.value;
        return;
      }

      if (message.type === "heartbeat-session-end") {
        await handleSessionEnd();
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
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Home;
