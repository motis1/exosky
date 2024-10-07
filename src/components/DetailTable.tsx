import type { ExoplanetData } from "@/lib/exoplanet";
import { useTextCycle } from "@/lib/hooks";
import { motion } from "framer-motion";

const NAME_MAP: Partial<Record<keyof ExoplanetData, string>> = {
    plName: "Planet Name",
    plMasse: "Planet Mass (Earth Mass)",
    sySnum: "Number of Stars",
    syPnum: "Number of Planets",
    syMnum: "Number of Moons",
    discYear: "Discovery Year",
    discInstrument: "Discovery Instrument",
    plOrbper: "Orbital Period (days)",
    plRade: "Planet Radius [Earth Radius]",
    plDens: "Planet Density [g/cm³]",
    plOrbeccen: "Eccentricity",
    glat: "Galactic Latitude (deg)",
    glon: "Galactic Longitude (deg)",
    elat: "Ecliptic Latitude (deg)",
    elon: "Ecliptic Longitude (deg)",
    syDist: "Distance from Earth (parsecs)",
    rowupdate: "Date of Last Update"
};

function DetailTableEntry({
    item,
    index
}: {
    item: { key: string; value: string };
    index: number;
}) {
    const displayKey = useTextCycle(item.key);
    const displayValue = useTextCycle(item.value);

    return (
        <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex justify-between items-center p-1 rounded bg-accent bg-opacity-10"
        >
            <span className="text-xs text-muted-foreground">{displayKey}</span>
            <span className="text-xs font-semibold text-accent-foreground">
                {displayValue}
            </span>
        </motion.div>
    );
}

export default function DetailTable({ data }: { data: ExoplanetData | null }) {
    const title = useTextCycle("Exoplanet Data");

    if (data) {
        const displayData = Object.entries(data)
            .filter(([key, value]) => key in NAME_MAP && value)
            .map(([key, value]) => ({
                key: NAME_MAP[key as keyof typeof NAME_MAP],
                value: value as string
            }));

        return (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full p-2 rounded-lg bg-card shadow-md border border-border font-mono"
            >
                <h2 className="text-lg font-bold mb-2 text-center text-primary">
                    {title}
                </h2>
                <div className="grid grid-cols-2 gap-1">
                    {displayData.map((item, index) => (
                        <DetailTableEntry
                            key={item.key}
                            item={item as any}
                            index={index}
                        />
                    ))}
                </div>
            </motion.div>
        );
    } else {
        return <></>;
    }
}
