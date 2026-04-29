import { useTexture } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Color, MathUtils } from "three";

const ROOTS_TEXTURE_PATH = "/images/roots_v3.svg";
const ROOTS_SAPLING_TEXTURE_PATH = "/images/roots_small_svg.svg";
const ROOTS_FILL_START_COLOR = new Color("#F5B041");
const ROOTS_FILL_END_COLOR = new Color("#FFC300");
const ROOTS_VARIANT_CONFIG = {
  sapling: {
    basePosition: [-0.265, -2.05, -1] as [number, number, number],
    baseScale: 0.8,
    growthAnchorX: 0.22,
    growthAnchorY: 0.5,
  },
  main: {
    basePosition: [-0.127, -2.12, -1] as [number, number, number],
    baseScale: 0.88,
    growthAnchorX: 0.22,
    growthAnchorY: 0.5,
  },
  large: {
    basePosition: [-0.172, -2.29, -1] as [number, number, number],
    baseScale: 1.12,
    growthAnchorX: 0.22,
    growthAnchorY: 0.5,
  },
} as const;

type TreeVariant = keyof typeof ROOTS_VARIANT_CONFIG;

type MainTreeRoots2DProps = {
  fillProgress: number;
  growthScale: number;
  treeVariant: TreeVariant;
};

export function MainTreeRoots2D({
  fillProgress,
  growthScale,
  treeVariant,
}: MainTreeRoots2DProps) {
  const [rootsTexture, saplingRootsTexture] = useTexture([
    ROOTS_TEXTURE_PATH,
    ROOTS_SAPLING_TEXTURE_PATH,
  ]);
  const shaderRef = useRef<{
    uniforms: Record<string, { value: unknown }>;
  } | null>(null);
  const rootsConfig = ROOTS_VARIANT_CONFIG[treeVariant];
  const activeRootsTexture =
    treeVariant === "sapling" ? saplingRootsTexture : rootsTexture;
  const clampedFillProgress = MathUtils.clamp(fillProgress, 0, 1);
  const safeGrowthScale = Math.max(growthScale, 0);
  const growthDelta = safeGrowthScale - 1;
  const rootsPosition: [number, number, number] = [
    rootsConfig.basePosition[0] - growthDelta * rootsConfig.growthAnchorX,
    rootsConfig.basePosition[1] - growthDelta * rootsConfig.growthAnchorY,
    rootsConfig.basePosition[2],
  ];

  useEffect(() => {
    if (!shaderRef.current) {
      return;
    }

    shaderRef.current.uniforms.uRootsFillProgress.value = clampedFillProgress;
  }, [clampedFillProgress]);

  return (
    <mesh
      position={rootsPosition}
      scale={rootsConfig.baseScale * safeGrowthScale}
      renderOrder={8}
      frustumCulled={false}
    >
      <planeGeometry args={[2.6, 1.46]} />
      <meshBasicMaterial
        map={activeRootsTexture}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
        onBeforeCompile={(shader) => {
          shader.uniforms.uRootsFillProgress = {
            value: clampedFillProgress,
          };
          shader.uniforms.uRootsFillStartColor = {
            value: ROOTS_FILL_START_COLOR,
          };
          shader.uniforms.uRootsFillEndColor = {
            value: ROOTS_FILL_END_COLOR,
          };

          shader.fragmentShader = shader.fragmentShader.replace(
            "void main() {",
            `
            uniform float uRootsFillProgress;
            uniform vec3 uRootsFillStartColor;
            uniform vec3 uRootsFillEndColor;

            void main() {
            `,
          );

          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <map_fragment>",
            `
            #include <map_fragment>

            // Bottom-to-top clip mask that reveals the warm fill color.
            float rootsClipMask = step(vMapUv.y, uRootsFillProgress);
            vec3 rootsFillColor = mix(
              uRootsFillStartColor,
              uRootsFillEndColor,
              clamp(vMapUv.y, 0.0, 1.0)
            );

            diffuseColor.rgb = mix(
              diffuseColor.rgb,
              rootsFillColor,
              rootsClipMask * diffuseColor.a
            );
            `,
          );

          shaderRef.current = shader;
        }}
      />
    </mesh>
  );
}
