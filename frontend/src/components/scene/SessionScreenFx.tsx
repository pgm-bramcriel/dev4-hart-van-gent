import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

type SessionScreenFxProps = {
  isActive: boolean;
  strength: number;
};

function getSessionScreenFxVisuals(strength: number) {
  return {
    cornerOverlayOpacity: Math.min(0.82, strength * 0.58),
    vignetteDarkness: 0.05 + strength * 0.14,
    vignetteOffset: 0.9 - strength * 0.05,
  };
}

export function SessionScreenFxOverlay({
  isActive,
  strength,
}: SessionScreenFxProps) {
  if (!isActive) {
    return null;
  }

  const { cornerOverlayOpacity } = getSessionScreenFxVisuals(strength);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        opacity: cornerOverlayOpacity,
        background: `
          radial-gradient(circle at 0% 0%, rgba(219, 143, 143, 1) 0%, rgba(219, 143, 143, 0) 24%),
          radial-gradient(circle at 100% 0%, rgba(219, 143, 143, 1) 0%, rgba(219, 143, 143, 0) 24%),
          radial-gradient(circle at 0% 100%, rgba(219, 143, 143, 0.45) 0%, rgba(219, 143, 143, 0) 17%),
          radial-gradient(circle at 100% 100%, rgba(219, 143, 143, 0.45) 0%, rgba(219, 143, 143, 0) 17%),
          linear-gradient(90deg, rgba(219, 143, 143, 1) 0%, rgba(219, 143, 143, 0) 16%),
          linear-gradient(270deg, rgba(219, 143, 143, 1) 0%, rgba(219, 143, 143, 0) 16%)
        `,
        filter: "blur(6px)",
      }}
    />
  );
}

export function SessionScreenFxPostprocess({
  isActive,
  strength,
}: SessionScreenFxProps) {
  const { vignetteDarkness, vignetteOffset } = getSessionScreenFxVisuals(strength);

  return (
    <EffectComposer>
      <Vignette
        eskil={false}
        offset={isActive ? Math.max(0, vignetteOffset) : 1}
        darkness={isActive ? Math.min(1.5, vignetteDarkness) : 0}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
