import React, { useMemo, useRef, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';
import * as THREE from 'three';
import { Trash2 } from 'lucide-react';

// Helper for Color Lerp
function getTimeBasedLightConfig(time) {
  const t = Math.max(6, Math.min(22, time));

  if (t < 9) {
    const factor = (t - 6) / 3;
    return {
      sunColor: new THREE.Color().lerpColors(new THREE.Color('#fdba74'), new THREE.Color('#fef08a'), factor),
      sunIntensity: 0.7 + factor * 0.5,
      ambientColor: new THREE.Color('#ffedd5'),
      ambientIntensity: 0.35 + factor * 0.25,
      sunPos: [-15 + factor * 10, 8 + factor * 8, -12]
    };
  } else if (t < 16) {
    const factor = (t - 9) / 7;
    return {
      sunColor: new THREE.Color('#ffffff'),
      sunIntensity: 1.4,
      ambientColor: new THREE.Color('#f1f5f9'),
      ambientIntensity: 0.65,
      sunPos: [-5 + factor * 10, 18, -10]
    };
  } else if (t < 19) {
    const factor = (t - 16) / 3;
    return {
      sunColor: new THREE.Color().lerpColors(new THREE.Color('#f97316'), new THREE.Color('#ea580c'), factor),
      sunIntensity: 1.2 - factor * 0.7,
      ambientColor: new THREE.Color('#fed7aa'),
      ambientIntensity: 0.45 - factor * 0.2,
      sunPos: [5 + factor * 10, 14 - factor * 8, -12]
    };
  } else {
    const factor = (t - 19) / 3;
    return {
      sunColor: new THREE.Color('#1e1b4b'),
      sunIntensity: 0.05,
      ambientColor: new THREE.Color('#0f172a'),
      ambientIntensity: 0.15,
      sunPos: [15, 4, -15]
    };
  }
}

/** Single Draggable & Selectable Artificial LED Ceiling Fixture */
const CustomLightFixture = ({ light, isSelected, onSelect, onDelete, onDragStart, onDragEnd }) => {
  const { id, x, z, color = '#fef08a', intensity = 1.2 } = light;
  const { roomDimensions, updateCustomLightPos } = useAppStore();
  const { width: W, length: L, height: H } = roomDimensions;
  const { gl, raycaster } = useThree();

  const meshRef = useRef();
  const isDragging = useRef(false);
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -(H - 0.15)), [H]);
  const dragOffset = useRef(new THREE.Vector3());
  const posRef = useRef(new THREE.Vector3(x, H - 0.15, z));

  React.useEffect(() => {
    if (!isDragging.current) {
      posRef.current.set(x, H - 0.15, z);
      if (meshRef.current) {
        meshRef.current.position.set(x, H - 0.15, z);
      }
    }
  }, [x, z, H]);

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    isDragging.current = true;
    if (onDragStart) onDragStart();
    if (onSelect) onSelect(id);
    gl.domElement.style.cursor = 'grabbing';

    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane, intersection);
    dragOffset.current.copy(intersection).sub(posRef.current);
  }, [id, onSelect, onDragStart, gl, raycaster, dragPlane]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane, intersection);
    const newPos = intersection.clone().sub(dragOffset.current);
    newPos.y = H - 0.15;

    // Clamp within ceiling bounds
    const margin = 0.4;
    newPos.x = Math.max(-W / 2 + margin, Math.min(W / 2 - margin, newPos.x));
    newPos.z = Math.max(-L / 2 + margin, Math.min(L / 2 - margin, newPos.z));

    posRef.current.copy(newPos);
    if (meshRef.current) {
      meshRef.current.position.copy(newPos);
    }
  }, [raycaster, dragPlane, W, L, H]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    e.target.releasePointerCapture(e.pointerId);
    isDragging.current = false;
    if (onDragEnd) onDragEnd();
    gl.domElement.style.cursor = 'auto';
    updateCustomLightPos(id, posRef.current.x, posRef.current.z);
  }, [id, updateCustomLightPos, onDragEnd, gl]);

  return (
    <group
      ref={meshRef}
      position={[x, H - 0.15, z]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Aluminum Ceiling Mounting Base */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.1, 16]} />
        <meshStandardMaterial color={isSelected ? '#3b82f6' : '#64748b'} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Glowing Glass Lamp Cover */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity > 0.5 ? 1.2 : 0.2}
        />
      </mesh>

      {/* Selection Ring (Glowing Blue Indicator) */}
      {isSelected && (
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.55, 24]} />
          <meshBasicMaterial color="#3b82f6" side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
      )}

      {/* Actual PointLight (Light illumination without expensive cube shadow maps for instant performance) */}
      <pointLight
        position={[0, -0.2, 0]}
        intensity={intensity * 12}
        distance={9}
        color={color}
      />

      {/* Light Ray Cone Visual */}
      <mesh position={[0, -1.8, 0]}>
        <coneGeometry args={[1.5, 3.5, 16, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Floating Delete Action Panel */}
      {isSelected && (
        <Html position={[0, -0.6, 0]} center distanceFactor={8} style={{ pointerEvents: 'auto' }}>
          <div style={{
            background: 'rgba(255,255,255,0.98)',
            borderRadius: '20px',
            padding: '4px 10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            border: '1px solid #e2e8f0',
            userSelect: 'none'
          }}>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(id); }}
              title="Chiroqni o'chirish"
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '3px 8px',
                borderRadius: '14px',
                border: '1.5px solid #e11d48',
                background: '#fff1f2',
                color: '#be123c',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={13} /> Chiroqni O'chir
            </button>
          </div>
        </Html>
      )}
    </group>
  );
};

/** Main Lighting Simulator Component */
export const LightingSimulator = ({ selectedId, onSelect, onDragStart, onDragEnd }) => {
  const {
    roomDimensions,
    lightingActive,
    timeOfDay,
    customLights,
    removeCustomLight
  } = useAppStore();

  const { width: W, length: L, height: H } = roomDimensions;
  const [internalSelectedId, setInternalSelectedId] = useState(null);

  const activeSelectedId = selectedId !== undefined ? selectedId : internalSelectedId;
  const activeOnSelect = onSelect !== undefined ? onSelect : setInternalSelectedId;

  const config = useMemo(() => {
    return getTimeBasedLightConfig(timeOfDay);
  }, [timeOfDay]);

  if (!lightingActive) return null;

  return (
    <group>
      {/* Dynamic Time-Based Ambient Light */}
      <ambientLight color={config.ambientColor} intensity={config.ambientIntensity} />

      {/* Dynamic Sunlight (DirectionalLight) with Soft Shadow Maps */}
      <directionalLight
        position={config.sunPos}
        intensity={config.sunIntensity}
        color={config.sunColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-W}
        shadow-camera-right={W}
        shadow-camera-top={L}
        shadow-camera-bottom={-L}
        shadow-bias={-0.0005}
      />

      {/* Glass Windows on Back Wall (-L/2) for Sun Light Pass-Through */}
      {[-W / 4, W / 4].map((x, i) => (
        <group key={i} position={[x, H / 2 + 0.3, -L / 2 + 0.02]}>
          {/* Window Glass Frame */}
          <mesh>
            <boxGeometry args={[1.8, 1.4, 0.08]} />
            <meshPhysicalMaterial
              color="#a5f3fc"
              transparent
              opacity={0.35}
              roughness={0.05}
              transmission={0.85}
            />
          </mesh>
          {/* Window Wooden Border */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.9, 1.5, 0.04]} />
            <meshStandardMaterial color="#475569" wireframe />
          </mesh>
        </group>
      ))}

      {/* User Artificial LED Lights (Draggable & Selectable) */}
      {customLights.map(light => (
        <CustomLightFixture
          key={light.id}
          light={light}
          isSelected={activeSelectedId === light.id}
          onSelect={activeOnSelect}
          onDelete={removeCustomLight}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}
    </group>
  );
};
