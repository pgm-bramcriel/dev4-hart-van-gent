import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Color, MathUtils, Vector3 } from "three";
import type { Mesh, MeshStandardMaterial } from "three";

const ROOTS_FILL_START_COLOR = new Color("#F5B041");
const ROOTS_FILL_END_COLOR = new Color("#FFC300");
const ROOTS_FILL_AXIS_Y = new Vector3(0, 1, 0);

type RootFillShader = {
  uniforms: Record<string, { value: unknown }>;
  vertexShader: string;
  fragmentShader: string;
};

type TreeRootFillMeshProps = Omit<
  ThreeElements["mesh"],
  "geometry" | "material"
> & {
  fillProgress: number;
  geometry: Mesh["geometry"];
  material: MeshStandardMaterial;
};

export type TreeRootMeshConfig = {
  node: string;
  material: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
};

export function TreeRootFillMesh({
  fillProgress,
  geometry,
  material,
  ...meshProps
}: TreeRootFillMeshProps) {
  const shaderRef = useRef<RootFillShader | null>(null);
  const clampedFillProgress = MathUtils.clamp(fillProgress, 0, 1);
  const fillProgressRef = useRef(clampedFillProgress);
  fillProgressRef.current = clampedFillProgress;
  const [fillAxisRange] = useState(() => {
    geometry.computeBoundingBox();

    const boundingBox = geometry.boundingBox;
    if (!boundingBox) {
      return {
        min: 0,
        max: 1,
      };
    }

    return {
      min: boundingBox.min.y,
      max: boundingBox.max.y,
    };
  });

  const [fillMaterial] = useState(() => {
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
        value: ROOTS_FILL_AXIS_Y,
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

    clonedMaterial.customProgramCacheKey = () => "tree-root-fill";

    return clonedMaterial;
  });

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
