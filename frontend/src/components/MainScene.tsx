import { Html, OrbitControls } from "@react-three/drei";
import Lights from "./scene/Lights";
import { useGrowAnimation } from "./scene/GrowAnimation";
import { TreeScene } from "./models/TreeScene";

type MainSceneProps = {
  mainLocationName: string;
  mainLocationHeightLabel: string;
  secondaryLocationName: string;
  secondaryLocationHeightLabel: string;
  mainLocationHeightCm: number | null;
  secondaryLocationHeightCm: number | null;
  leafRustleIntensity: number;
  rootsFillProgress: number;
};

const MAIN_TREE_LABEL_POSITION: [number, number, number] = [
  -34.764, 25.2, -5.384,
];
const TREE_SCENE_TREE_BASE_POSITION: [number, number, number] = [
  -34.764, 0, -5.384,
];

function getScaledTreePosition(
  position: [number, number, number],
  scale: number,
): [number, number, number] {
  return [
    TREE_SCENE_TREE_BASE_POSITION[0] +
      (position[0] - TREE_SCENE_TREE_BASE_POSITION[0]) * scale,
    TREE_SCENE_TREE_BASE_POSITION[1] +
      (position[1] - TREE_SCENE_TREE_BASE_POSITION[1]) * scale,
    TREE_SCENE_TREE_BASE_POSITION[2] +
      (position[2] - TREE_SCENE_TREE_BASE_POSITION[2]) * scale,
  ];
}

const MainScene = ({
  mainLocationName,
  mainLocationHeightLabel,
  mainLocationHeightCm,
  leafRustleIntensity,
}: MainSceneProps) => {
  const { treeGrowthScale } = useGrowAnimation({
    mainLocationHeightCm,
  });
  const labelPosition = getScaledTreePosition(
    MAIN_TREE_LABEL_POSITION,
    treeGrowthScale,
  );

  return (
    <>
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      <Lights />
      <TreeScene
        rustleIntensity={leafRustleIntensity}
        growthScale={treeGrowthScale}
      />
      <Html
        position={labelPosition}
        transform
        sprite
        center
        distanceFactor={16}
      >
        <div className="pointer-events-none text-center text-black">
          <p className="text-3xl font-bold leading-tight">{mainLocationName}</p>
          <p className="text-lg font-regular leading-tight">
            {mainLocationHeightLabel}
          </p>
        </div>
      </Html>
    </>
  );
};

export default MainScene;
