import { Html, OrbitControls } from "@react-three/drei";
import Lights from "./scene/Lights";
import { useGrowAnimation } from "./scene/GrowAnimation";
import { ParkScene } from "./models/ParkScene";
import { TreeSmall } from "./models/TreeSmall";
import { TreeMedium } from "./models/TreeMedium";
import { TreeLarge } from "./models/TreeLarge";

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
  small: [0, 0, -149.487],
  medium: [0, 0, -304.702],
  large: [0, 0, 0],
};

const MAIN_TREE_LABEL_HEIGHT: Record<MainTreeVariant, number> = {
  small: 15,
  medium: 20,
  large: 25.2,
};

const SECONDARY_TREE_LABEL_HEIGHT: Record<SecondaryTreeVariant, number> = {
  sapling: 20,
  medium: 25.2,
  large: 30.5,
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

function getMainTreeVariant(heightCm: number | null): MainTreeVariant {
  const heightMeters = (heightCm ?? 0) / 100;

  if (heightMeters < 3) {
    return "small";
  }

  if (heightMeters < 6) {
    return "medium";
  }

  return "large";
}

function getMainTreePosition(
  variant: MainTreeVariant,
  offsetOverride?: [number, number, number],
): [number, number, number] {
  const offset = offsetOverride ?? MAIN_TREE_VARIANT_OFFSETS[variant];

  return [
    MAIN_TREE_BASE_POSITION[0] + offset[0],
    MAIN_TREE_BASE_POSITION[1] + offset[1],
    MAIN_TREE_BASE_POSITION[2] + offset[2],
  ];
}

function getAnchoredTreePosition(
  anchorPosition: [number, number, number],
  variant: MainTreeVariant,
  scale = 1,
): [number, number, number] {
  const modelOffset = getMainTreePosition(variant);

  return [
    anchorPosition[0] + modelOffset[0] * scale,
    anchorPosition[1] + modelOffset[1] * scale,
    anchorPosition[2] + modelOffset[2] * scale,
  ];
}

function getSecondaryMainTreeVariant(
  variant: SecondaryTreeVariant,
): MainTreeVariant {
  if (variant === "sapling") {
    return "small";
  }

  return variant;
}

type MainTreeModelProps = {
  growthScale: number;
  hideRoots?: boolean;
  position: [number, number, number];
  rootsFillProgress: number;
  rustleIntensity: number;
  scale?: number;
  variant: MainTreeVariant;
};

function MainTreeModel({
  growthScale,
  hideRoots = false,
  position,
  rootsFillProgress,
  rustleIntensity,
  scale,
  variant,
}: MainTreeModelProps) {
  const treeProps = {
    position,
    growthScale,
    hideRoots,
    rootsFillProgress,
    rustleIntensity,
    scale,
  };

  if (variant === "small") {
    return <TreeSmall {...treeProps} />;
  }

  if (variant === "medium") {
    return <TreeMedium {...treeProps} />;
  }

  return <TreeLarge {...treeProps} />;
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
  const secondaryMainTreeVariant =
    getSecondaryMainTreeVariant(secondaryTreeVariant);
  const mainTreeVariant = getMainTreeVariant(mainLocationHeightCm);
  const labelPosition: [number, number, number] = [
    0,
    MAIN_TREE_LABEL_HEIGHT[mainTreeVariant] * treeGrowthScale,
    0,
  ];
  const secondaryLabelPosition: [number, number, number] = [
    SECONDARY_TREE_POSITION[0],
    SECONDARY_TREE_LABEL_HEIGHT[secondaryTreeVariant] * SECONDARY_TREE_SCALE,
    SECONDARY_TREE_POSITION[2],
  ];
  const mainTreePosition = getAnchoredTreePosition([0, 0, 0], mainTreeVariant);
  const secondaryTreePosition = getAnchoredTreePosition(
    SECONDARY_TREE_POSITION,
    secondaryMainTreeVariant,
    SECONDARY_TREE_SCALE,
  );

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
      <MainTreeModel
        position={mainTreePosition}
        variant={mainTreeVariant}
        growthScale={treeGrowthScale}
        rootsFillProgress={rootsFillProgress}
        rustleIntensity={leafRustleIntensity}
      />
      <MainTreeModel
        hideRoots
        position={secondaryTreePosition}
        scale={SECONDARY_TREE_SCALE}
        variant={secondaryMainTreeVariant}
        growthScale={1}
        rootsFillProgress={0}
        rustleIntensity={0}
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
