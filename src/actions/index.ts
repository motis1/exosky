import { defineAction } from "astro:actions";
import { z } from "astro:schema";

import { spawnSync } from "node:child_process";

interface GaiaResponse {
    something: string;
}

export const server = {
    gaiaQuery: defineAction({
        input: z.object({}),
        handler: async (input) => {
            const inputData = { hello: "python" };

            const process = spawnSync("python", ["scripts/gaia.py"], {
                input: JSON.stringify(inputData),
                encoding: "utf-8"
            });

            const result: GaiaResponse = JSON.parse(process.stdout);
            return result;
        }
    })
};
