import { useLayoutEffect, useMemo, useRef } from "react";
import type { ThreeElements } from "@react-three/fiber";
import {
  Color,
  Euler,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import { useLeafRustleAnimation } from "@/components/scene/useLeafRustleAnimation";

const TREE_MIN_HEIGHT = 8;
const TREE_MAX_HEIGHT = 13;
const BASE_TRUNK_COLOR = new Color("#84563C");
const LEAF_COLOR = new Color("#4FAF53");
const METER_BRANCH_GROWTH_CAP = 30;
const MIN_BRANCH_RADIUS_AFTER_SCALE = 0.08;
const MIN_LEAF_AXIS_SCALE_AFTER_SCALE = 0.2;
const SAPLING_STAGE_MAX_M = 3;
const JUVENILE_STAGE_MAX_M = 12;

type LSystemTreeProps = ThreeElements["group"] & {
  heightCm: number | null;
  rustleIntensity?: number;
  seed?: number;
};

type BranchSegment = {
  start: Vector3;
  end: Vector3;
  radius: number;
};

type LeafCluster = {
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
};

type TreeGeometryData = {
  branches: BranchSegment[];
  leaves: LeafCluster[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

function hashNoise(seed: number) {
  const value = Math.sin(seed * 127.1) * 43758.5453;
  return value - Math.floor(value);
}

function addCanopyLeafClump(
  leaves: LeafCluster[],
  center: Vector3,
  baseScale: number,
  count: number,
  seed: number,
) {
  for (let i = 0; i < count; i += 1) {
    const n1 = hashNoise(seed * 1.3 + i * 0.91);
    const n2 = hashNoise(seed * 2.1 + i * 1.47);
    const n3 = hashNoise(seed * 2.7 + i * 2.03);
    const azimuth = n1 * Math.PI * 2;
    const radius = baseScale * (0.25 + n2 * 0.8);
    const lift = (n3 - 0.35) * baseScale * 0.75;

    const position = center
      .clone()
      .add(new Vector3(Math.cos(azimuth) * radius, lift, Math.sin(azimuth) * radius));

    const leafScale = baseScale * (0.65 + n2 * 0.45);
    const rotation = new Quaternion().setFromEuler(
      new Euler(
        (hashNoise(seed * 3.1 + i) - 0.5) * 0.45,
        azimuth,
        (hashNoise(seed * 4.2 + i * 0.6) - 0.5) * 0.45,
      ),
    );

    leaves.push({
      position,
      rotation,
      scale: new Vector3(leafScale * 1.25, leafScale, leafScale * 1.25),
    });
  }
}

function createSaplingGeometry(meters: number, seed: number): TreeGeometryData {
  const saplingRatio = clamp((meters - 1) / (SAPLING_STAGE_MAX_M - 1), 0, 1);
  const branches: BranchSegment[] = [];
  const leaves: LeafCluster[] = [];

  const trunkTopY = lerp(3.5, 6.4, saplingRatio);
  const trunkRadius = lerp(0.24, 0.34, saplingRatio);
  branches.push({
    start: new Vector3(0, 0, 0),
    end: new Vector3(0, trunkTopY, 0),
    radius: trunkRadius,
  });

  if (meters > 1.6) {
    const sideDir = new Vector3(
      hashNoise(seed * 8.1) - 0.5,
      0.8,
      hashNoise(seed * 9.4) - 0.5,
    ).normalize();
    const sideStart = new Vector3(0, trunkTopY * 0.68, 0);
    const sideEnd = sideStart.clone().addScaledVector(sideDir, lerp(1.1, 1.9, saplingRatio));
    branches.push({
      start: sideStart,
      end: sideEnd,
      radius: trunkRadius * 0.58,
    });
  }

  const leafCount = meters < 1.7 ? 1 : meters < 2.3 ? 2 : 3;
  for (let i = 0; i < leafCount; i += 1) {
    const angle = (i / Math.max(1, leafCount)) * Math.PI * 2 + hashNoise(seed * 17 + i) * 0.5;
    const offsetRadius = 0.25 + i * 0.12;
    const leafPosition = new Vector3(
      Math.cos(angle) * offsetRadius,
      trunkTopY + 0.2 + i * 0.15,
      Math.sin(angle) * offsetRadius,
    );
    const leafSize = lerp(0.85, 1.25, saplingRatio);
    leaves.push({
      position: leafPosition,
      rotation: new Quaternion().setFromEuler(
        new Euler(0.1 + i * 0.1, angle, (hashNoise(seed * 23 + i) - 0.5) * 0.6),
      ),
      scale: new Vector3(leafSize * 1.7, leafSize * 0.7, leafSize * 1.2),
    });
  }

  return { branches, leaves };
}

function createJuvenileOakGeometry(meters: number, seed: number): TreeGeometryData {
  const ratio = clamp((meters - SAPLING_STAGE_MAX_M) / (JUVENILE_STAGE_MAX_M - SAPLING_STAGE_MAX_M), 0, 1);
  const branches: BranchSegment[] = [];
  const leaves: LeafCluster[] = [];
  const trunkHeight = lerp(6.5, 9.2, ratio);
  const trunkRadius = lerp(0.42, 0.72, ratio);

  let current = new Vector3(0, 0, 0);
  const trunkSegments = 3;
  for (let i = 0; i < trunkSegments; i += 1) {
    const t = (i + 1) / trunkSegments;
    const bend = new Vector3(
      (hashNoise(seed * 31 + i) - 0.5) * 0.25,
      trunkHeight / trunkSegments,
      (hashNoise(seed * 37 + i) - 0.5) * 0.25,
    );
    const next = current.clone().add(bend);
    branches.push({
      start: current.clone(),
      end: next.clone(),
      radius: trunkRadius * (1 - t * 0.2),
    });
    current = next;
  }

  const limbCount = 3 + Math.floor(ratio * 4);
  for (let i = 0; i < limbCount; i += 1) {
    const t = (i + 1) / (limbCount + 1);
    const start = new Vector3(0, trunkHeight * (0.45 + t * 0.45), 0);
    const azimuth = hashNoise(seed * 43 + i * 2.2) * Math.PI * 2;
    const dir = new Vector3(Math.cos(azimuth), 0.45 + hashNoise(seed * 47 + i) * 0.4, Math.sin(azimuth)).normalize();
    const limbLength = lerp(1.8, 3.2, 1 - t) * (0.9 + ratio * 0.35);
    const end = start.clone().addScaledVector(dir, limbLength);
    branches.push({
      start: start.clone(),
      end: end.clone(),
      radius: trunkRadius * (0.45 - t * 0.14),
    });

    const twigEnd = end.clone().addScaledVector(dir.clone().add(new Vector3(0, 0.25, 0)).normalize(), limbLength * 0.45);
    branches.push({
      start: end.clone(),
      end: twigEnd.clone(),
      radius: trunkRadius * 0.16,
    });

    addCanopyLeafClump(leaves, twigEnd, lerp(0.75, 1.1, ratio), 8 + Math.floor(ratio * 4), seed * 79 + i * 11);
  }

  // Prevent a bare-looking trunk tip during juvenile stage.
  addCanopyLeafClump(
    leaves,
    new Vector3(0, trunkHeight + 0.35, 0),
    lerp(0.95, 1.35, ratio),
    10 + Math.floor(ratio * 4),
    seed * 83,
  );

  return { branches, leaves };
}

function createMatureOakGeometry(meters: number, seed: number): TreeGeometryData {
  const preCapMeters = Math.min(meters, METER_BRANCH_GROWTH_CAP);
  const ratio = clamp((preCapMeters - JUVENILE_STAGE_MAX_M) / (METER_BRANCH_GROWTH_CAP - JUVENILE_STAGE_MAX_M), 0, 1);
  const postCapGrowth = Math.max(0, meters - METER_BRANCH_GROWTH_CAP);
  const branches: BranchSegment[] = [];
  const leaves: LeafCluster[] = [];

  const trunkHeight = lerp(9.2, 12.2, ratio);
  const trunkRadius = lerp(1.1, 1.75, ratio);
  const trunkTop = new Vector3(0, trunkHeight, 0);
  branches.push({
    start: new Vector3(0, 0, 0),
    end: trunkTop.clone(),
    radius: trunkRadius,
  });

  const guaranteedMeterBranches = Math.max(0, Math.floor(preCapMeters) - 1);
  const primaryLimbCount = 5 + Math.floor(ratio * 3);
  const baseLimbCount = Math.max(primaryLimbCount, guaranteedMeterBranches);

  for (let i = 0; i < baseLimbCount; i += 1) {
    const t = (i + 1) / (baseLimbCount + 1);
    const start = new Vector3(0, trunkHeight * (0.38 + t * 0.55), 0);
    const azimuth = hashNoise(seed * 101 + i * 3.7) * Math.PI * 2;
    const upward = lerp(0.3, 0.65, hashNoise(seed * 109 + i));
    const dir = new Vector3(Math.cos(azimuth), upward, Math.sin(azimuth)).normalize();
    const length = lerp(4.2, 2.1, t) * (1 + ratio * 0.25);
    const end = start.clone().addScaledVector(dir, length);
    const radius = lerp(0.72, 0.28, t) * (0.9 + ratio * 0.28);
    branches.push({ start: start.clone(), end: end.clone(), radius });

    const childCount = 1 + Math.floor((1 - t) * 2 + ratio);
    for (let j = 0; j < childCount; j += 1) {
      const cAzimuth = azimuth + (hashNoise(seed * 131 + i * 7 + j) - 0.5) * 1.15;
      const cDir = new Vector3(
        Math.cos(cAzimuth),
        0.42 + hashNoise(seed * 137 + i + j) * 0.38,
        Math.sin(cAzimuth),
      ).normalize();
      const cStart = end.clone().lerp(start, 0.18 * j);
      const cLength = length * (0.38 + hashNoise(seed * 149 + i + j) * 0.33);
      const cEnd = cStart.clone().addScaledVector(cDir, cLength);
      branches.push({
        start: cStart.clone(),
        end: cEnd.clone(),
        radius: radius * 0.45,
      });
      addCanopyLeafClump(
        leaves,
        cEnd,
        lerp(1.05, 1.45, ratio),
        11 + Math.floor(ratio * 5),
        seed * 181 + i * 13 + j * 3,
      );
    }
  }

  const extraCrownClusters = Math.floor(postCapGrowth * 1.5);
  for (let i = 0; i < extraCrownClusters; i += 1) {
    const azimuth = hashNoise(seed * 191 + i) * Math.PI * 2;
    const radius = 2.2 + hashNoise(seed * 197 + i) * 2.8;
    const center = trunkTop.clone().add(
      new Vector3(
        Math.cos(azimuth) * radius,
        -1.6 + hashNoise(seed * 211 + i) * 2.4,
        Math.sin(azimuth) * radius,
      ),
    );
    addCanopyLeafClump(
      leaves,
      center,
      1.25 + hashNoise(seed * 223 + i) * 0.45,
      10,
      seed * 227 + i * 7,
    );
  }

  return { branches, leaves };
}

function segmentToMatrix(segment: BranchSegment) {
  const direction = segment.end.clone().sub(segment.start);
  const length = direction.length();
  const center = segment.start.clone().add(segment.end).multiplyScalar(0.5);
  const rotation = new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    direction.normalize(),
  );
  const scale = new Vector3(segment.radius, length, segment.radius);

  return new Matrix4().compose(center, rotation, scale);
}

function leafToMatrix(leaf: LeafCluster) {
  return new Matrix4().compose(leaf.position, leaf.rotation, leaf.scale);
}

function buildTreeGeometry(heightCm: number, seed: number): TreeGeometryData {
  const meters = clamp(heightCm / 100, 1, 60);
  const heightGrowthRatio = clamp((meters - 1) / (METER_BRANCH_GROWTH_CAP - 1), 0, 1);
  const stageGeometry =
    meters <= SAPLING_STAGE_MAX_M
      ? createSaplingGeometry(meters, seed)
      : meters <= JUVENILE_STAGE_MAX_M
        ? createJuvenileOakGeometry(meters, seed)
        : createMatureOakGeometry(meters, seed);

  const branches = stageGeometry.branches;
  const leaves = stageGeometry.leaves;

  const topBranchY = branches.reduce(
    (highest, branch) => Math.max(highest, branch.end.y),
    0,
  );
  const topLeafY = leaves.reduce(
    (highest, leaf) => Math.max(highest, leaf.position.y + leaf.scale.y),
    0,
  );
  const topY = Math.max(1, topBranchY, topLeafY);
  const targetHeight = lerp(TREE_MIN_HEIGHT, TREE_MAX_HEIGHT, heightGrowthRatio);
  const heightScale = targetHeight / topY;

  return {
    branches: branches.map((branch) => ({
      start: branch.start.clone().multiplyScalar(heightScale),
      end: branch.end.clone().multiplyScalar(heightScale),
      radius: Math.max(
        MIN_BRANCH_RADIUS_AFTER_SCALE,
        branch.radius * heightScale,
      ),
    })),
    leaves: leaves.map((leaf) => ({
      position: leaf.position.clone().multiplyScalar(heightScale),
      rotation: leaf.rotation.clone(),
      scale: leaf.scale.clone().multiplyScalar(heightScale).max(
        new Vector3(
          MIN_LEAF_AXIS_SCALE_AFTER_SCALE,
          MIN_LEAF_AXIS_SCALE_AFTER_SCALE,
          MIN_LEAF_AXIS_SCALE_AFTER_SCALE,
        ),
      ),
    })),
  };
}

export function LSystemTree({
  heightCm,
  rustleIntensity = 0,
  seed = 1,
  ...props
}: LSystemTreeProps) {
  const branchMeshRef = useRef<InstancedMesh>(null);
  const leavesMeshRef = useRef<InstancedMesh>(null);
  const leavesGroupRef = useLeafRustleAnimation({
    intensity: rustleIntensity,
    phaseOffset: seed * 0.23,
  });

  const generationBucketCm = Math.max(
    100,
    Math.round((heightCm ?? 0) / 10) * 10,
  );

  const treeData = useMemo(
    () => buildTreeGeometry(generationBucketCm, seed),
    [generationBucketCm, seed],
  );
  const branchMatrices = useMemo(
    () => treeData.branches.map(segmentToMatrix),
    [treeData.branches],
  );
  const leafMatrices = useMemo(
    () => treeData.leaves.map(leafToMatrix),
    [treeData.leaves],
  );

  useLayoutEffect(() => {
    const branchMesh = branchMeshRef.current;
    if (!branchMesh) {
      return;
    }

    branchMatrices.forEach((matrix, index) => {
      branchMesh.setMatrixAt(index, matrix);
    });
    branchMesh.instanceMatrix.needsUpdate = true;
  }, [branchMatrices]);

  useLayoutEffect(() => {
    const leavesMesh = leavesMeshRef.current;
    if (!leavesMesh) {
      return;
    }

    leafMatrices.forEach((matrix, index) => {
      leavesMesh.setMatrixAt(index, matrix);
    });
    leavesMesh.instanceMatrix.needsUpdate = true;
  }, [leafMatrices]);

  return (
    <group {...props}>
      <instancedMesh
        ref={branchMeshRef}
        args={[undefined, undefined, Math.max(1, branchMatrices.length)]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1, 1, 1, 6, 1]} />
        <meshStandardMaterial color={BASE_TRUNK_COLOR} flatShading roughness={0.9} />
      </instancedMesh>
      <group ref={leavesGroupRef}>
        <instancedMesh
          ref={leavesMeshRef}
          args={[undefined, undefined, Math.max(1, leafMatrices.length)]}
          castShadow
          receiveShadow
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={LEAF_COLOR} flatShading roughness={0.75} />
        </instancedMesh>
      </group>
    </group>
  );
}

