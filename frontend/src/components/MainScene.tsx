import { OrbitControls } from "@react-three/drei";
import { folder, useControls } from "leva";
import Lights from "./scene/Lights";
import { MainTree } from "./models/MainTree";

interface MainSceneProps {}

const MainScene = ({}: MainSceneProps) => {
  const {
    treePositionX,
    treePositionY,
    treePositionZ,
    treeRotationX,
    treeRotationY,
    treeRotationZ,
    treeScale,
    hill1PositionX,
    hill1PositionY,
    hill1PositionZ,
    hill1ScaleX,
    hill1ScaleY,
    hill1ScaleZ,
    hill2PositionX,
    hill2PositionY,
    hill2PositionZ,
    hill2ScaleX,
    hill2ScaleY,
    hill2ScaleZ,
    hill3PositionX,
    hill3PositionY,
    hill3PositionZ,
    hill3ScaleX,
    hill3ScaleY,
    hill3ScaleZ,
  } = useControls("Scene", {
    Tree: folder(
      {
        treePositionX: { value: 0, min: -20, max: 20, step: 0.1 },
        treePositionY: { value: -1.4, min: -20, max: 20, step: 0.1 },
        treePositionZ: { value: 0, min: -20, max: 20, step: 0.1 },
        treeRotationX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
        treeRotationY: { value: -0.8, min: -Math.PI, max: Math.PI, step: 0.01 },
        treeRotationZ: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
        treeScale: { value: 0.18, min: 0.1, max: 5, step: 0.01 },
      },
      { collapsed: false },
    ),
    "Hill 1": folder({
      hill1PositionX: { value: 3.3, min: -20, max: 20, step: 0.1 },
      hill1PositionY: { value: -3.0, min: -20, max: 20, step: 0.1 },
      hill1PositionZ: { value: -1.4, min: -20, max: 20, step: 0.1 },
      hill1ScaleX: { value: 5.6, min: 0.1, max: 20, step: 0.1 },
      hill1ScaleY: { value: 1.8, min: 0.1, max: 20, step: 0.1 },
      hill1ScaleZ: { value: 2.2, min: 0.1, max: 20, step: 0.1 },
    }),
    "Hill 2": folder({
      hill2PositionX: { value: 0, min: -20, max: 20, step: 0.1 },
      hill2PositionY: { value: -3.3, min: -20, max: 20, step: 0.1 },
      hill2PositionZ: { value: 0.4, min: -20, max: 20, step: 0.1 },
      hill2ScaleX: { value: 4.2, min: 0.1, max: 20, step: 0.1 },
      hill2ScaleY: { value: 2.1, min: 0.1, max: 20, step: 0.1 },
      hill2ScaleZ: { value: 2.4, min: 0.1, max: 20, step: 0.1 },
    }),
    "Hill 3": folder({
      hill3PositionX: { value: -3.8, min: -20, max: 20, step: 0.1 },
      hill3PositionY: { value: -3.1, min: -20, max: 20, step: 0.1 },
      hill3PositionZ: { value: -0.8, min: -20, max: 20, step: 0.1 },
      hill3ScaleX: { value: 4.8, min: 0.1, max: 20, step: 0.1 },
      hill3ScaleY: { value: 1.7, min: 0.1, max: 20, step: 0.1 },
      hill3ScaleZ: { value: 2.1, min: 0.1, max: 20, step: 0.1 },
    }),
  });

  return (
    <>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
      <Lights />

      <mesh
        position={[hill1PositionX, hill1PositionY, hill1PositionZ]}
        scale={[hill1ScaleX, hill1ScaleY, hill1ScaleZ]}
      >
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#46AA4A" />
      </mesh>
      <mesh
        position={[hill2PositionX, hill2PositionY, hill2PositionZ]}
        scale={[hill2ScaleX, hill2ScaleY, hill2ScaleZ]}
      >
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#55B959" />
      </mesh>
      <mesh
        position={[hill3PositionX, hill3PositionY, hill3PositionZ]}
        scale={[hill3ScaleX, hill3ScaleY, hill3ScaleZ]}
      >
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#46AA4A" />
      </mesh>

      <MainTree
        position={[treePositionX, treePositionY, treePositionZ]}
        rotation={[treeRotationX, treeRotationY, treeRotationZ]}
        scale={treeScale}
      />
    </>
  );
};

export default MainScene;
