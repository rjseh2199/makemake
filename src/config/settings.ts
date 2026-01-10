export type AgentSettings = {
  apiKey: string;
  model: string;
  region: string;
  storeDir: string;
  locationConsent: boolean;
  latitude?: number;
  longitude?: number;
  remoteSyncEnabled: boolean;
  remoteBaseUrl?: string;
  remoteAuthToken?: string;
};

export const loadSettings = (overrides?: Partial<AgentSettings>): AgentSettings => {
  return {
    apiKey: overrides?.apiKey ?? process.env.FASHION_AGENT_API_KEY ?? "",
    model: overrides?.model ?? process.env.FASHION_AGENT_MODEL ?? "gpt-4o-mini",
    region: overrides?.region ?? process.env.FASHION_AGENT_REGION ?? "Seoul",
    storeDir: overrides?.storeDir ?? process.env.FASHION_AGENT_STORE_DIR ?? ".data",
    locationConsent:
      overrides?.locationConsent ??
      process.env.FASHION_AGENT_LOCATION_CONSENT === "true",
    latitude:
      overrides?.latitude ??
      (process.env.FASHION_AGENT_LATITUDE
        ? Number(process.env.FASHION_AGENT_LATITUDE)
        : undefined),
    longitude:
      overrides?.longitude ??
      (process.env.FASHION_AGENT_LONGITUDE
        ? Number(process.env.FASHION_AGENT_LONGITUDE)
        : undefined),
    remoteSyncEnabled:
      overrides?.remoteSyncEnabled ??
      process.env.FASHION_AGENT_REMOTE_SYNC === "true",
    remoteBaseUrl:
      overrides?.remoteBaseUrl ?? process.env.FASHION_AGENT_REMOTE_BASE_URL,
    remoteAuthToken:
      overrides?.remoteAuthToken ?? process.env.FASHION_AGENT_REMOTE_AUTH_TOKEN
  };
};
