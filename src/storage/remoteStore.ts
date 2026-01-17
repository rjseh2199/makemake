import type { LocalDataSnapshot } from "../contracts/agentTypes";

export type RemoteStoreConfig = {
  baseUrl: string;
  authToken: string;
  userId?: string;
};

export const uploadSnapshot = async (
  config: RemoteStoreConfig,
  snapshot: LocalDataSnapshot
): Promise<void> => {
  const response = await fetch(`${config.baseUrl}/snapshot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.authToken}`
    },
    body: JSON.stringify({ userId: config.userId, snapshot })
  });

  if (!response.ok) {
    throw new Error(
      `Remote sync upload failed with status ${response.status}`
    );
  }
};

export const downloadSnapshot = async (
  config: RemoteStoreConfig
): Promise<LocalDataSnapshot> => {
  const query = config.userId ? `?userId=${encodeURIComponent(config.userId)}` : "";
  const response = await fetch(`${config.baseUrl}/snapshot${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.authToken}`
    }
  });

  if (!response.ok) {
    throw new Error(
      `Remote sync download failed with status ${response.status}`
    );
  }

  return (await response.json()) as LocalDataSnapshot;
};
