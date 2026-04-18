import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import MainScene from "@/components/MainScene";
import heartIcon from "@/assets/heart_icon.svg";
import { supabase } from "@/utils/supabase";

const cameraSettings = {
  fov: 45,
  far: 400,
  position: [0, 0, 5],
};

type LocationRow = {
  id: number;
  name: string;
  height: number | null;
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
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3002";
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log(`Connected to WS server: ${wsUrl}`);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (
          payload.type === "heartbeat" ||
          payload.type === "random-test-value"
        ) {
          const nextValue = Number(payload.value);
          if (Number.isFinite(nextValue)) {
            setHeartValue(nextValue);
          }
        }
      } catch {
        console.warn("Received non-JSON WS message:", event.data);
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

      console.log("Locations:", data);
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
            mainLocationHeightLabel={formatHeightInMeters(mainLocation?.height ?? null)}
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
