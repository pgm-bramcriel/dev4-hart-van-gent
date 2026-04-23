import { Html, OrbitControls } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import type { ComponentType } from "react";
import Lights from "./scene/Lights";
import { useGrowAnimation } from "./scene/GrowAnimation";
import { MainTree } from "./models/MainTree";
import { TreeLarge } from "./models/TreeLarge";
import { TreeSapling } from "./models/TreeSapling";

type MainSceneProps = {
  mainLocationName: string;
  mainLocationHeightLabel: string;
  secondaryLocationName: string;
  secondaryLocationHeightLabel: string;
  mainLocationHeightCm: number | null;
  secondaryLocationHeightCm: number | null;
  leafRustleIntensity: number;
};

type TreeVariant = "sapling" | "main" | "large";
type TreeModelProps = ThreeElements["group"] & {
  rustleIntensity?: number;
  leafGrowthProgress?: number;
};
const GROWTH_STEP_CM = 70;
const FINAL_GROWTH_HEIGHT_CM = 2000;
const MAIN_TREE_POSITION: [number, number, number] = [0, -1.4, 0];
const MAIN_TREE_ROTATION: [number, number, number] = [0, -0.8, 0];
const MAIN_TREE_BASE_SCALE = 0.18;
const SECONDARY_TREE_POSITION: [number, number, number] = [-2, -2.08, -2.8];
const SECONDARY_TREE_ROTATION: [number, number, number] = [0, -0.9, 0];
const SECONDARY_TREE_BASE_SCALE = 0.12;
const HILL_1_POSITION: [number, number, number] = [3.3, -3.0, -1.4];
const HILL_1_SCALE: [number, number, number] = [5.6, 1.8, 2.2];
const HILL_2_POSITION: [number, number, number] = [0, -3.3, 0.4];
const HILL_2_SCALE: [number, number, number] = [4.2, 2.1, 2.4];
const HILL_3_POSITION: [number, number, number] = [-3.8, -3.1, -0.8];
const HILL_3_SCALE: [number, number, number] = [4.8, 1.7, 2.1];

function getTreeVariant(heightInCm: number | null): TreeVariant {
  if (heightInCm === null) {
    return "main";
  }

  const heightInMeters = heightInCm / 100;

  if (heightInMeters < 3) {
    return "sapling";
  }

  if (heightInMeters < 8) {
    return "main";
  }

  return "large";
}

function getTreeComponent(variant: TreeVariant): ComponentType<TreeModelProps> {
  if (variant === "sapling") {
    return TreeSapling;
  }

  if (variant === "large") {
    return TreeLarge;
  }

  return MainTree;
}

function getTreeScaleMultiplier(variant: TreeVariant) {
  if (variant === "sapling") {
    return 2;
  }

  if (variant === "large") {
    return 0.65;
  }

  return 1;
}

function getVariantRangeCm(variant: TreeVariant) {
  if (variant === "sapling") {
    return { start: 0, end: 300 };
  }

  if (variant === "main") {
    return { start: 300, end: 800 };
  }

  return { start: 800, end: FINAL_GROWTH_HEIGHT_CM };
}

function getTreeLeafGrowthProgress(
  heightInCm: number | null,
  variant: TreeVariant,
) {
  if (heightInCm === null) {
    return 1;
  }

  const { start, end } = getVariantRangeCm(variant);
  const clampedHeight = Math.max(0, Math.min(heightInCm, FINAL_GROWTH_HEIGHT_CM));

  if (clampedHeight <= start) {
    return 0;
  }

  if (clampedHeight >= end) {
    return 1;
  }

  const steppedHeight =
    start + Math.floor((clampedHeight - start) / GROWTH_STEP_CM) * GROWTH_STEP_CM;

  return (steppedHeight - start) / (end - start);
}

function getLabelOffsetY(variant: TreeVariant, treeScale: number) {
  const modelHeightByVariant = {
    sapling: 2,
    main: 13,
    large: 20,
  } as const;

  return modelHeightByVariant[variant] * treeScale + 0.35;
}

const MainScene = ({
  mainLocationName,
  mainLocationHeightLabel,
  secondaryLocationName,
  secondaryLocationHeightLabel,
  mainLocationHeightCm,
  secondaryLocationHeightCm,
  leafRustleIntensity,
}: MainSceneProps) => {
  const mainTreeVariant = getTreeVariant(mainLocationHeightCm);
  const secondaryTreeVariant = getTreeVariant(secondaryLocationHeightCm);
  const MainLocationTree = getTreeComponent(mainTreeVariant);
  const SecondaryLocationTree = getTreeComponent(secondaryTreeVariant);
  const { cameraCompensationScale } = useGrowAnimation({
    mainLocationHeightCm,
    mainTreePositionZ: MAIN_TREE_POSITION[2],
  });

  const mainTreeScaleMultiplier = getTreeScaleMultiplier(mainTreeVariant);
  const secondaryTreeScaleMultiplier =
    getTreeScaleMultiplier(secondaryTreeVariant);
  const mainLeafGrowthProgress = getTreeLeafGrowthProgress(
    mainLocationHeightCm,
    mainTreeVariant,
  );
  const secondaryLeafGrowthProgress = getTreeLeafGrowthProgress(
    secondaryLocationHeightCm,
    secondaryTreeVariant,
  );
  const effectiveMainTreeScale =
    MAIN_TREE_BASE_SCALE * mainTreeScaleMultiplier * cameraCompensationScale;
  const effectiveSecondaryTreeScale =
    SECONDARY_TREE_BASE_SCALE * secondaryTreeScaleMultiplier;
  const mainLabelOffsetY = getLabelOffsetY(
    mainTreeVariant,
    effectiveMainTreeScale,
  );
  const secondaryLabelOffsetY = getLabelOffsetY(
    secondaryTreeVariant,
    effectiveSecondaryTreeScale,
  );

  return (
    <>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
      <Lights />

      <mesh position={HILL_1_POSITION} scale={HILL_1_SCALE}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#46AA4A" />
      </mesh>
      <mesh position={HILL_2_POSITION} scale={HILL_2_SCALE}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#55B959" />
      </mesh>
      <mesh position={HILL_3_POSITION} scale={HILL_3_SCALE}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#46AA4A" />
      </mesh>

      <MainLocationTree
        position={MAIN_TREE_POSITION}
        rotation={MAIN_TREE_ROTATION}
        scale={effectiveMainTreeScale}
        rustleIntensity={leafRustleIntensity}
        leafGrowthProgress={mainLeafGrowthProgress}
      />
      <Html
        position={[
          MAIN_TREE_POSITION[0],
          MAIN_TREE_POSITION[1] + mainLabelOffsetY,
          MAIN_TREE_POSITION[2],
        ]}
        transform
        center
        distanceFactor={1.8}
      >
        <div className="pointer-events-none text-center text-black">
          <p className="text-3xl font-bold leading-tight">{mainLocationName}</p>
          <p className="text-lg font-regular leading-tight">
            {mainLocationHeightLabel}
          </p>
        </div>
      </Html>
      <SecondaryLocationTree
        position={SECONDARY_TREE_POSITION}
        rotation={SECONDARY_TREE_ROTATION}
        scale={effectiveSecondaryTreeScale}
        rustleIntensity={0}
        leafGrowthProgress={secondaryLeafGrowthProgress}
      />
      <Html
        position={[
          SECONDARY_TREE_POSITION[0],
          SECONDARY_TREE_POSITION[1] + secondaryLabelOffsetY,
          SECONDARY_TREE_POSITION[2],
        ]}
        transform
        center
        distanceFactor={1.8}
      >
        <div className="pointer-events-none text-center text-black">
          <p className="text-3xl font-bold leading-tight">
            {secondaryLocationName}
          </p>
          <p className="text-lg font-regular leading-tight">
            {secondaryLocationHeightLabel}
          </p>
        </div>
      </Html>
    </>
  );
};

export default MainScene;
