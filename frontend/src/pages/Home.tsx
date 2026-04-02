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
      <Canvas camera={cameraSettings as any} shadows>
        <Suspense fallback={null}>
          <MainScene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Home;
