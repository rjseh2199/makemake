import { loadSettings } from "./config/settings";
import { orchestrateWeeklyRecommendation } from "./agents/orchestrator";
import { loadLocalSnapshot, saveLocalSnapshot } from "./storage/localStore";
import { downloadSnapshot, uploadSnapshot } from "./storage/remoteStore";
import type { AgentContext } from "./contracts/agentTypes";

const settings = loadSettings();

const context: AgentContext = {
  apiKey: settings.apiKey,
  model: settings.model,
  region: settings.region,
  currentDate: new Date().toISOString().slice(0, 10),
  locationConsent: settings.locationConsent,
  location:
    settings.locationConsent &&
    settings.latitude !== undefined &&
    settings.longitude !== undefined
      ? { latitude: settings.latitude, longitude: settings.longitude }
      : undefined
};

const startDate = context.currentDate;
const endDate = context.currentDate;

const run = async () => {
  const snapshot = settings.remoteSyncEnabled &&
    settings.remoteBaseUrl &&
    settings.remoteAuthToken
    ? await downloadSnapshot({
        baseUrl: settings.remoteBaseUrl,
        authToken: settings.remoteAuthToken
      })
    : await loadLocalSnapshot(settings.storeDir);

  const result = await orchestrateWeeklyRecommendation({
    context,
    startDate,
    endDate,
    wardrobeItems: snapshot.wardrobeItems,
    history: snapshot.history,
    feedback: snapshot.feedback,
    schedule: snapshot.schedule,
    conversation: snapshot.conversation,
    intent: snapshot.intent ?? "daily",
    preferences: snapshot.preferences ?? {
      color_preference: "mixed",
      fit_preference: "mixed",
      discomfort_avoidance: [],
      novelty_preference: "repeat_ok",
      purchase_opt_in: false
    },
    bodyProfile: snapshot.bodyProfile
  });

  if (settings.remoteSyncEnabled && settings.remoteBaseUrl && settings.remoteAuthToken) {
    await uploadSnapshot(
      { baseUrl: settings.remoteBaseUrl, authToken: settings.remoteAuthToken },
      snapshot
    );
  } else {
    await saveLocalSnapshot(settings.storeDir, snapshot);
  }
  console.log(JSON.stringify(result, null, 2));
};

run().catch((error) => {
  console.error("Failed to generate recommendation", error);
});
