import type { LocalDataSnapshot } from "../contracts/agentTypes";
import type { SnapshotStore } from "./snapshotStore";
import { downloadSnapshot, uploadSnapshot } from "./remoteStore";

export class RemoteHttpStore implements SnapshotStore {
  constructor(
    private readonly baseUrl: string,
    private readonly authToken: string
  ) {}

  async load(userId: string): Promise<LocalDataSnapshot | null> {
    return downloadSnapshot({ baseUrl: this.baseUrl, authToken: this.authToken, userId });
  }

  async save(userId: string, snapshot: LocalDataSnapshot): Promise<void> {
    await uploadSnapshot(
      { baseUrl: this.baseUrl, authToken: this.authToken, userId },
      snapshot
    );
  }
}
