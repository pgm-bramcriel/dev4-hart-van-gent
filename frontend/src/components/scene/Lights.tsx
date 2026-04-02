import { Environment } from "@react-three/drei";

const Lights = () => {
  // apartment: string;
  // city: string;
  // dawn: string;
  // forest: string;
  // lobby: string;
  // night: string;
  // park: string;
  // studio: string;
  // sunset: string;
  // warehouse: string;

  return (
    <>
      <Environment preset="warehouse" background={false} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />
    </>
  );
};

export default Lights;
