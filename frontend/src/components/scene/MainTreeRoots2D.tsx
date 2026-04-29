import { useTexture } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Color, MathUtils } from "three";

const ROOTS_TEXTURE_PATH = "/images/roots_svg.svg";
const ROOTS_FILL_START_COLOR = new Color("#F5B041");
const ROOTS_FILL_END_COLOR = new Color("#FFC300");

type MainTreeRoots2DProps = {
  fillProgress: number;
};

export function MainTreeRoots2D({ fillProgress }: MainTreeRoots2DProps) {
  const rootsTexture = useTexture(ROOTS_TEXTURE_PATH);
  const shaderRef = useRef<{
    uniforms: Record<string, { value: unknown }>;
  } | null>(null);
  const clampedFillProgress = MathUtils.clamp(fillProgress, 0, 1);

  useEffect(() => {
    if (!shaderRef.current) {
      return;
    }

    shaderRef.current.uniforms.uRootsFillProgress.value = clampedFillProgress;
  }, [clampedFillProgress]);

  return (
    <mesh
      position={[0.028, -2.25, -1]}
      scale={1.08}
      renderOrder={8}
      frustumCulled={false}
    >
      <planeGeometry args={[2.6, 1.46]} />
      <meshBasicMaterial
        map={rootsTexture}
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
