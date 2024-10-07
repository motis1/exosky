import type { ExoplanetData } from "@/lib/exoplanet";
import { useState } from "react";
import DetailTable from "./DetailTable";
import { ExoplanetViewer } from "./ExoplanetViewer";

export function Main() {
    const [selectedExoplanet, setSelectedExoplanet] =
        useState<ExoplanetData | null>(null);

    return (
        <div className="relative w-screen h-screen">
            <ExoplanetViewer setSelectedExoplanet={setSelectedExoplanet} />

            <div className="absolute top-4 left-4 z-10 pointer-events-auto">
                {selectedExoplanet !== null && (
                    <DetailTable data={selectedExoplanet} />
                )}
            </div>
        </div>
    );
}
