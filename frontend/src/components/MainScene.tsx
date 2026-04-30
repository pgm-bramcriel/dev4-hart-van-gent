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

const MAIN_TREE_LABEL_POSITION: [number, number, number] = [0, 25.2, 0];
const TREE_SCENE_POSITION: [number, number, number] = [34.834, 0, -162.088];

const MainScene = ({
  mainLocationName,
  mainLocationHeightLabel,
  mainLocationHeightCm,
  leafRustleIntensity,
  rootsFillProgress,
}: MainSceneProps) => {
  const { treeGrowthScale } = useGrowAnimation({
    mainLocationHeightCm,
  });
  const labelPosition: [number, number, number] = [
    MAIN_TREE_LABEL_POSITION[0],
    MAIN_TREE_LABEL_POSITION[1] * treeGrowthScale,
    MAIN_TREE_LABEL_POSITION[2],
  ];

  return (
    <>
      <OrbitControls
        target={[2.8189748722161325, 15.782626546927926, -0.37117111828601307]}
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
      <Lights />
      <TreeScene
        position={TREE_SCENE_POSITION}
        growthScale={treeGrowthScale}
        rustleIntensity={leafRustleIntensity}
        rootsFillProgress={rootsFillProgress}
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
