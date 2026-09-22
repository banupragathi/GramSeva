"use client";

import dynamic from "next/dynamic";

// Dynamically import the map canvas component exclusively on the client-side
// to circumvent MapLibre-GL WebGL context strict dependency on NextJS 15 SSR environments.
const MapWorkspaceClient = dynamic(() => import("@/components/MapWorkspace"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 w-full h-full bg-surface-card flex items-center justify-center">
      <div className="absolute inset-0 bg-surface flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3 mx-auto" />
          <span className="text-sm text-neutral-dark font-medium">Booting Map Engine...</span>
        </div>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return <MapWorkspaceClient />;
}
