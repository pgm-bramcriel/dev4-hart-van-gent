import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import MainScene from "@/components/MainScene";

const cameraSettings = {
  fov: 45,
  far: 400,
  position: [0, 0, 5],
};

function Home() {
  return (
    <div className="w-full h-screen relative bg-[#88E1EB]">
      <div className="pointer-events-none absolute inset-x-0 top-[14%] z-10 text-center text-black">
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
