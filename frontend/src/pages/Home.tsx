import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import MainScene from "@/components/MainScene";
import heartIcon from "@/assets/heart_icon.svg";

const cameraSettings = {
  fov: 45,
  far: 400,
  position: [0, 0, 5],
};

function Home() {
  const [heartValue, setHeartValue] = useState(0);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3002";
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log(`Connected to WS server: ${wsUrl}`);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "heartbeat" || payload.type === "random-test-value") {
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

  return (
    <div className="w-full h-screen relative bg-[#88E1EB]">
      <div className="pointer-events-none absolute inset-x-0 top-6 z-20 flex justify-center">
        <div className="flex items-center gap-2 text-black">
          <img src={heartIcon} alt="Heartbeat icon" className="h-10 w-10" />
          <span className="text-3xl font-bold leading-none">{heartValue}</span>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[16%] z-10 text-center text-black">
        <p className="text-3xl font-bold leading-tight">Citadelpark</p>
        <p className="text-lg font-regular leading-tight">16.85 meter</p>
      </div>
      <Canvas camera={cameraSettings as any} shadows>
        <Suspense fallback={null}>
          <MainScene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Home;
