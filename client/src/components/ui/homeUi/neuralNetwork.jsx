import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import TechGlobe from "./TechGlobe";

export default function NeuralNetworkHeroGraphic() {
  return (
    <div className="relative w-full h-[700px]">
      <div className="absolute inset-0 bg-cyan-500/20 blur-[120px]" />
      <Canvas
        camera={{
          position: [0, 0, 12],
          fov: 45,
        }}
      >
        <ambientLight intensity={2.5} />
        <pointLight position={[0, 0, 5]} intensity={2} color="#22d3ee" />
        <Float speed={2} rotationIntensity={0.4} floatIntensity={1}>
          <TechGlobe />
        </Float>
      </Canvas>
    </div>
  );
}