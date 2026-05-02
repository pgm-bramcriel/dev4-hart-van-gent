export type TreeVariant = "small" | "medium" | "large";
export type TreeRole = "main" | "secondary";
export type TreeStage = 1 | 2 | 3;

type VariantBreakpoint = {
  maxHeightMeters?: number;
  variant: TreeVariant;
};

export const TREE_VARIANT_BREAKPOINTS: Record<
  TreeRole,
  VariantBreakpoint[]
> = {
  main: [
    { maxHeightMeters: 3, variant: "small" },
    { maxHeightMeters: 6, variant: "medium" },
    { variant: "large" },
  ],
  secondary: [
    { maxHeightMeters: 2, variant: "small" },
    { maxHeightMeters: 5, variant: "medium" },
    { variant: "large" },
  ],
};

export const TREE_STAGE_BREAKPOINTS: Record<
  TreeVariant,
  { stage2At: number; stage3At: number }
> = {
  small: { stage2At: 0.5, stage3At: 0.85 },
  medium: { stage2At: 0.5, stage3At: 0.85 },
  large: { stage2At: 0.5, stage3At: 0.85 },
};

function getHeightMeters(heightCm: number | null) {
  return (heightCm ?? 0) / 100;
}

export function getTreeVariant(
  heightCm: number | null,
  role: TreeRole,
): TreeVariant {
  const heightMeters = getHeightMeters(heightCm);
  const breakpoints = TREE_VARIANT_BREAKPOINTS[role];

  return (
    breakpoints.find(
      ({ maxHeightMeters }) =>
        maxHeightMeters === undefined || heightMeters < maxHeightMeters,
    )?.variant ?? "large"
  );
}

export function getTreeStage(
  heightCm: number | null,
  role: TreeRole,
  variant: TreeVariant,
): TreeStage {
  const heightMeters = getHeightMeters(heightCm);
  const breakpoints = TREE_VARIANT_BREAKPOINTS[role];
  const variantIndex = breakpoints.findIndex(
    (breakpoint) => breakpoint.variant === variant,
  );
  const previousBreakpoint = breakpoints[variantIndex - 1];
  const currentBreakpoint = breakpoints[variantIndex];
  const minHeightMeters = previousBreakpoint?.maxHeightMeters ?? 0;
  const maxHeightMeters = currentBreakpoint?.maxHeightMeters;
  const variantProgress =
    maxHeightMeters === undefined
      ? 1
      : Math.min(
          Math.max(
            (heightMeters - minHeightMeters) /
              Math.max(maxHeightMeters - minHeightMeters, 0.0001),
            0,
          ),
          1,
        );
  const stageBreakpoints = TREE_STAGE_BREAKPOINTS[variant];

  if (variantProgress >= stageBreakpoints.stage3At) {
    return 3;
  }

  if (variantProgress >= stageBreakpoints.stage2At) {
    return 2;
  }

  return 1;
}
