import { Html, OrbitControls } from "@react-three/drei";
import Lights from "./scene/Lights";
import { useGrowAnimation } from "./scene/GrowAnimation";
import { ParkScene } from "./models/ParkScene";
import { TreeLargeV2 } from "./models/TreeLarge_v2";

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
const MAIN_TREE_BASE_POSITION: [number, number, number] = TREE_SCENE_POSITION;
const SECONDARY_TREE_POSITION: [number, number, number] = [36, 1.7, -18];
const SECONDARY_TREE_SCALE = 0.45;
const SCENE_FOG_COLOR = "#88e1eb";

type MainTreeVariant = "small" | "medium" | "large";
type SecondaryTreeVariant = "sapling" | "medium" | "large";

const MAIN_TREE_VARIANT_OFFSETS: Record<
  MainTreeVariant,
  [number, number, number]
> = {
  small: [0, 0, 0],
  medium: [0, 0, 0],
  large: [0, 0, 0],
};

const SECONDARY_TREE_LABEL_HEIGHT: Record<SecondaryTreeVariant, number> = {
  sapling: 2.3,
  medium: 9.2,
  large: 27.7,
};

function getSecondaryTreeVariant(
  heightCm: number | null,
): SecondaryTreeVariant {
  const heightMeters = (heightCm ?? 0) / 100;

  if (heightMeters < 2) {
    return "sapling";
  }

  if (heightMeters < 5) {
    return "medium";
  }

  return "large";
}

function getMainTreePosition(
  variant: MainTreeVariant,
): [number, number, number] {
  const offset = MAIN_TREE_VARIANT_OFFSETS[variant];

  return [
    MAIN_TREE_BASE_POSITION[0] + offset[0],
    MAIN_TREE_BASE_POSITION[1] + offset[1],
    MAIN_TREE_BASE_POSITION[2] + offset[2],
  ];
}

const MainScene = ({
  mainLocationName,
  mainLocationHeightLabel,
  secondaryLocationName,
  secondaryLocationHeightLabel,
  mainLocationHeightCm,
  secondaryLocationHeightCm,
  leafRustleIntensity,
  rootsFillProgress,
}: MainSceneProps) => {
  const { treeGrowthScale } = useGrowAnimation({
    mainLocationHeightCm,
  });
  const secondaryTreeVariant = getSecondaryTreeVariant(
    secondaryLocationHeightCm,
  );
  const labelPosition: [number, number, number] = [
    MAIN_TREE_LABEL_POSITION[0],
    MAIN_TREE_LABEL_POSITION[1] * treeGrowthScale,
    MAIN_TREE_LABEL_POSITION[2],
  ];
  const secondaryLabelPosition: [number, number, number] = [
    SECONDARY_TREE_POSITION[0],
    SECONDARY_TREE_LABEL_HEIGHT[secondaryTreeVariant] * SECONDARY_TREE_SCALE,
    SECONDARY_TREE_POSITION[2],
  ];
  const mainTreePosition = getMainTreePosition("large");

  return (
    <>
      <OrbitControls
        target={[2.980861940630329, 14.538627488481774, -0.48901107383943215]}
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
      <Lights />
      <fog attach="fog" args={[SCENE_FOG_COLOR, 95, 350]} />
      <ParkScene position={TREE_SCENE_POSITION} />
      <TreeLargeV2
        position={mainTreePosition}
        growthScale={treeGrowthScale}
        rootsFillProgress={rootsFillProgress}
        rustleIntensity={leafRustleIntensity}
      />
      <Html
        position={secondaryLabelPosition}
        transform
        sprite
        center
        distanceFactor={16}
      >
        <div className="pointer-events-none text-center text-black">
          <p className="text-2xl font-bold leading-tight">
            {secondaryLocationName}
          </p>
          <p className="text-base font-regular leading-tight">
            {secondaryLocationHeightLabel}
          </p>
        </div>
      </Html>
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
