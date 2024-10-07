import type { ExoplanetData } from "@/lib/exoplanet";
import { Billboard, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Simple global backdrop component
function Backdrop() {
    return (
        <mesh>
            <meshBasicMaterial color="black" side={THREE.BackSide} />
        </mesh>
    );
}

// Earth component at the center
function Earth() {
    return (
        <mesh>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="green" />
            <Billboard>
                <Text fontSize={0.5} color="white" position={[0, 1.5, 0]}>
                    Earth
                </Text>
            </Billboard>
        </mesh>
    );
}

interface OrbitingExoplanetProps {
    planetData: ExoplanetData;
    orbitRadius: number;
    selected: boolean;
    onClick: (planet: ExoplanetData, position: THREE.Vector3) => void;
}

function OrbitingExoplanet({
    planetData,
    orbitRadius,
    selected,
    onClick
}: OrbitingExoplanetProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const angleRef = useRef(Math.random() * Math.PI * 2);

    // Compute angular speed based on orbital period
    let orbitalPeriod = Number(planetData.plOrbper);
    if (!orbitalPeriod || orbitalPeriod <= 0) {
        orbitalPeriod = 365; // Default to 1 Earth year if undefined or invalid
    }

    // Normalize the orbital period using logarithmic scaling
    const minPeriod = 1; // Minimum orbital period in days
    const maxPeriod = 1000; // Maximum orbital period in days
    orbitalPeriod = Math.max(minPeriod, Math.min(orbitalPeriod, maxPeriod));
    const normalizedPeriod = Math.log10(orbitalPeriod);

    // Compute angular speed using the normalized period
    const maxAngularSpeed = 0.05;
    const minAngularSpeed = 0.005;
    const angularSpeed =
        maxAngularSpeed -
        (normalizedPeriod / Math.log10(maxPeriod)) *
            (maxAngularSpeed - minAngularSpeed);

    // Generate a random color per planet
    const color = useMemo(
        () => new THREE.Color(Math.random(), Math.random(), Math.random()),
        []
    );

    useFrame((_, delta) => {
        angleRef.current += angularSpeed * delta;

        const x = orbitRadius * Math.cos(angleRef.current);
        const z = orbitRadius * Math.sin(angleRef.current);

        if (meshRef.current) {
            meshRef.current.position.set(x, 0, z);
            meshRef.current.rotation.y += 0.01;
        }
    });

    const radius = Number(planetData.plRade) / 2 || 0.5; // Default radius if undefined

    return (
        <mesh
            ref={meshRef}
            onClick={() =>
                meshRef.current &&
                onClick(planetData, meshRef.current.position.clone())
            }
        >
            <sphereGeometry args={[radius, 32, 32]} />
            <meshStandardMaterial
                color={color}
                emissive={selected ? color : "black"}
                emissiveIntensity={selected ? 2 : 0}
            />
            <Billboard>
                <Text
                    fontSize={1.5}
                    color="white"
                    position={[0, radius + 0.5, 0]}
                >
                    {planetData.plName}
                </Text>
            </Billboard>
        </mesh>
    );
}

interface CameraControllerProps {
    targetPosition: THREE.Vector3 | null;
    controlsRef: React.RefObject<any>;
    planetRadius: number;
}

function CameraController({
    targetPosition,
    controlsRef,
    planetRadius
}: CameraControllerProps) {
    const { camera } = useThree();
    const isTransitioning = useRef(false);
    const desiredPosition = useRef(new THREE.Vector3());
    const desiredTarget = useRef(new THREE.Vector3());
    const userIsInteracting = useRef(false);

    useEffect(() => {
        if (targetPosition) {
            desiredTarget.current.copy(targetPosition);
            desiredPosition.current
                .copy(targetPosition)
                .add(new THREE.Vector3(0, 0, planetRadius * 5));
        } else {
            desiredTarget.current.set(0, 0, 0);
            desiredPosition.current.set(0, 0, 20);
        }
        isTransitioning.current = true;
    }, [targetPosition, planetRadius]);

    useFrame(() => {
        if (isTransitioning.current && !userIsInteracting.current) {
            camera.position.lerp(desiredPosition.current, 0.1);
            if (controlsRef.current) {
                controlsRef.current.target.lerp(desiredTarget.current, 0.1);
                controlsRef.current.update();
            }

            const positionDiff = camera.position.distanceTo(
                desiredPosition.current
            );
            const targetDiff =
                controlsRef.current?.target.distanceTo(desiredTarget.current) ||
                0;

            if (positionDiff < 0.01 && targetDiff < 0.01) {
                isTransitioning.current = false;
            }
        }
    });

    // Event handlers to detect user interaction
    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) return;

        const onStart = () => {
            userIsInteracting.current = true;
        };

        const onEnd = () => {
            userIsInteracting.current = false;
        };

        controls.addEventListener("start", onStart);
        controls.addEventListener("end", onEnd);

        // Clean up event listeners on unmount
        return () => {
            controls.removeEventListener("start", onStart);
            controls.removeEventListener("end", onEnd);
        };
    }, [controlsRef]);

    return null;
}

interface ExoplanetViewerProps {
    setSelectedExoplanet: (planet: ExoplanetData) => void;
}

export function ExoplanetViewer({
    setSelectedExoplanet
}: ExoplanetViewerProps) {
    const [exoplanets, setExoplanets] = useState<ExoplanetData[]>([]);
    const [selectedPlanet, setSelectedPlanet] = useState<ExoplanetData | null>(
        null
    );
    const [selectedPosition, setSelectedPosition] =
        useState<THREE.Vector3 | null>(null);
    const controlsRef = useRef<any>(null);

    useEffect(() => {
        const worker = new Worker(new URL("@/lib/worker.ts", import.meta.url), {
            type: "module"
        });
        worker.onmessage = (event) => {
            setExoplanets(event.data);
        };
        return () => worker.terminate();
    }, []);

    const handlePlanetClick = (
        planet: ExoplanetData,
        position: THREE.Vector3
    ) => {
        setSelectedPlanet(planet);
        setSelectedExoplanet(planet);
        setSelectedPosition(position);
    };

    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
                <Backdrop />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                <Earth />

                {exoplanets.map((planet, index) => (
                    <OrbitingExoplanet
                        key={planet.plName}
                        planetData={planet}
                        orbitRadius={5 + index * 2}
                        selected={selectedPlanet?.plName === planet.plName}
                        onClick={handlePlanetClick}
                    />
                ))}

                <CameraController
                    targetPosition={selectedPosition}
                    controlsRef={controlsRef}
                    planetRadius={
                        selectedPlanet
                            ? Number(selectedPlanet.plRade) / 2 || 0.5
                            : 1
                    }
                />

                <OrbitControls
                    ref={controlsRef}
                    enableDamping
                    dampingFactor={0.05}
                    enablePan
                    enableZoom
                    enableRotate
                />

                <EffectComposer>
                    <Bloom
                        luminanceThreshold={0}
                        luminanceSmoothing={0.9}
                        height={300}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
