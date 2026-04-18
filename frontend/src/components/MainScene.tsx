import { Html, OrbitControls } from "@react-three/drei";
import { folder, useControls } from "leva";
import Lights from "./scene/Lights";
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
};

type TreeVariant = "sapling" | "main" | "large";

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

function getTreeComponent(variant: TreeVariant) {
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

function getLabelOffsetY(variant: TreeVariant, treeScale: number) {
  const modelHeightByVariant = {
    sapling: 2,
    main: 14,
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
}: MainSceneProps) => {
  const backTreePosition: [number, number, number] = [-2, -2.08, -2.8];
  const backTreeRotation: [number, number, number] = [0, -0.9, 0];
  const backTreeScale = 0.12;
  const mainTreeVariant = getTreeVariant(mainLocationHeightCm);
  const secondaryTreeVariant = getTreeVariant(secondaryLocationHeightCm);
  const MainLocationTree = getTreeComponent(mainTreeVariant);
  const SecondaryLocationTree = getTreeComponent(secondaryTreeVariant);

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
  const mainTreeScaleMultiplier = getTreeScaleMultiplier(mainTreeVariant);
  const secondaryTreeScaleMultiplier =
    getTreeScaleMultiplier(secondaryTreeVariant);
  const effectiveMainTreeScale = treeScale * mainTreeScaleMultiplier;
  const effectiveSecondaryTreeScale =
    backTreeScale * secondaryTreeScaleMultiplier;
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

      <MainLocationTree
        position={[treePositionX, treePositionY, treePositionZ]}
        rotation={[treeRotationX, treeRotationY, treeRotationZ]}
        scale={effectiveMainTreeScale}
      />
      <Html
        position={[
          treePositionX,
          treePositionY + mainLabelOffsetY,
          treePositionZ,
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
        position={backTreePosition}
        rotation={backTreeRotation}
        scale={effectiveSecondaryTreeScale}
      />
      <Html
        position={[
          backTreePosition[0],
          backTreePosition[1] + secondaryLabelOffsetY,
          backTreePosition[2],
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
