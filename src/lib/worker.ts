import { exoplanets } from "../drizzle/schema";
import { getDatabaseClient } from "./db";

const client = await getDatabaseClient();

self.postMessage(await client.select().from(exoplanets).limit(500));
