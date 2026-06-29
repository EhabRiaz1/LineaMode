"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import * as THREE from "three";
import { cn } from "@/lib/utils";

type CountryFeature = GeoJSON.Feature<GeoJSON.Geometry, { name?: string; highlight?: boolean }>;

const WORLD_GEOJSON_URL =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
const KASHMIR_GEOJSON_URL = "/data/kashmir-highlight.geojson";

const HIGHLIGHT_COLOR = "#c97a5a";
const LAND_COLOR = "rgba(32, 28, 29, 0.04)";
const SIDE_COLOR = "rgba(32, 28, 29, 0.05)";

function isHighlighted(feature: CountryFeature) {
  if (feature.properties?.highlight) return true;
  const name = feature.properties?.name?.toLowerCase() ?? "";
  return name === "pakistan";
}

export function AboutGlobeScene({ className }: { className?: string }) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [polygons, setPolygons] = useState<CountryFeature[]>([]);
  const [dims, setDims] = useState({ width: 480, height: 480 });

  const globeMaterial = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: new THREE.Color("#c2bab0"),
        emissive: new THREE.Color("#ccc4ba"),
        emissiveIntensity: 0.1,
        shininess: 0.1,
      }),
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const syncSize = () => {
      const width = Math.round(container.clientWidth);
      const height = Math.round(container.clientHeight);
      if (width > 0 && height > 0) setDims({ width, height });
    };

    syncSize();
    const observer = new ResizeObserver(syncSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(WORLD_GEOJSON_URL).then((res) => res.json()),
      fetch(KASHMIR_GEOJSON_URL).then((res) => res.json()),
    ])
      .then(([world, kashmir]) => {
        if (cancelled) return;
        const worldFeatures = (world.features ?? []) as CountryFeature[];
        setPolygons([...worldFeatures, kashmir as CountryFeature]);
      })
      .catch(() => {
        if (!cancelled) setPolygons([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const configureGlobe = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.55;
    controls.enableZoom = false;
    controls.enablePan = false;

    globe.pointOfView({ lat: 28, lng: 70, altitude: 1.65 }, 0);
  }, []);

  useEffect(() => {
    if (polygons.length > 0) configureGlobe();
  }, [polygons.length, configureGlobe]);

  const capColor = useMemo(
    () => (feature: object) =>
      isHighlighted(feature as CountryFeature) ? HIGHLIGHT_COLOR : LAND_COLOR,
    [],
  );

  const altitude = useMemo(
    () => (feature: object) => (isHighlighted(feature as CountryFeature) ? 0.055 : 0.008),
    [],
  );

  return (
    <div className="flex w-full justify-center">
      <div
        ref={containerRef}
        className={cn(
          "relative aspect-square w-[80%] overflow-hidden bg-[var(--color-chalk-sand)]",
          className,
        )}
        aria-label="Rotating globe highlighting Pakistan and Kashmir"
      >
      <Globe
        ref={globeRef}
        width={dims.width}
        height={dims.height}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={globeMaterial}
        showGraticules={false}
        showAtmosphere
        atmosphereColor="rgba(194, 186, 176, 0.35)"
        atmosphereAltitude={0.12}
        polygonsData={polygons}
        polygonCapColor={capColor}
        polygonSideColor={() => SIDE_COLOR}
        polygonStrokeColor={() => "rgba(0,0,0,0)"}
        polygonAltitude={altitude}
        onGlobeReady={configureGlobe}
      />
      </div>
    </div>
  );
}
