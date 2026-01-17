import { promises as fs } from "fs";
import path from "path";
import type { LocalDataSnapshot } from "../contracts/agentTypes";

const DEFAULT_SNAPSHOT: LocalDataSnapshot = {
  wardrobeItems: [],
  history: [],
  feedback: [],
  schedule: [],
  conversation: [],
  intent: "daily",
  preferences: {
    color_preference: "mixed",
    fit_preference: "mixed",
    discomfort_avoidance: [],
    novelty_preference: "repeat_ok",
    purchase_opt_in: false
  },
  bodyProfile: {}
};

const getStorePath = (storeDir: string) =>
  path.join(storeDir, "fashion-data.json");

export const loadLocalSnapshot = async (
  storeDir: string
): Promise<LocalDataSnapshot> => {
  try {
    const raw = await fs.readFile(getStorePath(storeDir), "utf-8");
    return JSON.parse(raw) as LocalDataSnapshot;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return DEFAULT_SNAPSHOT;
    }
    throw error;
  }
};

export const saveLocalSnapshot = async (
  storeDir: string,
  snapshot: LocalDataSnapshot
): Promise<void> => {
  await fs.mkdir(storeDir, { recursive: true });
  await fs.writeFile(
    getStorePath(storeDir),
    JSON.stringify(snapshot, null, 2),
    "utf-8"
  );
};
