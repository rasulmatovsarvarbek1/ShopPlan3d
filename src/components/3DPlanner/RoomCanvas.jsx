import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Html } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';
import * as THREE from 'three';

// ─────────────────────────────────────────────
// BUSINESS-SPECIFIC 3D SHAPES
// ─────────────────────────────────────────────

/** Muzlatgich (fridge) */
const FridgeShape = ({ color }) => (
  <group>
    <mesh position={[0, 1.0, 0]} castShadow>
      <boxGeometry args={[1.4, 2.0, 0.75]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
    </mesh>
    {/* Glass door */}
    <mesh position={[0, 1.0, 0.385]}>
      <boxGeometry args={[1.2, 1.7, 0.02]} />
      <meshPhysicalMaterial color="#a5f3fc" transparent opacity={0.45} roughness={0.05} transmission={0.7} />
    </mesh>
    {/* Handle */}
    <mesh position={[0.45, 1.2, 0.4]}>
      <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.9} />
    </mesh>
  </group>
);

/** Devoriy javon (wall shelf) */
const ShelfShape = ({ color, height = 2.2 }) => (
  <group>
    <mesh position={[0, height / 2, 0]} castShadow>
      <boxGeometry args={[1.2, height, 0.4]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    {[0.4, 0.9, 1.4, 1.9].filter(y => y < height).map((y, i) => (
      <mesh key={i} position={[0, y, 0.18]}>
        <boxGeometry args={[1.1, 0.04, 0.35]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
    ))}
    {/* stock items on shelves */}
    {[0.3, 0.8, 1.3, 1.8].filter(y => y < height).map((y, i) => (
      <mesh key={'s' + i} position={[(i % 2 === 0 ? -0.25 : 0.25), y + 0.08, 0.1]}>
        <boxGeometry args={[0.18, 0.14, 0.1]} />
        <meshStandardMaterial color={i % 2 === 0 ? '#f43f5e' : '#3b82f6'} />
      </mesh>
    ))}
  </group>
);

/** Kassa stoli */
const CounterShape = ({ color }) => (
  <group>
    <mesh position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1.8, 1.0, 0.85]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
    <mesh position={[0, 1.02, 0]}>
      <boxGeometry args={[1.85, 0.06, 0.9]} />
      <meshStandardMaterial color="#f1f5f9" metalness={0.3} roughness={0.3} />
    </mesh>
    {/* monitor */}
    <mesh position={[0.5, 1.35, -0.2]}>
      <boxGeometry args={[0.45, 0.3, 0.04]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
  </group>
);

/** Maneken (clothing mannequin) */
const ManekenShape = ({ color }) => (
  <group>
    {/* Body */}
    <mesh position={[0, 0.95, 0]} castShadow>
      <cylinderGeometry args={[0.18, 0.2, 0.7, 10]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    {/* Neck */}
    <mesh position={[0, 1.35, 0]}>
      <cylinderGeometry args={[0.06, 0.08, 0.18, 8]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    {/* Head */}
    <mesh position={[0, 1.57, 0]}>
      <sphereGeometry args={[0.14, 12, 12]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    {/* Pole */}
    <mesh position={[0, 0.3, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.8} />
    </mesh>
    {/* Base */}
    <mesh position={[0, 0.04, 0]}>
      <cylinderGeometry args={[0.22, 0.26, 0.08, 16]} />
      <meshStandardMaterial color="#64748b" metalness={0.6} />
    </mesh>
  </group>
);

/** Kiyim veshalqa rack */
const ClothingRackShape = ({ color }) => (
  <group>
    {/* Horizontal bar */}
    <mesh position={[0, 1.8, 0]} rotation={[0, 0, 0]} castShadow>
      <cylinderGeometry args={[0.025, 0.025, 1.4, 8]} rotation={[0, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.8} />
    </mesh>
    {/* Left leg */}
    <mesh position={[-0.65, 0.9, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 1.8, 8]} />
      <meshStandardMaterial color={color} metalness={0.5} />
    </mesh>
    {/* Right leg */}
    <mesh position={[0.65, 0.9, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 1.8, 8]} />
      <meshStandardMaterial color={color} metalness={0.5} />
    </mesh>
    {/* Base bars */}
    {[-0.3, 0.3].map((z, i) => (
      <mesh key={i} position={[-0.65, 0.1, z]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} rotation={[0, Math.PI / 2, 0]} />
        <meshStandardMaterial color={color} metalness={0.5} />
      </mesh>
    ))}
    {/* Hangers */}
    {[-0.4, -0.1, 0.2, 0.5].map((x, i) => (
      <group key={i} position={[x, 1.75, 0]}>
        <mesh>
          <torusGeometry args={[0.08, 0.01, 6, 16, Math.PI]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[0.22, 0.28, 0.02]} />
          <meshStandardMaterial color={['#f43f5e', '#3b82f6', '#10b981', '#f59e0b'][i]} />
        </mesh>
      </group>
    ))}
  </group>
);

/** Kiyinish xonasi (fitting room) */
const FittingRoomShape = ({ color }) => (
  <group>
    {/* Walls */}
    <mesh position={[-0.6, 1.2, 0]}>
      <boxGeometry args={[0.06, 2.4, 1.3]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0.6, 1.2, 0]}>
      <boxGeometry args={[0.06, 2.4, 1.3]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, 1.2, -0.6]}>
      <boxGeometry args={[1.2, 2.4, 0.06]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {/* Curtain */}
    <mesh position={[0, 1.1, 0.55]}>
      <boxGeometry args={[1.1, 2.1, 0.04]} />
      <meshStandardMaterial color="#e0e7ff" transparent opacity={0.7} />
    </mesh>
    {/* Mirror */}
    <mesh position={[0, 1.0, -0.55]}>
      <boxGeometry args={[0.6, 1.6, 0.02]} />
      <meshStandardMaterial color="#bfdbfe" metalness={0.9} roughness={0.05} />
    </mesh>
  </group>
);

// ─── FITNESS SHAPES ────────────────────────

/** Treadmill (yugurish yo'lakchasi) */
const TreadmillShape = ({ color }) => (
  <group>
    {/* Base platform */}
    <mesh position={[0, 0.18, 0]} castShadow>
      <boxGeometry args={[1.9, 0.22, 0.85]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
    {/* Belt / running surface */}
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[1.5, 0.04, 0.58]} />
      <meshStandardMaterial color="#1e293b" roughness={0.8} />
    </mesh>
    {/* Left handle */}
    <mesh position={[-0.6, 1.05, -0.25]} rotation={[0.35, 0, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 1.3, 8]} />
      <meshStandardMaterial color="#475569" metalness={0.7} />
    </mesh>
    {/* Right handle */}
    <mesh position={[0.6, 1.05, -0.25]} rotation={[0.35, 0, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 1.3, 8]} />
      <meshStandardMaterial color="#475569" metalness={0.7} />
    </mesh>
    {/* Screen */}
    <mesh position={[0, 1.45, -0.35]}>
      <boxGeometry args={[0.55, 0.35, 0.05]} />
      <meshStandardMaterial color="#0f172a" />
    </mesh>
    <mesh position={[0, 1.45, -0.33]}>
      <boxGeometry args={[0.48, 0.28, 0.01]} />
      <meshStandardMaterial color="#1d4ed8" emissive="#3b82f6" emissiveIntensity={0.4} />
    </mesh>
  </group>
);

/** Gantel stendi */
const DumbbellRackShape = ({ color }) => (
  <group>
    {/* Rack frame */}
    <mesh position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[2.2, 0.9, 0.55]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
    </mesh>
    {/* Dumbbell pairs */}
    {[-0.7, 0, 0.7].map((x, i) => (
      <group key={i} position={[x, 0.62, 0.1]}>
        <mesh position={[-0.2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 12]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#374151" metalness={0.8} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
        <mesh position={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 12]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#374151" metalness={0.8} />
        </mesh>
      </group>
    ))}
  </group>
);

/** Bench press */
const BenchShape = ({ color }) => (
  <group>
    {/* Bench pad */}
    <mesh position={[0, 0.55, 0]} castShadow>
      <boxGeometry args={[1.5, 0.14, 0.42]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
    {/* Legs */}
    {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.22, z * 0.35]}>
        <cylinderGeometry args={[0.025, 0.025, 0.44, 6]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} />
      </mesh>
    ))}
    {/* Barbell rack */}
    <mesh position={[0, 1.1, 0.5]} castShadow>
      <boxGeometry args={[0.08, 0.85, 0.08]} />
      <meshStandardMaterial color="#475569" metalness={0.8} />
    </mesh>
    {/* Barbell */}
    <mesh position={[0, 1.52, 0.5]} rotation={[0, Math.PI / 2, 0]}>
      <cylinderGeometry args={[0.025, 0.025, 1.8, 8]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.9} />
    </mesh>
    {/* Weight plates */}
    {[-0.75, 0.75].map((x, i) => (
      <mesh key={i} position={[x, 1.52, 0.5]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} />
      </mesh>
    ))}
  </group>
);

/** Krossover trenajyor */
const CrossoverShape = ({ color }) => (
  <group>
    {/* Left tower */}
    <mesh position={[-1.5, 1.15, 0]} castShadow>
      <boxGeometry args={[0.22, 2.3, 0.22]} />
      <meshStandardMaterial color={color} metalness={0.6} />
    </mesh>
    {/* Right tower */}
    <mesh position={[1.5, 1.15, 0]} castShadow>
      <boxGeometry args={[0.22, 2.3, 0.22]} />
      <meshStandardMaterial color={color} metalness={0.6} />
    </mesh>
    {/* Top bar */}
    <mesh position={[0, 2.3, 0]}>
      <boxGeometry args={[3.22, 0.18, 0.18]} />
      <meshStandardMaterial color={color} metalness={0.6} />
    </mesh>
    {/* Cables */}
    {[[-1.4, 0], [1.4, 0]].map(([x, z], i) => (
      <mesh key={i} position={[x, 1.1, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1.8, 6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
    ))}
    {/* Weight stacks */}
    {[[-1.35, 0], [1.35, 0]].map(([x, z], i) => (
      <mesh key={'w' + i} position={[x, 0.55, 0]}>
        <boxGeometry args={[0.18, 0.9, 0.18]} />
        <meshStandardMaterial color="#334155" metalness={0.5} />
      </mesh>
    ))}
  </group>
);

/** Kiyinish shkafi (locker) */
const LockerShape = ({ color }) => (
  <group>
    {[0, 0.42, 0.84, 1.26].map((x, i) => (
      <group key={i} position={[x - 0.63, 1.0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 2.0, 0.5]} />
          <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.252]}>
          <boxGeometry args={[0.35, 1.85, 0.02]} />
          <meshStandardMaterial color={color === '#d97706' ? '#fbbf24' : '#64748b'} metalness={0.6} />
        </mesh>
        <mesh position={[0.12, 0, 0.265]}>
          <cylinderGeometry args={[0.018, 0.018, 0.04, 8]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.9} />
        </mesh>
      </group>
    ))}
  </group>
);

// ─── COSMETICS ────────────────────────

const VitrinaShape = ({ color }) => (
  <group>
    <mesh position={[0, 1.1, 0]} castShadow>
      <boxGeometry args={[1.4, 2.2, 0.42]} />
      <meshPhysicalMaterial color="#f0f9ff" transparent opacity={0.35} roughness={0.05} transmission={0.8} />
    </mesh>
    <mesh position={[0, 1.1, 0]}>
      <boxGeometry args={[1.42, 2.22, 0.04]} />
      <meshStandardMaterial color={color} metalness={0.5} />
    </mesh>
    {[0.35, 0.85, 1.35, 1.85].map((y, i) => (
      <group key={i} position={[0, y, 0]}>
        <mesh position={[-0.35, 0, 0.05]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color={['#f43f5e', '#c084fc', '#fbbf24', '#34d399'][i]} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <cylinderGeometry args={[0.05, 0.04, 0.12, 8]} />
          <meshStandardMaterial color="#e879f9" />
        </mesh>
        <mesh position={[0.35, 0, 0.05]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#818cf8" />
        </mesh>
      </group>
    ))}
  </group>
);

const MakeupTableShape = ({ color }) => (
  <group>
    <mesh position={[0, 0.42, 0]} castShadow>
      <boxGeometry args={[1.6, 0.82, 0.7]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.84, 0]}>
      <boxGeometry args={[1.62, 0.04, 0.72]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.2} />
    </mesh>
    {/* Mirror */}
    <mesh position={[0, 1.35, -0.3]} rotation={[0.15, 0, 0]}>
      <boxGeometry args={[0.85, 0.9, 0.04]} />
      <meshStandardMaterial color="#e0f2fe" metalness={0.8} roughness={0.1} />
    </mesh>
    {/* Light strip */}
    <mesh position={[0, 1.8, -0.28]}>
      <boxGeometry args={[0.9, 0.06, 0.04]} />
      <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.0} />
    </mesh>
    {/* Stool */}
    <mesh position={[0, 0.28, 0.65]}>
      <cylinderGeometry args={[0.28, 0.28, 0.04, 12]} />
      <meshStandardMaterial color="#c4b5fd" roughness={0.7} />
    </mesh>
    <mesh position={[0, 0.12, 0.65]}>
      <cylinderGeometry args={[0.04, 0.04, 0.24, 8]} />
      <meshStandardMaterial color="#a78bfa" metalness={0.4} />
    </mesh>
  </group>
);

// ─── ELECTRONICS ────────────────────────

const DemoTableShape = ({ color }) => (
  <group>
    <mesh position={[0, 0.44, 0]} castShadow>
      <boxGeometry args={[2.2, 0.88, 0.95]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
    <mesh position={[0, 0.88, 0]}>
      <boxGeometry args={[2.22, 0.04, 0.97]} />
      <meshStandardMaterial color="#f1f5f9" roughness={0.1} metalness={0.4} />
    </mesh>
    {/* Phones */}
    {[-0.7, 0, 0.7].map((x, i) => (
      <group key={i} position={[x, 0.92, 0.1]}>
        <mesh>
          <boxGeometry args={[0.18, 0.02, 0.36]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.16, 0.01, 0.34]} />
          <meshStandardMaterial color="#1d4ed8" emissive="#3b82f6" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.0, 0.02, 0.19]}>
          <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>
    ))}
    {/* Legs */}
    {[[-0.9, -0.4], [0.9, -0.4], [-0.9, 0.4], [0.9, 0.4]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.22, z]}>
        <boxGeometry args={[0.06, 0.44, 0.06]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} />
      </mesh>
    ))}
  </group>
);

const TVWallShape = ({ color }) => (
  <group>
    {/* Wall mount frame */}
    <mesh position={[0, 1.3, 0]} castShadow>
      <boxGeometry args={[4.0, 2.6, 0.18]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
    {/* TV screens */}
    {[-1.2, 1.2].map((x, i) => (
      <group key={i} position={[x, 1.3, 0.1]}>
        <mesh>
          <boxGeometry args={[1.7, 1.0, 0.08]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[1.55, 0.88, 0.02]} />
          <meshStandardMaterial color="#1d4ed8" emissive="#3b82f6" emissiveIntensity={0.6} />
        </mesh>
      </group>
    ))}
  </group>
);

// ─── CAFE ────────────────────────

const CoffeeBarShape = ({ color }) => (
  <group>
    <mesh position={[0, 0.55, 0]} castShadow>
      <boxGeometry args={[3.2, 1.1, 0.95]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    <mesh position={[0, 1.1, 0]}>
      <boxGeometry args={[3.24, 0.06, 0.97]} />
      <meshStandardMaterial color="#f1f5f9" roughness={0.1} metalness={0.3} />
    </mesh>
    {/* Coffee machine */}
    <mesh position={[-1.1, 1.38, -0.2]} castShadow>
      <boxGeometry args={[0.55, 0.55, 0.42]} />
      <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
    </mesh>
    <mesh position={[-1.1, 1.58, 0.02]}>
      <cylinderGeometry args={[0.07, 0.07, 0.3, 8]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.8} />
    </mesh>
    {/* Cups */}
    {[-0.3, 0.1, 0.5].map((x, i) => (
      <mesh key={i} position={[x, 1.15, 0.2]}>
        <cylinderGeometry args={[0.05, 0.04, 0.1, 8]} />
        <meshStandardMaterial color={['#f8fafc', '#fef9c3', '#ffe4e6'][i]} />
      </mesh>
    ))}
  </group>
);

const SeatingShape = ({ color }) => (
  <group>
    {/* Table */}
    <mesh position={[0, 0.74, 0]}>
      <cylinderGeometry args={[0.52, 0.52, 0.06, 20]} />
      <meshStandardMaterial color="#d97706" roughness={0.5} />
    </mesh>
    <mesh position={[0, 0.38, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.74, 8]} />
      <meshStandardMaterial color="#92400e" roughness={0.5} />
    </mesh>
    {/* Chairs */}
    {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => {
      const x = Math.sin(angle) * 0.76;
      const z = Math.cos(angle) * 0.76;
      return (
        <group key={i} position={[x, 0, z]} rotation={[0, -angle, 0]}>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.05, 12]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.28, 6]} />
            <meshStandardMaterial color="#b45309" />
          </mesh>
          <mesh position={[0, 0.55, -0.2]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.4, 0.46, 0.05]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        </group>
      );
    })}
  </group>
);

/** Divan (Sofa) */
const SofaShape = ({ color }) => (
  <group>
    {/* Seat base */}
    <mesh position={[0, 0.22, 0]} castShadow>
      <boxGeometry args={[1.9, 0.3, 0.85]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    {/* Seat cushions */}
    {[-0.55, 0, 0.55].map((x, i) => (
      <mesh key={i} position={[x, 0.42, 0]}>
        <boxGeometry args={[0.58, 0.14, 0.82]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    ))}
    {/* Back rest */}
    <mesh position={[0, 0.66, -0.38]} castShadow>
      <boxGeometry args={[1.9, 0.6, 0.12]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    {/* Armrests */}
    <mesh position={[-0.9, 0.52, -0.05]}>
      <boxGeometry args={[0.12, 0.44, 0.82]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
    <mesh position={[0.9, 0.52, -0.05]}>
      <boxGeometry args={[0.12, 0.44, 0.82]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
    {/* Legs */}
    {[[-0.8, -0.35], [0.8, -0.35], [-0.8, 0.35], [0.8, 0.35]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.05, z]}>
        <boxGeometry args={[0.06, 0.1, 0.06]} />
        <meshStandardMaterial color="#78350f" metalness={0.3} />
      </mesh>
    ))}
  </group>
);

/** Velosiped trenajyor (Bike) */
const BikeShape = ({ color }) => (
  <group>
    {/* Frame body */}
    <mesh position={[0, 0.52, 0]} castShadow>
      <boxGeometry args={[0.55, 0.08, 0.55]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
    </mesh>
    {/* Front wheel */}
    <mesh position={[0, 0.35, 0.25]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.28, 0.04, 8, 20]} />
      <meshStandardMaterial color="#1e293b" roughness={0.8} />
    </mesh>
    {/* Rear wheel */}
    <mesh position={[0, 0.35, -0.25]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[0.28, 0.04, 8, 20]} />
      <meshStandardMaterial color="#1e293b" roughness={0.8} />
    </mesh>
    {/* Pedal crank */}
    <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.06, 0.06, 0.12, 8]} />
      <meshStandardMaterial color="#475569" metalness={0.8} />
    </mesh>
    {/* Handle bars */}
    <mesh position={[0, 1.1, 0.2]}>
      <boxGeometry args={[0.55, 0.04, 0.04]} />
      <meshStandardMaterial color="#64748b" metalness={0.8} />
    </mesh>
    {/* Stem */}
    <mesh position={[0, 0.78, 0.2]}>
      <cylinderGeometry args={[0.025, 0.025, 0.64, 8]} />
      <meshStandardMaterial color="#475569" metalness={0.7} />
    </mesh>
    {/* Screen */}
    <mesh position={[0, 1.25, 0.05]}>
      <boxGeometry args={[0.24, 0.16, 0.04]} />
      <meshStandardMaterial color="#0f172a" />
    </mesh>
    <mesh position={[0, 1.25, 0.04]}>
      <boxGeometry args={[0.2, 0.12, 0.01]} />
      <meshStandardMaterial color="#1d4ed8" emissive="#3b82f6" emissiveIntensity={0.5} />
    </mesh>
    {/* Seat */}
    <mesh position={[0, 0.82, -0.15]}>
      <boxGeometry args={[0.26, 0.04, 0.4]} />
      <meshStandardMaterial color="#1e293b" roughness={0.7} />
    </mesh>
  </group>
);

/** Moy va suyuqliklar vitrinasi */
const OilDisplayShape = ({ color }) => (
  <group>
    {/* Frame */}
    <mesh position={[0, 1.0, 0]} castShadow>
      <boxGeometry args={[1.5, 2.0, 0.45]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
    {/* Shelves */}
    {[0.3, 0.75, 1.2, 1.65].map((y, i) => (
      <mesh key={i} position={[0, y, 0.22]}>
        <boxGeometry args={[1.35, 0.04, 0.38]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
    ))}
    {/* Oil bottles */}
    {[0.3, 0.75, 1.2, 1.65].map((y, row) =>
      [-0.45, 0, 0.45].map((x, col) => (
        <group key={`${row}-${col}`} position={[x, y + 0.14, 0.1]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.07, 0.26, 8]} />
            <meshStandardMaterial
              color={[['#f97316', '#fbbf24', '#84cc16'], ['#38bdf8', '#60a5fa', '#a78bfa'], ['#fb923c', '#facc15', '#4ade80'], ['#22d3ee', '#818cf8', '#f472b6']][row][col]}
            />
          </mesh>
          {/* Cap */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.06, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      ))
    )}
  </group>
);

/** Spinner / Kantselyariya aylana stendi */
const SpinnerRackShape = ({ color }) => (
  <group>
    {/* Central pole */}
    <mesh position={[0, 1.0, 0]}>
      <cylinderGeometry args={[0.03, 0.03, 2.0, 8]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.8} />
    </mesh>
    {/* Base */}
    <mesh position={[0, 0.05, 0]}>
      <cylinderGeometry args={[0.25, 0.3, 0.1, 16]} />
      <meshStandardMaterial color="#64748b" metalness={0.6} />
    </mesh>
    {/* Rotating shelves */}
    {[0.4, 0.8, 1.2, 1.6].map((y, row) => (
      <group key={row} position={[0, y, 0]} rotation={[0, row * 0.5, 0]}>
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, j) => {
          const r = 0.3;
          return (
            <group key={j} position={[Math.sin(angle) * r, 0, Math.cos(angle) * r]} rotation={[0, -angle, 0]}>
              <mesh>
                <boxGeometry args={[0.14, 0.22, 0.04]} />
                <meshStandardMaterial color={[color, '#f43f5e', '#3b82f6', '#10b981'][j]} />
              </mesh>
            </group>
          );
        })}
      </group>
    ))}
  </group>
);

/** Mutolaa stoli (Reader table) */
const ReaderTableShape = ({ color }) => (
  <group>
    {/* Table top */}
    <mesh position={[0, 0.76, 0]} castShadow>
      <boxGeometry args={[1.7, 0.06, 0.85]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
    {/* Legs */}
    {[[-0.75, -0.35], [0.75, -0.35], [-0.75, 0.35], [0.75, 0.35]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.37, z]}>
        <boxGeometry args={[0.05, 0.74, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    ))}
    {/* Books on table */}
    {[-0.4, 0, 0.4].map((x, i) => (
      <mesh key={i} position={[x, 0.82, 0.1]} rotation={[0, (i - 1) * 0.15, 0]}>
        <boxGeometry args={[0.18, 0.26, 0.04]} />
        <meshStandardMaterial color={['#6366f1', '#f43f5e', '#10b981'][i]} />
      </mesh>
    ))}
    {/* Chair */}
    <group position={[0, 0, 0.55]}>
      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#c7d2fe" roughness={0.7} />
      </mesh>
      {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.24, 6]} />
          <meshStandardMaterial color="#4338ca" />
        </mesh>
      ))}
      <mesh position={[0, 0.58, -0.22]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.48, 0.44, 0.04]} />
        <meshStandardMaterial color="#c7d2fe" roughness={0.7} />
      </mesh>
    </group>
  </group>
);

// ─── PHARMACY ────────────────────────

const DrawerRackShape = ({ color }) => (
  <group>
    <mesh position={[0, 0.9, 0]} castShadow>
      <boxGeometry args={[1.5, 1.8, 0.55]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
    </mesh>
    {[0.2, 0.55, 0.9, 1.25, 1.6].map((y, i) => (
      <group key={i}>
        {[-0.45, 0, 0.45].map((x, j) => (
          <mesh key={j} position={[x, y, 0.28]}>
            <boxGeometry args={[0.42, 0.28, 0.02]} />
            <meshStandardMaterial color="#e0f2fe" metalness={0.5} />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

// ─── AUTO PARTS ────────────────────────

const HeavyRackShape = ({ color }) => (
  <group>
    {/* Vertical beams */}
    {[-0.85, 0.85].map((x, i) => (
      <mesh key={i} position={[x, 1.25, 0]}>
        <boxGeometry args={[0.08, 2.5, 0.08]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.3} />
      </mesh>
    ))}
    {/* Horizontal shelves */}
    {[0.4, 0.95, 1.5, 2.05].map((y, i) => (
      <mesh key={i} position={[0, y, 0]}>
        <boxGeometry args={[1.8, 0.06, 0.6]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} />
      </mesh>
    ))}
    {/* Items on shelves */}
    {[0.4, 0.95, 1.5].map((y, i) => (
      <mesh key={'item' + i} position={[i % 2 === 0 ? -0.4 : 0.4, y + 0.12, 0]}>
        <boxGeometry args={[0.35, 0.2, 0.45]} />
        <meshStandardMaterial color={['#374151', '#1f2937', '#111827'][i]} />
      </mesh>
    ))}
  </group>
);

const TireStandShape = ({ color }) => (
  <group>
    <mesh position={[0, 0.9, 0]} castShadow>
      <boxGeometry args={[0.35, 1.8, 0.45]} />
      <meshStandardMaterial color={color} metalness={0.5} />
    </mesh>
    {[0.3, 0.7, 1.1, 1.5].map((y, i) => (
      <mesh key={i} position={[0.3, y, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.28, 0.1, 8, 20]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
    ))}
  </group>
);

// ─── FLOWERS ────────────────────────

const FlowerStandShape = ({ color }) => (
  <group>
    {/* Shelf steps */}
    {[0.25, 0.55, 0.85].map((y, i) => (
      <mesh key={i} position={[0, y, (i - 1) * -0.18]}>
        <boxGeometry args={[1.2 - i * 0.15, 0.05, 0.55 - i * 0.08]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    ))}
    {/* Flower pots */}
    {[[0, 0.85, 0.1], [-0.35, 0.58, 0.15], [0.35, 0.58, 0.15], [0, 0.28, 0.1]].map(([x, y, z], i) => (
      <group key={i} position={[x, y, z]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.08, 0.14, 8]} />
          <meshStandardMaterial color={['#f97316', '#84cc16', '#ec4899', '#f59e0b'][i]} />
        </mesh>
        {/* Flowers */}
        {[0, 1, 2].map(j => (
          <mesh key={j} position={[Math.sin(j * 2.1) * 0.07, 0.12, Math.cos(j * 2.1) * 0.07]}>
            <sphereGeometry args={[0.06, 6, 6]} />
            <meshStandardMaterial color={['#f43f5e', '#a3e635', '#f472b6', '#fbbf24'][i]} />
          </mesh>
        ))}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.12, 4]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
      </group>
    ))}
  </group>
);

const ColdRoomShape = ({ color }) => (
  <group>
    <mesh position={[0, 1.2, 0]} castShadow>
      <boxGeometry args={[2.5, 2.4, 2.0]} />
      <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.3} roughness={0.05} transmission={0.7} />
    </mesh>
    <mesh position={[0, 1.2, 0]}>
      <boxGeometry args={[2.52, 2.42, 0.05]} />
      <meshStandardMaterial color={color} metalness={0.5} />
    </mesh>
    {/* Flower shelves inside */}
    {[0.4, 0.85, 1.3].map((y, i) => (
      <mesh key={i} position={[0, y, -0.3]}>
        <boxGeometry args={[2.2, 0.04, 1.6]} />
        <meshStandardMaterial color="#f1f5f9" transparent opacity={0.8} />
      </mesh>
    ))}
  </group>
);

// ─── BOOKS ────────────────────────

const BookShelfShape = ({ color }) => (
  <group>
    <mesh position={[0, 1.15, 0]} castShadow>
      <boxGeometry args={[1.3, 2.3, 0.38]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
    {[0.2, 0.6, 1.0, 1.4, 1.8].map((y, i) => (
      <group key={i} position={[0, y, 0.18]}>
        {Array.from({ length: 8 }).map((_, j) => (
          <mesh key={j} position={[(j - 3.5) * 0.14, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.28 + Math.random() * 0.1, 0.25]} />
            <meshStandardMaterial color={['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6'][j % 8]} />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

// ─────────────────────────────────────────────
// SHAPE DISPATCHER — maps item type to shape
// ─────────────────────────────────────────────

const ShapeFor = ({ type, color, height }) => {
  switch (type) {
    case 'fridge':        return <FridgeShape color={color} />;
    case 'wall_shelf':    return <ShelfShape color={color} height={height} />;
    case 'counter':       return <CounterShape color={color} />;
    case 'island_shelf':  return <ShelfShape color={color} height={1.4} />;
    case 'produce':       return <ShelfShape color={color} height={1.4} />;
    case 'chest_freezer': return <FridgeShape color={color} />;
    case 'mannequin':     return <ManekenShape color={color} />;
    case 'clothing_rack': return <ClothingRackShape color={color} />;
    case 'center_rack':   return <ClothingRackShape color={color} />;
    case 'shoe_shelf':    return <ShelfShape color={color} height={1.8} />;
    case 'fitting_room':  return <FittingRoomShape color={color} />;
    case 'treadmill':     return <TreadmillShape color={color} />;
    case 'bike':          return <BikeShape color={color} />;
    case 'bench':         return <BenchShape color={color} />;
    case 'crossover':     return <CrossoverShape color={color} />;
    case 'dumbbell_rack': return <DumbbellRackShape color={color} />;
    case 'lockers':       return <LockerShape color={color} />;
    case 'table':         return <MakeupTableShape color={color} />;
    case 'tv_wall':       return <TVWallShape color={color} />;
    case 'seating':       return <SeatingShape color={color} />;
    case 'sofa':          return <SofaShape color={color} />;
    case 'drawer':        return <DrawerRackShape color={color} />;
    case 'tire_stand':    return <TireStandShape color={color} />;
    case 'oil_display':   return <OilDisplayShape color={color} />;
    case 'flower_stand':  return <FlowerStandShape color={color} />;
    case 'cold_room':     return <ColdRoomShape color={color} />;
    case 'demo_table':    return <DemoTableShape color={color} />;
    case 'coffee_bar':    return <CoffeeBarShape color={color} />;
    case 'book_shelf':    return <BookShelfShape color={color} />;
    case 'island_shelf':  return <SpinnerRackShape color={color} />;
    case 'stationery':    return <SpinnerRackShape color={color} />;
    case 'read_table':    return <ReaderTableShape color={color} />;
    default:              return <ShelfShape color={color} height={height || 2.0} />;
  }
};

// ─────────────────────────────────────────────
// DRAGGABLE EQUIPMENT ITEM
// ─────────────────────────────────────────────

// ─── AABB Collision Helper ─────────────────────────────────────────────────
const getEffectiveDims = (w, d, rotAngle) => {
  const rotStep = Math.round(rotAngle / (Math.PI / 2)) % 4;
  const swapped = rotStep === 1 || rotStep === 3;
  return { ew: swapped ? d : w, ed: swapped ? w : d };
};

const checkCollision = (ax, az, aw, ad, bx, bz, bw, bd, gap = 0.05) => {
  return (
    Math.abs(ax - bx) < (aw + bw) / 2 + gap &&
    Math.abs(az - bz) < (ad + bd) / 2 + gap
  );
};

const resolveCollision = (newPos, selfW, selfD, others) => {
  const MAX_ITERS = 6;
  let x = newPos.x;
  let z = newPos.z;
  for (let iter = 0; iter < MAX_ITERS; iter++) {
    let moved = false;
    for (const other of others) {
      const overlapX = (selfW + other.ew) / 2 + 0.05 - Math.abs(x - other.x);
      const overlapZ = (selfD + other.ed) / 2 + 0.05 - Math.abs(z - other.z);
      if (overlapX > 0 && overlapZ > 0) {
        // Push out along the smaller overlap axis
        if (overlapX < overlapZ) {
          x += x >= other.x ? overlapX : -overlapX;
        } else {
          z += z >= other.z ? overlapZ : -overlapZ;
        }
        moved = true;
      }
    }
    if (!moved) break;
  }
  return { x, z };
};

const DraggableEquipment = ({
  item, position, id, rotation,
  onDragStart, onDragEnd, onPositionChange,
  isSelected, onSelect, onRotate, onDelete,
  roomW, roomL,
  allPositions, allItems
}) => {
  const { gl, raycaster } = useThree();
  const meshRef = useRef();
  const isDragging = useRef(false);
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const dragOffset = useRef(new THREE.Vector3());
  const posRef = useRef(new THREE.Vector3(...position));

  // posRef ni prop o'zgarganda yangilab turish (shablon qo'llanilganda)
  React.useEffect(() => {
    if (!isDragging.current) {
      posRef.current.set(...position);
      if (meshRef.current) {
        meshRef.current.position.set(...position);
      }
    }
  }, [position[0], position[1], position[2]]);

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    isDragging.current = true;
    onDragStart();
    onSelect(id);
    gl.domElement.style.cursor = 'grabbing';

    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane, intersection);
    dragOffset.current.copy(intersection).sub(posRef.current);
  }, [id, onDragStart, onSelect, gl, raycaster, dragPlane]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane, intersection);
    const newPos = intersection.clone().sub(dragOffset.current);
    newPos.y = 0;

    // ── Rotation hisobga olingan o'lchamlar ──
    const { ew: effectiveW, ed: effectiveD } = getEffectiveDims(
      item.width || 1.0, item.depth || 1.0, rotation
    );
    const hw = effectiveW / 2;
    const hd = effectiveD / 2;
    const margin = 0.05;

    // ── Xona chegarasida ushlab turish ──
    newPos.x = Math.max(-roomW / 2 + hw + margin, Math.min(roomW / 2 - hw - margin, newPos.x));
    newPos.z = Math.max(-roomL / 2 + hd + margin, Math.min(roomL / 2 - hd - margin, newPos.z));

    // ── Collision detection: boshqa elementlar bilan to'qnashmasligi ──
    const others = allItems
      .filter(({ uid }) => uid !== id)
      .map(({ uid, item: otherItem, rotAngle }) => {
        const pos = allPositions[uid] || [0, 0, 0];
        const { ew, ed } = getEffectiveDims(otherItem.width || 1.0, otherItem.depth || 1.0, rotAngle);
        return { x: pos[0], z: pos[2], ew, ed };
      });

    const resolved = resolveCollision(
      { x: newPos.x, z: newPos.z },
      effectiveW, effectiveD,
      others
    );

    // Chegaradan chiqib ketmaslik (collision resolve dan keyin)
    newPos.x = Math.max(-roomW / 2 + hw + margin, Math.min(roomW / 2 - hw - margin, resolved.x));
    newPos.z = Math.max(-roomL / 2 + hd + margin, Math.min(roomL / 2 - hd - margin, resolved.z));

    posRef.current.copy(newPos);
    if (meshRef.current) {
      meshRef.current.position.copy(newPos);
    }
  }, [raycaster, dragPlane, item, roomW, roomL, rotation, allPositions, allItems, id]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    e.target.releasePointerCapture(e.pointerId);
    isDragging.current = false;
    onDragEnd();
    gl.domElement.style.cursor = 'auto';
    onPositionChange(id, [posRef.current.x, 0, posRef.current.z]);
  }, [id, onDragEnd, onPositionChange, gl]);

  const floatY = (item.height || 2.0) + 0.6;

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={[0, rotation || 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <ShapeFor type={item.type} color={item.color} height={item.height} />

      {/* Selection Highlight */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]}>
          <planeGeometry args={[item.width + 0.3, item.depth + 0.3]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.22} />
        </mesh>
      )}

      {/* Floating action panel — only when selected */}
      {isSelected && (
        <Html
          position={[0, floatY, 0]}
          center
          distanceFactor={8}
          style={{ pointerEvents: 'auto' }}
        >
          <div style={{
            display: 'flex',
            gap: '6px',
            background: 'rgba(255,255,255,0.97)',
            borderRadius: '40px',
            padding: '5px 10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
            border: '1.5px solid #e2e8f0',
            whiteSpace: 'nowrap',
            userSelect: 'none'
          }}>
            {/* Rotate button */}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onRotate(id); }}
              title="90° ga aylantirish"
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1.5px solid #3b82f6',
                background: '#eff6ff',
                color: '#1d4ed8',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <span style={{ fontSize: '15px' }}>🔄</span> Aylantir
            </button>

            {/* Delete button */}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(id); }}
              title="Olib tashlash"
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1.5px solid #e11d48',
                background: '#fff1f2',
                color: '#be123c',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <span style={{ fontSize: '15px' }}>🗑️</span> O'chir
            </button>
          </div>
        </Html>
      )}
    </group>
  );
};

// ─────────────────────────────────────────────
// ROOM SCENE
// ─────────────────────────────────────────────

const RoomScene = ({ isDragging, setIsDragging }) => {
  const {
    roomDimensions,
    equipmentList,
    viewMode,
    updateEquipmentCount,
    positions,
    setPositions,
    rotations,
    setRotations
  } = useAppStore();
  const { width: W, length: L, height: H } = roomDimensions;
  const [selectedId, setSelectedId] = useState(null);

  const initialPositions = useMemo(() => {
    const map = {};
    let curX = -W / 2 + 1.2;
    let curZ = -L / 2 + 1.2;
    const padding = 0.5;

    equipmentList.forEach((item) => {
      for (let i = 0; i < item.count; i++) {
        const uid = `${item.id}_${i}`;
        if (!(uid in positions)) {
          if (curX + item.width / 2 > W / 2 - 0.8) {
            curX = -W / 2 + 1.2;
            curZ += (item.depth || 1.0) + 1.2;
          }
          if (curZ + (item.depth || 1.0) / 2 <= L / 2 - 0.8) {
            map[uid] = [curX + item.width / 2, 0, curZ + (item.depth || 1.0) / 2];
            curX += item.width + padding;
          }
        }
      }
    });
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipmentList, W, L, positions]);

  const getPos = (uid) => positions[uid] || initialPositions[uid] || [0, 0, 0];

  const handlePositionChange = useCallback((uid, newPos) => {
    setPositions({ ...positions, [uid]: newPos });
  }, [positions, setPositions]);

  // 90° qadam bilan aylantirish
  const handleRotate = useCallback((uid) => {
    const current = rotations[uid] || 0;
    setRotations({ ...rotations, [uid]: (current + 1) % 4 });
  }, [rotations, setRotations]);

  // Elementni olib tashlash va uning pozitsiyalarini tartiblash
  const handleDelete = useCallback((uid) => {
    const itemId = uid.substring(0, uid.lastIndexOf('_'));
    const index = parseInt(uid.substring(uid.lastIndexOf('_') + 1), 10);
    
    const item = equipmentList.find(e => e.id === itemId);
    if (!item) return;
    
    const count = item.count;
    
    // Pozitsiyalarni siljitish
    const nextPositions = { ...positions };
    for (let i = index; i < count - 1; i++) {
      const currentUid = `${itemId}_${i}`;
      const nextUid = `${itemId}_${i + 1}`;
      if (nextUid in nextPositions) {
        nextPositions[currentUid] = nextPositions[nextUid];
      } else if (initialPositions[nextUid]) {
        nextPositions[currentUid] = initialPositions[nextUid];
      }
    }
    delete nextPositions[`${itemId}_${count - 1}`];
    setPositions(nextPositions);

    // Burilish burchaklarini siljitish
    const nextRotations = { ...rotations };
    for (let i = index; i < count - 1; i++) {
      const currentUid = `${itemId}_${i}`;
      const nextUid = `${itemId}_${i + 1}`;
      nextRotations[currentUid] = nextRotations[nextUid] || 0;
    }
    delete nextRotations[`${itemId}_${count - 1}`];
    setRotations(nextRotations);

    // Store dagi sonini kamaytirish
    updateEquipmentCount(itemId, -1);
    setSelectedId(null);
  }, [equipmentList, initialPositions, updateEquipmentCount, positions, rotations, setPositions, setRotations]);

  // Fon bosilganda selection tushsin
  const handleMissed = useCallback(() => {
    setSelectedId(null);
  }, []);

  const placedItems = useMemo(() => {
    const result = [];
    equipmentList.forEach((item) => {
      for (let i = 0; i < item.count; i++) {
        result.push({ uid: `${item.id}_${i}`, item });
      }
    });
    return result;
  }, [equipmentList]);

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[12, 18, 14]} intensity={1.0} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[0, H - 0.5, 0]} intensity={0.6} color="#dbeafe" />

      {/* Floor — klik bo'sh joyga tushganda selection olib tashlanadi */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onPointerDown={handleMissed}
      >
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>

      {/* Floor Grid */}
      <Grid
        position={[0, 0.01, 0]}
        args={[W, L]}
        cellSize={1}
        cellThickness={0.8}
        cellColor="#e2e8f0"
        sectionSize={5}
        sectionThickness={1.2}
        sectionColor="#c7d2fe"
        fadeDistance={60}
      />

      {/* Room Walls */}
      <mesh position={[0, H / 2, -L / 2]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#f1f5f9" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-W / 2, H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[L, H]} />
        <meshStandardMaterial color="#f1f5f9" side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[L, H]} />
        <meshStandardMaterial color="#f1f5f9" side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>

      {/* Room Edge Lines (baseboard) */}
      {[[-W / 2, 0, 0], [W / 2, 0, 0], [0, 0, -L / 2], [0, 0, L / 2]].map(([x, y, z], i) => {
        const isX = i < 2;
        return (
          <mesh key={i} position={[x, 0.05, z]}>
            <boxGeometry args={isX ? [0.05, 0.1, L] : [W, 0.1, 0.05]} />
            <meshStandardMaterial color="#2563eb" transparent opacity={0.5} />
          </mesh>
        );
      })}

      {/* Equipment Items (Draggable) */}
      {placedItems.map(({ uid, item }) => {
        const pos = getPos(uid);
        if (!pos || pos.length < 3) return null;
        const rotStep = rotations[uid] || 0;
        const rotAngle = rotStep * (Math.PI / 2);

        // allItems: collision uchun barcha boshqa elementlarning pozitsiyalari va o'lchamlari
        const allItemsForCollision = placedItems.map(({ uid: u, item: it }) => ({
          uid: u,
          item: it,
          rotAngle: (rotations[u] || 0) * (Math.PI / 2)
        }));

        // allPositions: har bir uid uchun joriy pozitsiya
        const allPositionsForCollision = {};
        placedItems.forEach(({ uid: u }) => {
          allPositionsForCollision[u] = getPos(u);
        });

        return (
          <DraggableEquipment
            key={uid}
            id={uid}
            item={item}
            position={pos}
            rotation={rotAngle}
            isSelected={selectedId === uid}
            onSelect={setSelectedId}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            onPositionChange={handlePositionChange}
            onRotate={handleRotate}
            onDelete={handleDelete}
            roomW={W}
            roomL={L}
            allPositions={allPositionsForCollision}
            allItems={allItemsForCollision}
          />
        );
      })}

      {/* Orbit Controls — disabled while dragging */}
      <OrbitControls
        enabled={!isDragging}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={viewMode === 'top2d' ? 0.01 : Math.PI / 2 - 0.04}
        minPolarAngle={viewMode === 'top2d' ? 0.01 : 0.1}
        target={[0, 1, 0]}
      />
    </>
  );
};

// ─────────────────────────────────────────────
// EXPORT: RoomCanvas
// ─────────────────────────────────────────────

export const RoomCanvas = () => {
  const { viewMode } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="viewport-container">
      <Canvas
        shadows
        camera={{
          position: viewMode === 'top2d' ? [0, 25, 0.01] : [14, 12, 18],
          fov: 42
        }}
        onPointerMissed={() => {}}
      >
        <RoomScene isDragging={isDragging} setIsDragging={setIsDragging} />
      </Canvas>
      {/* Drag hint */}
      <div style={{
        position: 'absolute',
        bottom: '1.25rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        padding: '6px 16px',
        borderRadius: '99px',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: '#475569',
        border: '1px solid #e2e8f0',
        pointerEvents: 'none',
        whiteSpace: 'nowrap'
      }}>
        🖱️ Jihozni bosib ushlab suring — o'rningini o'zgartiring
      </div>
    </div>
  );
};