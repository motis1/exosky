import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";

import * as schema from "../drizzle/schema";
import { DATABASE_URL } from "./constants";

async function fetchDatabase(): Promise<Uint8Array> {
    try {
        const response = await fetch(DATABASE_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        return new Uint8Array(arrayBuffer);
    } catch (error) {
        console.error("Error loading file:", error);
        throw error;
    }
}

export async function getDatabaseClient() {
    const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`
    });

    const databaseData = await fetchDatabase();

    return drizzle(new SQL.Database(databaseData), {
        schema: schema
    });
}
