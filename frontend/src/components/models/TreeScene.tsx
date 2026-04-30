import type { ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Color, MathUtils, Vector3 } from "three";
import { useEffect, useMemo, useRef } from "react";
import type { Mesh, MeshStandardMaterial } from "three";
import type { GLTF } from "three-stdlib";
import { useLeafRustleAnimation } from "@/components/scene/useLeafRustleAnimation";

const TREE_BASE_POSITION: [number, number, number] = [-34.834, 0, 162.088];
const TREE_OFFSET_FROM_BASE: [number, number, number] = [34.834, 0, -162.088];
const ROOTS_FILL_START_COLOR = new Color("#F5B041");
const ROOTS_FILL_END_COLOR = new Color("#FFC300");
const ROOTS_FILL_AXIS_FALLBACK = new Vector3(0, 0, 1);
const ROOTS_FILL_AXIS_Y = new Vector3(0, 1, 0);

type GLTFResult = GLTF & {
  nodes: {
    Cube001: Mesh;
    Trunk001: Mesh;
    Icosphere023: Mesh;
    Icosphere024: Mesh;
    Icosphere025: Mesh;
    Icosphere026: Mesh;
    Icosphere027: Mesh;
    Icosphere028: Mesh;
    Icosphere029: Mesh;
    Icosphere030: Mesh;
    Icosphere031: Mesh;
    Icosphere032: Mesh;
    Icosphere033: Mesh;
    Icosphere034: Mesh;
    Icosphere035: Mesh;
    Icosphere036: Mesh;
    Icosphere037: Mesh;
    Icosphere038: Mesh;
    Icosphere039: Mesh;
    Icosphere040: Mesh;
    Icosphere041: Mesh;
    Icosphere042: Mesh;
    Icosphere043: Mesh;
    Icosphere044: Mesh;
    Icosphere045: Mesh;
    Cube004: Mesh;
    Cube009: Mesh;
    Cube010: Mesh;
    Cube011: Mesh;
  };
  materials: {
    Ground: MeshStandardMaterial;
    "Trunk.009": MeshStandardMaterial;
    "Leaves.014": MeshStandardMaterial;
    "Leaves.015": MeshStandardMaterial;
    "Leaves.016": MeshStandardMaterial;
    "Leaves.017": MeshStandardMaterial;
    "Leaves.018": MeshStandardMaterial;
    "Leaves.019": MeshStandardMaterial;
    "Leaves.020": MeshStandardMaterial;
    "Leaves.021": MeshStandardMaterial;
    "Leaves.022": MeshStandardMaterial;
    "Leaves.023": MeshStandardMaterial;
    "Leaves.024": MeshStandardMaterial;
    "Leaves.025": MeshStandardMaterial;
    "Leaves.026": MeshStandardMaterial;
    "Leaves.027": MeshStandardMaterial;
    Dirt: MeshStandardMaterial;
    Material: MeshStandardMaterial;
    "Trunk.003": MeshStandardMaterial;
    "Trunk.014": MeshStandardMaterial;
  };
};

type TreeProps = ThreeElements["group"] & {
  rustleIntensity?: number;
  growthScale?: number;
  rootsFillProgress?: number;
};

type RootFillShader = {
  uniforms: Record<string, { value: unknown }>;
  vertexShader: string;
  fragmentShader: string;
};

type RootFillMeshProps = Omit<
  ThreeElements["mesh"],
  "geometry" | "material"
> & {
  fillAxis?: Vector3;
  fillProgress: number;
  geometry: Mesh["geometry"];
  material: MeshStandardMaterial;
};

function RootFillMesh({
  fillAxis,
  fillProgress,
  geometry,
  material,
  ...meshProps
}: RootFillMeshProps) {
  const shaderRef = useRef<RootFillShader | null>(null);
  const clampedFillProgress = MathUtils.clamp(fillProgress, 0, 1);
  const fillProgressRef = useRef(clampedFillProgress);
  fillProgressRef.current = clampedFillProgress;
  const fillAxisRange = useMemo(() => {
    geometry.computeBoundingBox();

    const boundingBox = geometry.boundingBox;
    if (!boundingBox) {
      return {
        axis: ROOTS_FILL_AXIS_FALLBACK,
        min: 0,
        max: 1,
      };
    }

    const axisCandidates = [
      {
        axis: new Vector3(0, 0, 1),
        min: boundingBox.min.z,
        max: boundingBox.max.z,
      },
      {
        axis: new Vector3(1, 0, 0),
        min: boundingBox.min.x,
        max: boundingBox.max.x,
      },
      {
        axis: new Vector3(0, 1, 0),
        min: boundingBox.min.y,
        max: boundingBox.max.y,
      },
    ];

    if (fillAxis) {
      const matchingAxisRange = axisCandidates.find(({ axis }) =>
        axis.equals(fillAxis),
      );

      if (matchingAxisRange) {
        return matchingAxisRange;
      }
    }

    return (
      axisCandidates.find(({ min, max }) => max - min > 0.0001) ?? {
        axis: ROOTS_FILL_AXIS_FALLBACK,
        min: 0,
        max: 1,
      }
    );
  }, [fillAxis, geometry]);

  const fillMaterial = useMemo(() => {
    const clonedMaterial = material.clone();

    clonedMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uRootsFillProgress = {
        value: fillProgressRef.current,
      };
      shader.uniforms.uRootsFillStartColor = {
        value: ROOTS_FILL_START_COLOR,
      };
      shader.uniforms.uRootsFillEndColor = {
        value: ROOTS_FILL_END_COLOR,
      };
      shader.uniforms.uRootsFillAxis = {
        value: fillAxisRange.axis,
      };
      shader.uniforms.uRootsFillMin = {
        value: fillAxisRange.min,
      };
      shader.uniforms.uRootsFillMax = {
        value: fillAxisRange.max,
      };

      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        `
        uniform vec3 uRootsFillAxis;
        varying float vRootsFillAxisPosition;

        void main() {
          vRootsFillAxisPosition = dot(position, uRootsFillAxis);
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        uniform float uRootsFillProgress;
        uniform vec3 uRootsFillStartColor;
        uniform vec3 uRootsFillEndColor;
        uniform float uRootsFillMin;
        uniform float uRootsFillMax;
        varying float vRootsFillAxisPosition;

        void main() {
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `
        #include <map_fragment>

        float rootsFillRange = max(uRootsFillMax - uRootsFillMin, 0.0001);
        float rootsFillPosition = clamp(
          (vRootsFillAxisPosition - uRootsFillMin) / rootsFillRange,
          0.0,
          1.0
        );
        float rootsClipMask = step(rootsFillPosition, uRootsFillProgress);
        vec3 rootsFillColor = mix(
          uRootsFillStartColor,
          uRootsFillEndColor,
          rootsFillPosition
        );

        diffuseColor.rgb = mix(diffuseColor.rgb, rootsFillColor, rootsClipMask);
        `,
      );

      shaderRef.current = shader;
    };

    clonedMaterial.customProgramCacheKey = () => "root-fill-material";

    return clonedMaterial;
  }, [fillAxisRange, material]);

  useEffect(() => {
    if (!shaderRef.current) {
      return;
    }

    shaderRef.current.uniforms.uRootsFillProgress.value = clampedFillProgress;
  }, [clampedFillProgress]);

  useEffect(() => {
    return () => {
      fillMaterial.dispose();
    };
  }, [fillMaterial]);

  return <mesh {...meshProps} geometry={geometry} material={fillMaterial} />;
}

export function TreeScene({
  rustleIntensity = 0,
  growthScale = 1,
  rootsFillProgress = 0,
  ...props
}: TreeProps) {
  const { nodes, materials } = useGLTF(
    "/models/full_scene.glb",
  ) as unknown as GLTFResult;
  const leavesGroupRef = useLeafRustleAnimation({
    intensity: rustleIntensity,
    phaseOffset: 2.8,
  });

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube001.geometry}
        material={materials.Ground}
        position={[38.064, 1.754, 160.285]}
        scale={[73.575, 0.219, 66.75]}
      />
      <group position={TREE_BASE_POSITION} scale={growthScale}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Trunk001.geometry}
          material={materials["Trunk.009"]}
          position={[0, 3.054, 0]}
          scale={1.286}
        />
        <group ref={leavesGroupRef}>
          <group position={TREE_OFFSET_FROM_BASE}>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere023.geometry}
              material={materials["Leaves.014"]}
              position={[-36.653, 16.552, 159.053]}
              rotation={[1.355, -1.315, 1.419]}
              scale={[0.274, 0.372, 0.274]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere024.geometry}
              material={materials["Leaves.015"]}
              position={[-38.406, 16.049, 163.503]}
              rotation={[2.654, -0.412, -1.651]}
              scale={[0.786, 0.786, 0.485]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere025.geometry}
              material={materials["Leaves.016"]}
              position={[-26.247, 13.064, 159.021]}
              rotation={[2.654, -0.412, -1.651]}
              scale={[0.786, 0.786, 0.485]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere026.geometry}
              material={materials["Leaves.017"]}
              position={[-32.211, 10.648, 166.536]}
              rotation={[0.095, -0.12, 0.879]}
              scale={[0.614, 0.614, 0.379]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere027.geometry}
              material={materials["Leaves.018"]}
              position={[-29.658, 10.956, 164.301]}
              rotation={[2.649, -0.873, 2.394]}
              scale={[0.539, 0.529, 0.399]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere028.geometry}
              material={materials["Leaves.019"]}
              position={[-29.444, 11.802, 167.07]}
              rotation={[2.849, -0.336, -0.491]}
              scale={[0.792, 0.792, 0.489]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere029.geometry}
              material={materials["Leaves.020"]}
              position={[-32.46, 16.633, 162.91]}
              rotation={[1.319, 1.097, -1.249]}
              scale={[0.614, 0.614, 0.379]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere030.geometry}
              material={materials["Leaves.021"]}
              position={[-31.071, 17.033, 159.733]}
              rotation={[-1.049, -0.545, -0.581]}
              scale={[0.97, 0.97, 0.599]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere031.geometry}
              material={materials["Leaves.022"]}
              position={[-34.161, 15.805, 157.961]}
              rotation={[1.355, -1.315, 1.419]}
              scale={[0.617, 0.839, 0.617]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere032.geometry}
              material={materials["Leaves.023"]}
              position={[-39.599, 16.945, 159.372]}
              rotation={[0, 1.331, 0]}
              scale={[0.659, 0.659, 0.407]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere033.geometry}
              material={materials["Leaves.024"]}
              position={[-38.942, 17.751, 161.518]}
              scale={[0.614, 0.614, 0.379]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere034.geometry}
              material={materials["Leaves.025"]}
              position={[-39.25, 14.542, 158.816]}
              rotation={[-1.964, -0.988, -1.699]}
              scale={[0.754, 0.754, 0.466]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere035.geometry}
              material={materials["Leaves.026"]}
              position={[-37.193, 16.96, 167.087]}
              rotation={[0.187, -0.473, -0.254]}
              scale={[0.906, 0.906, 0.559]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere036.geometry}
              material={materials["Leaves.027"]}
              position={[-33.921, 12.717, 154.988]}
              rotation={[2.874, -1.419, -2.478]}
              scale={[1.13, 1.109, 0.837]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere037.geometry}
              material={materials["Leaves.027"]}
              position={[-38.283, 13.053, 166.621]}
              rotation={[1.046, -0.507, 1.265]}
              scale={[1.078, 1.078, 0.666]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere038.geometry}
              material={materials["Leaves.027"]}
              position={[-41.383, 11.608, 161.623]}
              rotation={[2.678, -0.693, 2.288]}
              scale={[1.314, 1.289, 0.972]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere039.geometry}
              material={materials["Leaves.027"]}
              position={[-37.045, 14.665, 157.109]}
              rotation={[-0.361, -0.549, 0.671]}
              scale={[0.849, 0.833, 0.628]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere040.geometry}
              material={materials["Leaves.027"]}
              position={[-33.452, 17.211, 165.969]}
              rotation={[Math.PI, -1.415, Math.PI]}
              scale={[0.606, 0.606, 0.374]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere041.geometry}
              material={materials["Leaves.027"]}
              position={[-33.015, 14.389, 169.157]}
              rotation={[-2.657, -1.297, -Math.PI]}
              scale={[1.399, 1.372, 1.035]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere042.geometry}
              material={materials["Leaves.027"]}
              position={[-29.446, 14.476, 156.818]}
              rotation={[0, -1.002, 0]}
              scale={[0.992, 1.349, 0.992]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere043.geometry}
              material={materials["Leaves.027"]}
              position={[-26.623, 15.406, 162.437]}
              scale={[0.919, 0.919, 0.567]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere044.geometry}
              material={materials["Leaves.027"]}
              position={[-29.565, 14.714, 164.673]}
              rotation={[2.131, -1.297, -Math.PI]}
              scale={[1.229, 1.206, 0.91]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere045.geometry}
              material={materials["Leaves.027"]}
              position={[-34.834, 19.577, 162.088]}
              scale={1.505}
            />
          </group>
        </group>
      </group>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube004.geometry}
        material={materials.Dirt}
        position={[38.064, 1.316, 160.285]}
        scale={[73.575, 0.219, 66.75]}
      />
      <RootFillMesh
        castShadow
        receiveShadow
        geometry={nodes.Cube009.geometry}
        material={materials.Material}
        fillProgress={rootsFillProgress}
        position={[-35.495, -0.02, 159.887]}
      />
      <RootFillMesh
        castShadow
        receiveShadow
        geometry={nodes.Cube010.geometry}
        material={materials["Trunk.003"]}
        fillProgress={rootsFillProgress}
        position={[-35.495, -0.02, 164.362]}
        rotation={[Math.PI, 0, Math.PI]}
      />
      <RootFillMesh
        castShadow
        receiveShadow
        geometry={nodes.Cube011.geometry}
        material={materials["Trunk.014"]}
        fillAxis={ROOTS_FILL_AXIS_Y}
        fillProgress={rootsFillProgress}
        position={[-35.495, -0.02, 163.513]}
        rotation={[Math.PI, 0, Math.PI]}
      />
    </group>
  );
}

useGLTF.preload("/models/full_scene.glb");
