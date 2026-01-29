"use client";

import React, { useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

type GLTFResult = {
  nodes: {
    Object_4: THREE.Mesh;
    Object_5: THREE.Mesh;
    Object_7: THREE.Mesh;
    Object_8: THREE.Mesh;
    Object_10: THREE.Mesh;
    Object_11: THREE.Mesh;
    Object_13: THREE.Mesh;
    Object_14: THREE.Mesh;
    Object_16: THREE.Mesh;
    Object_17: THREE.Mesh;
    Object_19: THREE.Mesh;
    Object_20: THREE.Mesh;
    Object_22: THREE.Mesh;
    Object_23: THREE.Mesh;
    Object_25: THREE.Mesh;
    Object_26: THREE.Mesh;
    Object_28: THREE.Mesh;
    Object_30: THREE.Mesh;
    Object_32: THREE.Mesh;
    Object_34: THREE.Mesh;
    Object_36: THREE.Mesh;
    Object_38: THREE.Mesh;
    Object_39: THREE.Mesh;
    Object_41: THREE.Mesh;
    Object_42: THREE.Mesh;
    Object_44: THREE.Mesh;
    Object_45: THREE.Mesh;
    Object_47: THREE.Mesh;
    Object_48: THREE.Mesh;
    Object_50: THREE.Mesh;
    Object_51: THREE.Mesh;
    Object_54: THREE.Mesh;
    Object_57: THREE.Mesh;
    Object_58: THREE.Mesh;
    Object_60: THREE.Mesh;
    Object_62: THREE.Mesh;
    Object_63: THREE.Mesh;
  };
  materials: {
    ".001": THREE.MeshStandardMaterial;
    ".002": THREE.MeshStandardMaterial;
    ".003": THREE.MeshStandardMaterial;
    ".004": THREE.MeshStandardMaterial;
    ".005": THREE.MeshStandardMaterial;
  };
  animations: THREE.AnimationClip[];
};

export function HeroModel(props: JSX.IntrinsicElements["group"]) {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF("/scene.gltf") as GLTFResult;
  const { actions } = useAnimations(animations, group);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group
                name="������������������_0"
                position={[0, 0.559, 0.009]}
                rotation={[-Math.PI, 0, -Math.PI]}
              >
                <mesh
                  name="Object_4"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_4.geometry}
                  material={materials[".002"]}
                />
                <mesh
                  name="Object_5"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_5.geometry}
                  material={materials[".001"]}
                />
              </group>
              <group
                name="������������������002_1"
                position={[0.027, 1.068, 0.951]}
                rotation={[Math.PI, 0, Math.PI]}
              >
                <mesh
                  name="Object_7"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_7.geometry}
                  material={materials[".002"]}
                />
                <mesh
                  name="Object_8"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_8.geometry}
                  material={materials[".001"]}
                />
              </group>
              <group
                name="��������������_2"
                position={[-1.826, 0.613, 0]}
                rotation={[-Math.PI, 0, -1.296]}
              >
                <mesh
                  name="Object_10"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_10.geometry}
                  material={materials[".004"]}
                />
                <mesh
                  name="Object_11"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_11.geometry}
                  material={materials[".001"]}
                />
              </group>
              <group
                name="��������������001_3"
                position={[0, 0.613, -1.762]}
                rotation={[1.846, Math.PI / 2, 0]}
              >
                <mesh
                  name="Object_13"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_13.geometry}
                  material={materials[".004"]}
                />
                <mesh
                  name="Object_14"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_14.geometry}
                  material={materials[".001"]}
                />
              </group>
              <group
                name="��������������002_5"
                position={[-2.945, 0.093, -2.482]}
                rotation={[-Math.PI / 2, 0, 2.662]}
              >
                <mesh
                  name="Object_16"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_16.geometry}
                  material={materials[".004"]}
                />
                <mesh
                  name="Object_17"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_17.geometry}
                  material={materials[".001"]}
                />
              </group>
              <group
                name="������_6"
                position={[-3.089, 0.092, -2.196]}
                rotation={[Math.PI, -Math.PI / 3, Math.PI]}
              >
                <mesh
                  name="Object_19"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_19.geometry}
                  material={materials[".004"]}
                />
                <mesh
                  name="Object_20"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_20.geometry}
                  material={materials[".001"]}
                />
              </group>
              <group
                name="������001_7"
                position={[-3.265, 0.093, -1.889]}
                rotation={[Math.PI, -Math.PI / 3, Math.PI]}
              >
                <mesh
                  name="Object_22"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_22.geometry}
                  material={materials[".005"]}
                />
                <mesh
                  name="Object_23"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_23.geometry}
                  material={materials[".001"]}
                />
              </group>
              <group
                name="������002_8"
                position={[-3.265, 0.102, -1.889]}
                rotation={[Math.PI, -Math.PI / 3, Math.PI]}
              >
                <mesh
                  name="Object_25"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_25.geometry}
                  material={materials[".005"]}
                />
                <mesh
                  name="Object_26"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_26.geometry}
                  material={materials[".001"]}
                />
              </group>
              <group
                name="����������_9"
                position={[-0.888, 1.185, -0.857]}
                scale={0.664}
              >
                <mesh
                  name="Object_28"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_28.geometry}
                  material={materials[".003"]}
                />
              </group>
              <group
                name="����������002_10"
                position={[0.956, 1.185, -0.874]}
                scale={0.664}
              >
                <mesh
                  name="Object_30"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_30.geometry}
                  material={materials[".003"]}
                />
              </group>
              <group
                name="����������003_11"
                position={[0.971, 1.185, 0.045]}
                scale={0.664}
              >
                <mesh
                  name="Object_32"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_32.geometry}
                  material={materials[".003"]}
                />
              </group>
              <group
                name="����������004_12"
                position={[0.022, 1.185, 0.045]}
                scale={0.664}
              >
                <mesh
                  name="Object_34"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_34.geometry}
                  material={materials[".003"]}
                />
              </group>
              <group
                name="����������005_13"
                position={[-0.907, 1.185, 0.045]}
                scale={0.664}
              >
                <mesh
                  name="Object_36"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_36.geometry}
                  material={materials[".003"]}
                />
              </group>
              <group
                name="������������������003_14"
                position={[0.948, 1.068, -0.881]}
                rotation={[-Math.PI, 0, -Math.PI]}
              >
                <mesh
                  name="Object_38"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_38.geometry}
                  material={materials[".002"]}
                />
                <mesh
                  name="Object_39"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_39.geometry}
                  material={materials[".001"]}
                />
              </group>
              <group
                name="������������������004_15"
                position={[0.948, 1.068, 0.041]}
                rotation={[-Math.PI, 0, -Math.PI]}
              >
                <mesh
                  name="Object_41"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_41.geometry}
                  material={materials[".004"]}
                />
                <mesh
                  name="Object_42"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_42.geometry}
                  material={materials[".001"]}
                />
              </group>
              <group
                name="������������������005_16"
                position={[0.026, 1.068, 0.041]}
                rotation={[-Math.PI, 0, -Math.PI]}
              >
                <mesh
                  name="Object_44"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_44.geometry}
                  material={materials[".004"]}
                />
                <mesh
                  name="Object_45"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_45.geometry}
                  material={materials[".001"]}
                />
              </group>
              <group
                name="������������������006_17"
                position={[-0.896, 1.068, 0.041]}
                rotation={[-Math.PI, 0, -Math.PI]}
              >
                <mesh
                  name="Object_47"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_47.geometry}
                  material={materials[".004"]}
                />
                <mesh
                  name="Object_48"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_48.geometry}
                  material={materials[".001"]}
                />
              </group>
              <group
                name="������������������007_18"
                position={[-0.896, 1.068, -0.881]}
                rotation={[-Math.PI, 0, -Math.PI]}
              >
                <mesh
                  name="Object_50"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_50.geometry}
                  material={materials[".002"]}
                />
                <mesh
                  name="Object_51"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_51.geometry}
                  material={materials[".001"]}
                />
              </group>
              <group name="����������������_20" position={[0, 1.26, 0.983]}>
                <group
                  name="������003_19"
                  position={[0, -0.08, 0.122]}
                  scale={[0.435, 0.08, 0.035]}
                >
                  <mesh
                    name="Object_54"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_54.geometry}
                    material={materials[".003"]}
                  />
                </group>
              </group>
              <group name="����������������001_23" position={[0, 1.26, -0.873]}>
                <group
                  name="������������������001_21"
                  position={[0.026, -0.192, -0.009]}
                  rotation={[-Math.PI, 0, -Math.PI]}
                >
                  <mesh
                    name="Object_57"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_57.geometry}
                    material={materials[".004"]}
                  />
                  <mesh
                    name="Object_58"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_58.geometry}
                    material={materials[".001"]}
                  />
                </group>
                <group
                  name="����������001_22"
                  position={[0.026, -0.075, -0.001]}
                  scale={0.664}
                >
                  <mesh
                    name="Object_60"
                    castShadow
                    receiveShadow
                    geometry={nodes.Object_60.geometry}
                    material={materials[".003"]}
                  />
                </group>
              </group>
              <group
                name="����������������������001_24"
                position={[-1.476, 0.432, -2.197]}
                rotation={[0, -1.396, 0]}
              >
                <mesh
                  name="Object_62"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_62.geometry}
                  material={materials[".004"]}
                />
                <mesh
                  name="Object_63"
                  castShadow
                  receiveShadow
                  geometry={nodes.Object_63.geometry}
                  material={materials[".001"]}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/scene.gltf");
