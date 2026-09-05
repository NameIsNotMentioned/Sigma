import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles, Compass, MapPin } from 'lucide-react';

interface DestinationNode {
  id: string;
  name: string;
  category: string;
  day: string;
  position: [number, number, number];
  color: string;
  tag: string;
}

// Helper to create curved bezier 3D points elevated above sphere
function createArcPoints(p1: [number, number, number], p2: [number, number, number], segments = 24): THREE.Vector3[] {
  const v1 = new THREE.Vector3(...p1);
  const v2 = new THREE.Vector3(...p2);
  const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
  // Elevate midpoint outward
  mid.normalize().multiplyScalar(1.9);

  const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
  return curve.getPoints(segments);
}

// 3D Route Line Component
const RouteCurve: React.FC<{
  p1: [number, number, number];
  p2: [number, number, number];
  highlighted: boolean;
}> = ({ p1, p2, highlighted }) => {
  const points = useMemo(() => createArcPoints(p1, p2), [p1, p2]);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <primitive object={new THREE.Line(
      lineGeometry,
      new THREE.LineBasicMaterial({
        color: highlighted ? 0x00F0FF : 0x4f6b94,
        transparent: true,
        opacity: highlighted ? 0.9 : 0.45,
        linewidth: 2,
      })
    )} />
  );
};

// 3D Destination Node Pin
const SpherePin: React.FC<{
  node: DestinationNode;
  isHovered: boolean;
  onHover: (node: DestinationNode | null) => void;
  onClick: (node: DestinationNode) => void;
}> = ({ node, isHovered, onHover, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = isHovered ? 1.4 + Math.sin(state.clock.elapsedTime * 6) * 0.15 : 1.0;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={node.position}>
      {/* Outer Pulse Ring */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node);
        }}
      >
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isHovered ? 1.5 : 0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Floating Node Label */}
      <Html
        distanceFactor={6}
        position={[0, 0.12, 0]}
        center
        style={{
          pointerEvents: 'none',
          transition: 'all 0.2s ease',
          opacity: isHovered ? 1 : 0.85,
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <div
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide whitespace-nowrap shadow-lg backdrop-blur-md border ${
            isHovered
              ? 'bg-cyan-950/80 text-cyan-200 border-cyan-400/60 shadow-cyan-500/20'
              : 'bg-slate-900/70 text-slate-200 border-white/10'
          }`}
        >
          {node.tag}
        </div>
      </Html>
    </group>
  );
};

// Main Sphere Scene
const GlobeSphere: React.FC<{
  nodes: DestinationNode[];
  hoveredNode: DestinationNode | null;
  setHoveredNode: (node: DestinationNode | null) => void;
  setSelectedNode: (node: DestinationNode) => void;
  isPaused: boolean;
}> = ({ nodes, hoveredNode, setHoveredNode, setSelectedNode, isPaused }) => {
  const groupRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const activityRoutes = useMemo(() => {
    const nodesByActivity = new Map<string, DestinationNode[]>();
    nodes.forEach((node) => {
      const activityNodes = nodesByActivity.get(node.category) ?? [];
      activityNodes.push(node);
      nodesByActivity.set(node.category, activityNodes);
    });

    return Array.from(nodesByActivity.values()).flatMap((activityNodes) =>
      activityNodes.slice(1).map((node, index) => ({
        from: activityNodes[index],
        to: node,
      })),
    );
  }, [nodes]);

  useFrame((_, delta) => {
    if (groupRef.current && !isPaused) {
      groupRef.current.rotation.y += delta * 0.15;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Glass Sphere */}
      <mesh>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshPhysicalMaterial
          color="#06192e"
          roughness={0.15}
          metalness={0.1}
          transmission={0.7}
          ior={1.35}
          thickness={0.8}
          transparent
          opacity={0.7}
          wireframe={false}
        />
      </mesh>

      {/* Subtle Coordinate Grid Wireframe Rings */}
      <mesh>
        <sphereGeometry args={[1.505, 24, 18]} />
        <meshBasicMaterial
          color="#00f0ff"
          wireframe
          transparent
          opacity={0.07}
        />
      </mesh>

      {/* Outer Atmospheric Glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[1.58, 32, 32]} />
        <meshBasicMaterial
          color="#a78bfa"
          wireframe
          transparent
          opacity={0.03}
        />
      </mesh>

      {activityRoutes.map(({ from, to }) => (
        <RouteCurve
          key={`${from.id}-${to.id}`}
          p1={from.position}
          p2={to.position}
          highlighted={hoveredNode?.id === to.id || hoveredNode?.id === from.id}
        />
      ))}

      {/* Destination Nodes */}
      {nodes.map((node) => (
        <SpherePin
          key={node.id}
          node={node}
          isHovered={hoveredNode?.id === node.id}
          onHover={setHoveredNode}
          onClick={setSelectedNode}
        />
      ))}
    </group>
  );
};

// Graceful 2D Fallback when WebGL is unavailable or reduced-motion requested
const Fallback2DView: React.FC<{
  nodes: DestinationNode[];
  onSelectNode: (node: DestinationNode) => void;
}> = ({ nodes, onSelectNode }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-center mb-4">
        <Compass className="w-10 h-10 text-cyan-400" />
      </div>
      <h4 className="text-sm font-semibold text-slate-200 mb-1">Goa Coastal Expedition Map</h4>
      <p className="text-xs text-slate-400 mb-4 max-w-xs">
        Active expenses currently tracked for this trip.
      </p>
      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
        {nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => onSelectNode(node)}
            className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/50 text-left transition-all text-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="truncate">
              <div className="font-medium text-slate-200 truncate">{node.tag}</div>
              <div className="text-[10px] text-slate-400">{node.day}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export const TripSphere: React.FC<{
  destination?: string;
  expenses?: Array<{
    id: string;
    title: string;
    category: string;
    date: string;
    amount: number;
    vendor?: string;
  }>;
  itinerary?: Array<{
    id: string;
    title: string;
    category: string;
    date: string;
    vendor?: string;
  }>;
}> = ({ destination = 'Goa, India', expenses = [], itinerary = [] }) => {
  const [hoveredNode, setHoveredNode] = useState<DestinationNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<DestinationNode | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const activityItems = [
    ...expenses.map((expense) => ({
      ...expense,
      id: `expense-${expense.id}`,
      tag: `${expense.title} · ₹${Math.round(expense.amount).toLocaleString('en-IN')}`,
    })),
    ...itinerary.map((booking) => ({
      ...booking,
      id: `itinerary-${booking.id}`,
      amount: undefined,
      tag: booking.vendor ? `${booking.title} · ${booking.vendor}` : booking.title,
    })),
  ];
  const nodes = activityItems.map((item, index): DestinationNode => {
    const angle = (index / Math.max(activityItems.length, 1)) * Math.PI * 2;
    const latitude = ((index % 3) - 1) * 0.65;
    const radius = Math.cos(latitude) * 1.5;
    const colors = ['#00F0FF', '#A78BFA', '#10B981', '#F59E0B', '#38BDF8'];
    return {
      id: item.id,
      name: item.title,
      category: item.category,
      day: item.date || 'Date not set',
      position: [Math.cos(angle) * radius, Math.sin(latitude) * 1.5, Math.sin(angle) * radius],
      color: colors[index % colors.length],
      tag: item.tag,
    };
  });

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  return (
    <div
      className="relative w-full h-[320px] lg:h-[360px] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-slate-900/60 via-[#07111F]/80 to-[#0A1728]/90 backdrop-blur-xl shadow-2xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header Badge */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[11px] font-medium tracking-wide text-cyan-300">
            3D TRIP SPHERE
          </span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          {expenses.length} expenses • {itinerary.length} itinerary items • {destination}
        </span>
      </div>

      {/* Top Right Controls Hint */}
      <div className="absolute top-3 right-4 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-white/5 text-[10px] text-slate-400 backdrop-blur-sm">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>Drag to rotate • Hover node</span>
      </div>

      {/* 3D Canvas / Fallback */}
      {webglError || prefersReducedMotion ? (
        <Fallback2DView nodes={nodes} onSelectNode={(n) => setSelectedNode(n)} />
      ) : (
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
            Loading 3D Atmosphere...
          </div>
        }>
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 3.8], fov: 45 }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
            }}
            onError={() => setWebglError(true)}
            className="cursor-grab active:cursor-grabbing"
          >
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={1.2} color="#00F0FF" />
            <pointLight position={[-10, -10, -10]} intensity={0.8} color="#A78BFA" />

            <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
              <GlobeSphere
                nodes={nodes}
                hoveredNode={hoveredNode}
                setHoveredNode={setHoveredNode}
                setSelectedNode={setSelectedNode}
                isPaused={isPaused}
              />
            </Float>

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              rotateSpeed={0.6}
              autoRotate={!isPaused}
              autoRotateSpeed={0.8}
            />
          </Canvas>
        </Suspense>
      )}

      {/* Active Selected/Hovered Node Info Card */}
      {(hoveredNode || selectedNode) && (
        <div className="absolute bottom-3 left-4 right-4 z-10 pointer-events-none sm:left-4 sm:right-auto sm:max-w-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-xl text-left pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                {(hoveredNode || selectedNode)?.day}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                {(hoveredNode || selectedNode)?.category}
              </span>
            </div>
            <div className="text-xs font-semibold text-white">
              {(hoveredNode || selectedNode)?.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
