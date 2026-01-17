import type { LocalDataSnapshot } from "../contracts/agentTypes";

export interface SnapshotStore {
  load(userId: string): Promise<LocalDataSnapshot | null>;
  save(userId: string, snapshot: LocalDataSnapshot): Promise<void>;
}
