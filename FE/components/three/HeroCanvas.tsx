"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { HeroModel } from "./HeroModel";

export function HeroCanvas({
  embedded = false,
  className,
}: {
  embedded?: boolean;
  className?: string;
}) {
  return (
    <div className={embedded ? className : `absolute inset-0 -z-10 ${className ?? ""}`.trim()}>
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <HeroModel />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
