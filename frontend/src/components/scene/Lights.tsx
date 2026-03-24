import { Environment } from "@react-three/drei";

const Lights = () => {
  return (
    <>
      <Environment preset="sunset" background={false} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />
    </>
  );
};

export default Lights;
