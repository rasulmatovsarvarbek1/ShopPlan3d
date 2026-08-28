import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAppStore } from '../../store/useAppStore';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// PURE A* GRID PATHFINDER
// ─────────────────────────────────────────────────────────────────────────────
const GRID_RES = 0.35; // 0.35m high-resolution grid

function worldToGrid(x, z, roomW, roomL) {
  const gx = Math.floor((x + roomW / 2) / GRID_RES);
  const gz = Math.floor((z + roomL / 2) / GRID_RES);
  return { gx, gz };
}

function gridToWorld(gx, gz, roomW, roomL) {
  const x = (gx + 0.5) * GRID_RES - roomW / 2;
  const z = (gz + 0.5) * GRID_RES - roomL / 2;
  return new THREE.Vector3(x, 0.1, z);
}

function runAStar(startG, endG, cols, rows, blockedGrid) {
  const isValid = (x, z) => x >= 0 && x < cols && z >= 0 && z < rows && !blockedGrid[z]?.[x];

  if (!isValid(startG.gx, startG.gz) || !isValid(endG.gx, endG.gz)) {
    const findFreeNear = (g) => {
      for (let r = 1; r <= 5; r++) {
        for (let dx = -r; dx <= r; dx++) {
          for (let dz = -r; dz <= r; dz++) {
            const nx = g.gx + dx;
            const nz = g.gz + dz;
            if (isValid(nx, nz)) return { gx: nx, gz: nz };
          }
        }
      }
      return g;
    };
    if (!isValid(startG.gx, startG.gz)) startG = findFreeNear(startG);
    if (!isValid(endG.gx, endG.gz)) endG = findFreeNear(endG);
  }

  const openSet = [];
  const closedSet = new Set();

  const keyOf = (x, z) => `${x}_${z}`;
  const heuristic = (x1, z1, x2, z2) => Math.hypot(x1 - x2, z1 - z2);

  const startNode = {
    x: startG.gx,
    z: startG.gz,
    g: 0,
    h: heuristic(startG.gx, startG.gz, endG.gx, endG.gz),
    f: 0,
    parent: null
  };
  startNode.f = startNode.g + startNode.h;
  openSet.push(startNode);

  const nodeMap = new Map();
  nodeMap.set(keyOf(startNode.x, startNode.z), startNode);

  let current = null;
  let iterations = 0;
  const MAX_ITERS = 2500;

  while (openSet.length > 0 && iterations < MAX_ITERS) {
    iterations++;
    openSet.sort((a, b) => a.f - b.f);
    current = openSet.shift();

    if (current.x === endG.gx && current.z === endG.gz) {
      const path = [];
      let temp = current;
      while (temp) {
        path.push({ gx: temp.x, gz: temp.z });
        temp = temp.parent;
      }
      return path.reverse();
    }

    closedSet.add(keyOf(current.x, current.z));

    const neighbors = [
      { x: current.x + 1, z: current.z, cost: 1 },
      { x: current.x - 1, z: current.z, cost: 1 },
      { x: current.x, z: current.z + 1, cost: 1 },
      { x: current.x, z: current.z - 1, cost: 1 },
      { x: current.x + 1, z: current.z + 1, cost: 1.414 },
      { x: current.x - 1, z: current.z + 1, cost: 1.414 },
      { x: current.x + 1, z: current.z - 1, cost: 1.414 },
      { x: current.x - 1, z: current.z - 1, cost: 1.414 }
    ];

    for (const n of neighbors) {
      if (!isValid(n.x, n.z) || closedSet.has(keyOf(n.x, n.z))) continue;

      const tentativeG = current.g + n.cost;
      const nKey = keyOf(n.x, n.z);
      let neighborNode = nodeMap.get(nKey);

      if (!neighborNode) {
        neighborNode = {
          x: n.x,
          z: n.z,
          g: Infinity,
          h: heuristic(n.x, n.z, endG.gx, endG.gz),
          f: Infinity,
          parent: null
        };
        nodeMap.set(nKey, neighborNode);
      }

      if (tentativeG < neighborNode.g) {
        neighborNode.parent = current;
        neighborNode.g = tentativeG;
        neighborNode.f = neighborNode.g + neighborNode.h;
        if (!openSet.includes(neighborNode)) {
          openSet.push(neighborNode);
        }
      }
    }
  }

  return [startG, endG];
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D HUMANOID CUSTOMER AVATAR WITH PAUSE BEHAVIOR
// ─────────────────────────────────────────────────────────────────────────────
const CustomerAvatar = ({ curve, speed = 1.0, color = '#3b82f6', offsetT = 0, label = '' }) => {
  const avatarRef = useRef();
  const progressRef = useRef(offsetT);
  const pauseTimerRef = useRef(0);

  useFrame((state, delta) => {
    if (!curve || !avatarRef.current) return;

    // Handle brief pauses near browsing waypoints (around t=0.4 and t=0.85)
    const t = progressRef.current;
    const isNearPause = (t > 0.42 && t < 0.46) || (t > 0.88 && t < 0.92);

    if (isNearPause && pauseTimerRef.current < 1.2) {
      pauseTimerRef.current += delta;
      return; // Pause avatar briefly
    }
    if (!isNearPause) {
      pauseTimerRef.current = 0;
    }

    progressRef.current += (delta * 0.14 * speed);
    if (progressRef.current > 1) {
      progressRef.current = 0;
      pauseTimerRef.current = 0;
    }

    const point = curve.getPointAt(progressRef.current);
    avatarRef.current.position.set(point.x, 0, point.z);

    // Smoothly face movement direction
    if (progressRef.current < 0.98) {
      const nextPoint = curve.getPointAt(progressRef.current + 0.01);
      avatarRef.current.lookAt(nextPoint.x, 0, nextPoint.z);
    }
  });

  return (
    <group ref={avatarRef}>
      {/* Head */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      {/* Body / Torso */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.12, 0.6, 12]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Base Glowing Indicator Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.22, 0.32, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FOOT TRAFFIC SIMULATOR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const FootTrafficSimulator = () => {
  const {
    roomDimensions,
    equipmentList,
    positions,
    rotations,
    footTrafficActive,
    setFootTrafficAnalytics
  } = useAppStore();

  const { width: W, length: L } = roomDimensions;

  // Build Grid, Path, and Analytics
  const { curve, analytics } = useMemo(() => {
    if (!footTrafficActive) return { curve: null, analytics: null };

    const cols = Math.ceil(W / GRID_RES);
    const rows = Math.ceil(L / GRID_RES);

    const blockedGrid = Array.from({ length: rows }, () => Array(cols).fill(false));

    const placed = [];
    equipmentList.forEach(item => {
      for (let i = 0; i < item.count; i++) {
        const uid = `${item.id}_${i}`;
        const pos = positions[uid] || [0, 0, 0];
        const rotStep = rotations[uid] || 0;
        const isRot = rotStep === 1 || rotStep === 3;
        const ew = isRot ? (item.depth || 0.8) : (item.width || 1.2);
        const ed = isRot ? (item.width || 1.2) : (item.depth || 0.8);

        placed.push({ uid, type: item.type, pos, ew, ed });

        // Safety boundary margin around equipment
        const margin = 0.25;
        const minX = pos[0] - ew / 2 - margin;
        const maxX = pos[0] + ew / 2 + margin;
        const minZ = pos[2] - ed / 2 - margin;
        const maxZ = pos[2] + ed / 2 + margin;

        const gMin = worldToGrid(minX, minZ, W, L);
        const gMax = worldToGrid(maxX, maxZ, W, L);

        for (let r = Math.max(0, gMin.gz); r <= Math.min(rows - 1, gMax.gz); r++) {
          for (let c = Math.max(0, gMin.gx); c <= Math.min(cols - 1, gMax.gx); c++) {
            blockedGrid[r][c] = true;
          }
        }
      }
    });

    // Key Store Locations
    const startPoint = new THREE.Vector3(0, 0.1, L / 2 - 0.7);

    // Find cashier counter
    const counterObj = placed.find(p => p.type === 'counter');
    const rawCounterX = counterObj ? counterObj.pos[0] : (W / 4);
    const rawCounterZ = counterObj ? (counterObj.pos[2] + counterObj.ed / 2 + 0.6) : (L / 2 - 1.5);
    const counterPoint = new THREE.Vector3(
      Math.max(-W / 2 + 0.6, Math.min(W / 2 - 0.6, rawCounterX)),
      0.1,
      Math.max(-L / 2 + 0.6, Math.min(L / 2 - 0.6, rawCounterZ))
    );

    // Browsing zones near shelves
    const shelfObjs = placed.filter(p => p.type !== 'counter');
    const waypoints = [startPoint];

    if (shelfObjs.length > 0) {
      const p1 = shelfObjs[0];
      waypoints.push(new THREE.Vector3(
        Math.max(-W / 2 + 0.8, Math.min(W / 2 - 0.8, p1.pos[0] + (p1.pos[0] > 0 ? -1.1 : 1.1))),
        0.1,
        p1.pos[2]
      ));
    }
    if (shelfObjs.length > 2) {
      const p2 = shelfObjs[Math.floor(shelfObjs.length / 2)];
      waypoints.push(new THREE.Vector3(
        p2.pos[0],
        0.1,
        Math.max(-L / 2 + 0.8, Math.min(L / 2 - 0.8, p2.pos[2] + (p2.pos[2] > 0 ? -1.1 : 1.1)))
      ));
    }
    waypoints.push(counterPoint);
    waypoints.push(new THREE.Vector3(0.5, 0.1, L / 2 - 0.7)); // Exit back to entrance

    // A* Path calculation
    const fullPoints = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const pA = waypoints[i];
      const pB = waypoints[i + 1];

      const startG = worldToGrid(pA.x, pA.z, W, L);
      const endG = worldToGrid(pB.x, pB.z, W, L);

      const gridPath = runAStar(startG, endG, cols, rows, blockedGrid);
      gridPath.forEach(g => {
        fullPoints.push(gridToWorld(g.gx, g.gz, W, L));
      });
    }

    if (fullPoints.length < 2) {
      fullPoints.push(startPoint, counterPoint);
    }

    // CatmullRomCurve3 Smooth Interpolation
    const pathCurve = new THREE.CatmullRomCurve3(fullPoints, false, 'centripetal', 0.25);
    const totalDist = pathCurve.getLength();

    // Direct Entrance -> Cashier Path distance calculation
    const startG = worldToGrid(startPoint.x, startPoint.z, W, L);
    const counterG = worldToGrid(counterPoint.x, counterPoint.z, W, L);
    const kassaPathNodes = runAStar(startG, counterG, cols, rows, blockedGrid);
    let kassaPathDist = 0;
    for (let i = 0; i < kassaPathNodes.length - 1; i++) {
      const p1 = gridToWorld(kassaPathNodes[i].gx, kassaPathNodes[i].gz, W, L);
      const p2 = gridToWorld(kassaPathNodes[i + 1].gx, kassaPathNodes[i + 1].gz, W, L);
      kassaPathDist += p1.distanceTo(p2);
    }

    // Analytics Metrics
    const walkSpeed = 1.1; // 1.1 m/s average shop walk
    const walkTimeSec = Math.round(totalDist / walkSpeed);

    let warningMsg = "Oqim optimal: Mijozlar xona bo'ylab qulay harakatlanmoqda.";
    let isWarn = false;

    // Check if entrance to cashier distance is excessively far relative to room dimensions
    const maxAllowedKassaDist = Math.max(8, (W + L) * 0.85);
    if (kassaPathDist > maxAllowedKassaDist) {
      warningMsg = "Kassa joylashuvi uzoq yoki to'siq bor! Kassa va javonlar joyini o'zgartirish tavsiya etiladi.";
      isWarn = true;
    } else if (walkTimeSec > 40) {
      warningMsg = "Do'kon bo'ylab harakatlanish vaqti uzoq (40s+). Koridorlarni kengaytiring.";
      isWarn = true;
    }

    return {
      curve: pathCurve,
      analytics: {
        avgWalkTimeSec: walkTimeSec,
        pathLengthMeters: Math.round(totalDist * 10) / 10,
        warningMessage: warningMsg,
        isWarning: isWarn
      }
    };
  }, [footTrafficActive, W, L, equipmentList, positions, rotations]);

  useEffect(() => {
    if (footTrafficActive && analytics) {
      setFootTrafficAnalytics(analytics);
    }
  }, [footTrafficActive, analytics, setFootTrafficAnalytics]);

  if (!footTrafficActive || !curve) return null;

  const curvePoints = curve.getPoints(100);

  return (
    <group>
      {/* Main Dashed Flow Line on Floor */}
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints(curvePoints)} />
        <lineDashedMaterial
          attach="material"
          color="#38bdf8"
          dashSize={0.4}
          gapSize={0.2}
          linewidth={3.5}
        />
      </line>

      {/* Entrance Door Marker */}
      <mesh position={[0, 0.03, L / 2 - 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>

      {/* 3 Virtual Humanoid Customers with Different Speeds */}
      <CustomerAvatar curve={curve} speed={1.0} color="#06b6d4" offsetT={0} label="Mijoz 1" />
      <CustomerAvatar curve={curve} speed={1.2} color="#ec4899" offsetT={0.33} label="Mijoz 2" />
      <CustomerAvatar curve={curve} speed={0.85} color="#f59e0b" offsetT={0.66} label="Mijoz 3" />
    </group>
  );
};
