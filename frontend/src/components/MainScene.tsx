import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";
import Lights from "./scene/Lights";
import { MainTree } from "./models/MainTree";

interface MainSceneProps {}

const MainScene = ({}: MainSceneProps) => {
  const {
    positionX,
    positionY,
    positionZ,
    rotationX,
    rotationY,
    rotationZ,
    scale,
  } = useControls("Main Tree", {
    positionX: { value: 0, min: -20, max: 20, step: 0.1 },
    positionY: { value: -1.6, min: -20, max: 20, step: 0.1 },
    positionZ: { value: 0, min: -20, max: 20, step: 0.1 },
    rotationX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotationY: { value: -0.8, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotationZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    scale: { value: 0.21, min: 0.1, max: 5, step: 0.01 },
  });

  return (
    <>
      <OrbitControls enableZoom={true} enablePan={false} enableRotate={false} />
      <Lights />

      <MainTree
        position={[positionX, positionY, positionZ]}
        rotation={[rotationX, rotationY, rotationZ]}
        scale={scale}
      />
    </>
  );
};

export default MainScene;
