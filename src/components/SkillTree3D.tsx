'use client';

import { useRef, useState, useMemo, Suspense, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float, Sparkles, Line, useCursor } from '@react-three/drei';
import { useStore } from '@/lib/store';
import { skillsData, flattenSkills } from '@/lib/skills';
import { Skill, SkillLevel } from '@/lib/types';
import * as THREE from 'three';

const allSkills = flattenSkills(skillsData);

const levelColors: Record<SkillLevel, THREE.Color> = {
  not_started: new THREE.Color('#525252'),
  learning: new THREE.Color('#3b82f6'),
  mastered: new THREE.Color('#f59e0b'),
  expert: new THREE.Color('#a855f7'),
};

function getInitialPositions() {
  const positions: Record<string, [number, number, number]> = {};
  const levelMap: Record<string, number> = {};
  const parentMap: Record<string, string> = {};

  function calculateLevels(skill: Skill, level: number) {
    levelMap[skill.id] = level;
    skill.children?.forEach((child) => {
      parentMap[child.id] = skill.id;
      calculateLevels(child, level + 1);
    });
  }
  calculateLevels(skillsData[0], 0);

  const groupedByLevel: Record<number, Skill[]> = {};
  allSkills.forEach((skill) => {
    const level = levelMap[skill.id];
    if (!groupedByLevel[level]) groupedByLevel[level] = [];
    groupedByLevel[level].push(skill);
  });

  Object.entries(groupedByLevel).forEach(([level, skillsAtLevel]) => {
    const levelNum = parseInt(level);
    const spread = 3;
    const xOffset = spread * 2;
    const totalWidth = (skillsAtLevel.length - 1) * xOffset;
    const startX = -totalWidth / 2;

    skillsAtLevel.forEach((skill, index) => {
      const zRandom = (Math.random() - 0.5) * 4;
      positions[skill.id] = [
        startX + index * xOffset,
        -levelNum * 2.5,
        zRandom,
      ];
    });
  });

  return positions;
}

type BackgroundType = 'stars' | 'grid' | 'gradient' | 'dark' | 'particles' | 'aurora' | 'moon' | 'nebula' | 'matrix';

function StarBackground() {
  return (
    <>
      <Sparkles count={100} scale={15} size={2} speed={0.3} opacity={0.3} color="#3b82f6" />
      <Sparkles count={50} scale={10} size={1.5} speed={0.2} opacity={0.2} color="#a855f7" />
    </>
  );
}

function AuroraBackground() {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (meshRef.current) {
        const material = meshRef.current.material as THREE.ShaderMaterial;
        if (material && material.uniforms) {
          material.uniforms.uTime.value += 0.01;
        }
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  const auroraShader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        float wave = sin(uv.x * 3.0 + uTime) * 0.5 + 0.5;
        wave += sin(uv.x * 5.0 - uTime * 1.5) * 0.3;
        wave += sin(uv.x * 8.0 + uTime * 0.5) * 0.2;

        vec3 color1 = vec3(0.0, 1.0, 0.5);
        vec3 color2 = vec3(0.2, 0.5, 1.0);
        vec3 color3 = vec3(0.5, 0.0, 1.0);

        vec3 color = mix(color1, color2, wave);
        color = mix(color, color3, sin(wave * 3.14159 + uTime) * 0.5 + 0.5);

        float alpha = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.5, uv.y);
        alpha *= wave * 0.6;

        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  }), []);

  return (
    <>
      <mesh ref={meshRef} position={[0, 3, -15]} scale={[30, 8, 1]}>
        <planeGeometry args={[1, 1, 32, 32]} />
        <shaderMaterial {...auroraShader} />
      </mesh>
      <Sparkles count={80} scale={12} size={1.5} speed={0.2} opacity={0.4} color="#00ff88" />
    </>
  );
}

function MoonBackground() {
  const moonRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (moonRef.current) {
        const time = Date.now() * 0.001;
        moonRef.current.rotation.y = time * 0.1;
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <>
      <mesh ref={moonRef} position={[8, 6, -10]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#e8e4d9"
          emissive="#f5f5dc"
          emissiveIntensity={0.1}
          roughness={0.9}
        />
      </mesh>
      <Sparkles count={150} scale={20} size={1} speed={0.1} opacity={0.5} color="#ffffff" />
      <pointLight position={[8, 6, -10]} intensity={0.5} color="#f5f5dc" />
    </>
  );
}

function NebulaBackground() {
  const nebulaRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (nebulaRef.current) {
        const material = nebulaRef.current.material as THREE.ShaderMaterial;
        if (material && material.uniforms) {
          material.uniforms.uTime.value += 0.005;
        }
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  const nebulaShader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float fbm(vec2 p) {
        float f = 0.0;
        f += 0.5 * noise(p); p *= 2.0;
        f += 0.25 * noise(p); p *= 2.0;
        f += 0.125 * noise(p); p *= 2.0;
        f += 0.0625 * noise(p);
        return f;
      }

      void main() {
        vec2 uv = vUv;
        float t = uTime * 0.2;

        float n = fbm(uv * 3.0 + t);
        n += fbm(uv * 6.0 - t * 0.5) * 0.5;
        n += fbm(uv * 12.0 + t * 0.25) * 0.25;

        vec3 color1 = vec3(0.9, 0.1, 0.3);
        vec3 color2 = vec3(0.1, 0.2, 0.8);
        vec3 color3 = vec3(0.6, 0.0, 0.8);

        vec3 color = mix(color1, color2, n);
        color = mix(color, color3, sin(n * 3.14159 + t) * 0.5 + 0.5);

        float alpha = smoothstep(0.2, 0.8, n);

        gl_FragColor = vec4(color, alpha * 0.7);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  }), []);

  return (
    <>
      <mesh ref={nebulaRef} position={[0, 0, -12]} scale={[25, 15, 1]}>
        <planeGeometry args={[1, 1, 64, 64]} />
        <shaderMaterial {...nebulaShader} />
      </mesh>
      <Sparkles count={100} scale={15} size={1.2} speed={0.15} opacity={0.4} color="#ff6b9d" />
      <Sparkles count={60} scale={12} size={0.8} speed={0.1} opacity={0.3} color="#6b9dff" />
    </>
  );
}

function MatrixBackground() {
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';

  return (
    <>
      <Sparkles count={50} scale={10} size={1} speed={0.3} opacity={0.3} color="#00ff00" />
      <ambientLight intensity={0.1} color="#003300" />
      <pointLight position={[0, 5, 5]} intensity={0.3} color="#00ff00" />
    </>
  );
}

function GridBackground() {
  return (
    <gridHelper args={[30, 30, '#1e3a5f', '#0f172a']} position={[0, -10, 0]} rotation={[0, 0, 0]} />
  );
}

function GradientBackground() {
  return (
    <mesh position={[0, 0, -20]} scale={[50, 50, 1]}>
      <planeGeometry />
      <meshBasicMaterial color="#0a0a1a" />
    </mesh>
  );
}

function ParticlesBackground() {
  const particlesRef = useRef<THREE.Points>(null);

  useEffect(() => {
    if (!particlesRef.current) return;
    const positions = (particlesRef.current.geometry as THREE.BufferGeometry).attributes.position;
    const count = positions.count;

    const animate = () => {
      if (!particlesRef.current) return;
      const time = Date.now() * 0.001;
      const pos = particlesRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        pos.setY(i, pos.getY(i) + Math.sin(time + i * 0.1) * 0.002);
      }
      pos.needsUpdate = true;
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, []);

  const particles = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  const positions = useMemo(() => {
    const pos = new Float32Array(particles);
    return pos;
  }, [particles]);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#f5a623" transparent opacity={0.8} />
    </points>
  );
}

function BackgroundScene({ type }: { type: BackgroundType }) {
  return (
    <>
      {type === 'stars' && <StarBackground />}
      {type === 'grid' && <GridBackground />}
      {type === 'gradient' && <GradientBackground />}
      {type === 'particles' && <ParticlesBackground />}
      {type === 'particles' && <Sparkles count={50} scale={12} size={1} speed={0.1} opacity={0.3} color="#60a5fa" />}
      {type === 'aurora' && <AuroraBackground />}
      {type === 'moon' && <MoonBackground />}
      {type === 'nebula' && <NebulaBackground />}
      {type === 'matrix' && <MatrixBackground />}
      {type === 'dark' && null}
    </>
  );
}

function SceneContent({ onSkillClick, backgroundType }: { onSkillClick: (skillId: string) => void; backgroundType: BackgroundType }) {
  const controlsRef = useRef<any>(null);
  const { gl } = useThree();

  const userSkills = useStore((state) => state.userSkills);
  const nodePositions = useStore((state) => state.nodePositions);
  const setNodePositions = useStore((state) => state.setNodePositions);
  const updateNodePosition = useStore((state) => state.updateNodePosition);

  const initialPositions = useMemo(() => getInitialPositions(), []);

  useEffect(() => {
    if (Object.keys(useStore.getState().nodePositions).length === 0) {
      setNodePositions(initialPositions);
    }
  }, [initialPositions, setNodePositions]);

  useEffect(() => {
    const handlePointerUp = () => {
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    };
    gl.domElement.addEventListener('pointerup', handlePointerUp);
    return () => gl.domElement.removeEventListener('pointerup', handlePointerUp);
  }, [gl]);

  const connections = useMemo(() => {
    const result: { start: string; end: string }[] = [];
    const parentMap: Record<string, string> = {};

    function buildParentMap(skill: Skill) {
      skill.children?.forEach((child) => {
        parentMap[child.id] = skill.id;
        buildParentMap(child);
      });
    }
    buildParentMap(skillsData[0]);

    allSkills.forEach((skill) => {
      if (parentMap[skill.id]) {
        result.push({
          start: parentMap[skill.id],
          end: skill.id,
        });
      }
    });

    return result;
  }, []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

      <BackgroundScene type={backgroundType} />

      {allSkills.map((skill) => (
        <DraggableNode
          key={skill.id}
          skill={skill}
          onClick={onSkillClick}
          onDragStart={() => {
            if (controlsRef.current) {
              controlsRef.current.enabled = false;
            }
          }}
        />
      ))}

      {connections.map((conn, i) => (
        <Connection3D key={i} startSkillId={conn.start} endSkillId={conn.end} />
      ))}

      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={25}
        dampingFactor={0.05}
        enableDamping
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />
    </>
  );
}

function DraggableNode({
  skill,
  onClick,
  onDragStart,
}: {
  skill: Skill;
  onClick: (skillId: string) => void;
  onDragStart: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl, raycaster } = useThree();

  const userSkill = useStore((state) => state.userSkills[skill.id]);
  const nodePositions = useStore((state) => state.nodePositions);
  const updateNodePosition = useStore((state) => state.updateNodePosition);

  const level = userSkill?.level || 'not_started';
  const color = levelColors[level];
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const initialPositions = useMemo(() => getInitialPositions(), []);
  const currentPos = nodePositions[skill.id] || initialPositions[skill.id] || [0, 0, 0];

  useCursor(hovered && !isDragging, 'grab', 'auto');

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const intersection = useMemo(() => new THREE.Vector3(), []);
  const offset = useRef(new THREE.Vector3());
  const moved = useRef(false);

  const getCanvasCoords = useCallback((e: PointerEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    return new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
  }, [gl]);

  const handlePointerDown = useCallback((e: any) => {
    e.stopPropagation();
    moved.current = false;

    const mouse = getCanvasCoords(e);
    raycaster.setFromCamera(mouse, camera);

    if (meshRef.current) {
      const intersects = raycaster.intersectObject(meshRef.current);
      if (intersects.length > 0) {
        raycaster.ray.intersectPlane(plane, offset.current);
        offset.current.sub(new THREE.Vector3(...currentPos));
        setIsDragging(true);
        onDragStart();
      }
    }
  }, [camera, raycaster, plane, currentPos, getCanvasCoords, onDragStart]);

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (!moved.current) {
        onClick(skill.id);
      }
    }
  }, [isDragging, onClick, skill.id]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;

    moved.current = true;

    const mouse = getCanvasCoords(e);
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, intersection);

    intersection.sub(offset.current);

    const newPos: [number, number, number] = [
      intersection.x,
      intersection.y,
      currentPos[2]
    ];

    updateNodePosition(skill.id, newPos);
  }, [isDragging, camera, raycaster, plane, currentPos, skill.id, updateNodePosition, getCanvasCoords]);

  useEffect(() => {
    const dom = gl.domElement;
    dom.addEventListener('pointermove', handlePointerMove);
    dom.addEventListener('pointerup', handlePointerUp);

    return () => {
      dom.removeEventListener('pointermove', handlePointerMove);
      dom.removeEventListener('pointerup', handlePointerUp);
    };
  }, [gl, handlePointerMove, handlePointerUp]);

  return (
    <Float speed={isDragging ? 0 : 2} rotationIntensity={0.2} floatIntensity={isDragging ? 0 : 0.5}>
      <group
        ref={groupRef}
        position={currentPos}
        onPointerDown={handlePointerDown}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[0.6, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.8 : 0.4}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {level !== 'not_started' && (
          <mesh scale={1.3}>
            <icosahedronGeometry args={[0.6, 1]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.15}
              wireframe
            />
          </mesh>
        )}
        <Text
          position={[0, -1, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {skill.name}
        </Text>
      </group>
    </Float>
  );
}

function Connection3D({
  startSkillId,
  endSkillId
}: {
  startSkillId: string;
  endSkillId: string;
}) {
  const nodePositions = useStore((state) => state.nodePositions);
  const userSkills = useStore((state) => state.userSkills);

  const initialPositions = useMemo(() => getInitialPositions(), []);

  const startPos = nodePositions[startSkillId] || initialPositions[startSkillId] || [0, 0, 0];
  const endPos = nodePositions[endSkillId] || initialPositions[endSkillId] || [0, 0, 0];

  const targetLevel = userSkills[endSkillId]?.level || 'not_started';
  const color = levelColors[targetLevel];

  const points = useMemo(() => {
    const start = startPos;
    const end = endPos;
    const pts = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = start[0] + (end[0] - start[0]) * t;
      const y = start[1] + (end[1] - start[1]) * t;
      const z = start[2] + (end[2] - start[2]) * t;
      const arcHeight = Math.sin(t * Math.PI) * 0.8;
      pts.push(new THREE.Vector3(x, y + arcHeight, z));
    }
    return pts;
  }, [startPos, endPos]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.5}
      transparent
      opacity={0.4}
    />
  );
}

const backgroundOptions: { value: BackgroundType; label: string; icon: string }[] = [
  { value: 'stars', label: '星空', icon: '✨' },
  { value: 'grid', label: '网格', icon: '🔲' },
  { value: 'gradient', label: '渐变', icon: '🌈' },
  { value: 'particles', label: '粒子', icon: '🔵' },
  { value: 'dark', label: '纯黑', icon: '⬛' },
  { value: 'aurora', label: '极光', icon: '🌌' },
  { value: 'moon', label: '月球', icon: '🌙' },
  { value: 'nebula', label: '星云', icon: '🌀' },
  { value: 'matrix', label: '黑客', icon: '💻' },
];

export default function SkillTree3D() {
  const setSelectedSkill = useStore((state) => state.setSelectedSkill);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('stars');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-zinc-400 text-sm">背景:</span>
        {backgroundOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setBackgroundType(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              backgroundType === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      <div className="w-full h-[750px] rounded-xl overflow-hidden relative" style={{ background: backgroundType === 'dark' ? '#000' : backgroundType === 'gradient' ? 'linear-gradient(to bottom, #0a0a1a, #1a1a2e)' : backgroundType === 'grid' ? 'linear-gradient(to bottom, #0f172a, #1e293b)' : backgroundType === 'particles' ? 'linear-gradient(to bottom, #0a0a1a, #0f172a)' : backgroundType === 'aurora' ? 'linear-gradient(to bottom, #001020, #002030)' : backgroundType === 'moon' ? 'linear-gradient(to bottom, #0a0a15, #1a1a2e)' : backgroundType === 'nebula' ? 'linear-gradient(to bottom, #0a0510, #150a20)' : backgroundType === 'matrix' ? 'linear-gradient(to bottom, #001100, #000000)' : undefined }}>
        <div className={`absolute inset-0 transition-opacity duration-500 ${backgroundType === 'dark' ? 'opacity-0' : 'bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15),_transparent_70%)]'}`} />
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
            Loading 3D...
          </div>
        }>
          <Canvas
            camera={{ position: [0, 2, 14], fov: 60 }}
            style={{ background: 'transparent' }}
          >
            <color attach="background" args={[backgroundType === 'dark' ? '#000000' : backgroundType === 'gradient' ? '#0a0a1a' : backgroundType === 'grid' ? '#0f172a' : backgroundType === 'particles' ? '#0a0a1a' : backgroundType === 'aurora' ? '#001020' : backgroundType === 'moon' ? '#0a0a15' : backgroundType === 'nebula' ? '#0a0510' : backgroundType === 'matrix' ? '#001100' : '#09090b']} />
            <SceneContent onSkillClick={setSelectedSkill} backgroundType={backgroundType} />
          </Canvas>
        </Suspense>
        <div className="absolute bottom-4 left-4 text-zinc-500 text-xs">
          左键拖拽节点 · 右键平移 · 滚轮缩放 · 点击节点查看详情
        </div>
      </div>
    </div>
  );
}
