import { Html, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import {
  FaPython, FaReact, FaNodeJs, FaDocker,
  FaGitAlt, FaFigma, FaJsSquare,
} from "react-icons/fa";
import { SiMysql, SiArduino } from "react-icons/si";

const techs = [
  { icon: FaPython }, { icon: FaReact }, { icon: FaNodeJs },
  { icon: FaDocker }, { icon: FaGitAlt }, { icon: FaFigma },
  { icon: FaJsSquare }, { icon: SiMysql }, { icon: SiArduino },
];

function pointOnSphere(radius, theta, phi) {
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

export default function TechGlobe() {
  const groupRef = useRef();

  useFrame((state, delta) => {
    groupRef.current.rotation.y += delta * 0.2;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
  });

  const nodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 40; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr.push(pointOnSphere(4, theta, phi));
    }
    return arr;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Connections */}
      {nodes.map((p1, i) =>
        nodes.slice(i + 1).map((p2, j) => {
          const distance = Math.sqrt(
            (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2
          );
          if (distance > 2.5) return null;
          return (
            <Line
              key={`${i}-${j}`}
              points={[p1, p2]}
              color="#22d3ee"
              transparent
              opacity={0.55}
              lineWidth={1.2}
            />
          );
        })
      )}

      {/* Nodes */}
      {nodes.map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color="#67e8f9" />
        </mesh>
      ))}

      {/* Tech Logos */}
      {techs.map((tech, i) => {
        const Icon = tech.icon;
        const theta = (i / techs.length) * Math.PI * 2;
        const pos = pointOnSphere(4.2, theta, Math.PI / 2);
        return (
          <Html key={i} position={pos} center>
            <div className="w-20 h-20 rounded-full bg-slate-900/90 border border-cyan-400/50 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.6)]">
              <Icon size={30} className="text-cyan-300" />
            </div>
          </Html>
        );
      })}

      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} />
      </mesh>

      <Html center>
        <div className="text-center">
          <h3 className="text-cyan-400 font-bold text-2xl">DEVAD</h3>
          <p className="text-white text-sm">TECH ACADEMY</p>
        </div>
      </Html>
    </group>
  );
}