import { Html, OrbitControls } from "@react-three/drei";
import Lights from "./scene/Lights";
import { useGrowAnimation } from "./scene/GrowAnimation";
import { ParkScene } from "./models/ParkScene";
import { TreeSapling } from "./models/TreeSapling";
import { MainTree } from "./models/MainTree";
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

const MAIN_TREE_LABEL_POSITION: [number, number, number] = [0, 25.2, 0];
const TREE_SCENE_POSITION: [number, number, number] = [34.834, 0, -162.088];
const SECONDARY_TREE_POSITION: [number, number, number] = [36, 1.7, -18];
const SECONDARY_TREE_SCALE = 0.45;
const SCENE_FOG_COLOR = "#88e1eb";

type SecondaryTreeVariant = "sapling" | "medium" | "large";

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

function SecondaryTree({ heightCm }: { heightCm: number | null }) {
  const treeVariant = getSecondaryTreeVariant(heightCm);
  const treeProps = {
    position: SECONDARY_TREE_POSITION,
    scale: SECONDARY_TREE_SCALE,
  } as const;

  if (treeVariant === "sapling") {
    return <TreeSapling {...treeProps} />;
  }

  if (treeVariant === "medium") {
    return <MainTree {...treeProps} />;
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

  return (
    <>
      <OrbitControls
        target={[2.980861940630329, 14.538627488481774, -0.48901107383943215]}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
      />
      <Lights />
      <fog attach="fog" args={[SCENE_FOG_COLOR, 95, 350]} />
      <ParkScene position={TREE_SCENE_POSITION} />
      {/* <SecondaryTree heightCm={secondaryLocationHeightCm} /> */}
      {/* <Html
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
      </Html> */}
    </>
  );
};

export default MainScene;
