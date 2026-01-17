import type { LocalDataSnapshot } from "../contracts/agentTypes";
import type { SnapshotStore } from "./snapshotStore";
import { loadLocalSnapshot, saveLocalSnapshot } from "./localStore";

export class LocalFileStore implements SnapshotStore {
  constructor(private readonly storeDir: string) {}

  async load(_userId: string): Promise<LocalDataSnapshot | null> {
    return loadLocalSnapshot(this.storeDir);
  }

  async save(_userId: string, snapshot: LocalDataSnapshot): Promise<void> {
    await saveLocalSnapshot(this.storeDir, snapshot);
  }
}
