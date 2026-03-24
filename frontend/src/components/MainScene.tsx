import { OrbitControls } from "@react-three/drei";
import Lights from "./scene/Lights";

interface MainSceneProps {}

const MainScene = ({}: MainSceneProps) => {
  return (
    <>
      <OrbitControls makeDefault />
      <Lights />

      <mesh>
        <boxGeometry />
        <meshBasicMaterial color="red" />
      </mesh>
    </>
  );
};

export default MainScene;
