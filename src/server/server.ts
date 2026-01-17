import http from "http";
import { URL } from "url";
import { orchestrateWeeklyRecommendation } from "../agents/orchestrator";
import { loadSettings } from "../config/settings";
import type { BodyProfile, LocalDataSnapshot, UserIntent, UserPreferences } from "../contracts/agentTypes";
import { LocalFileStore } from "../storage/localFileStore";
import { RemoteHttpStore } from "../storage/remoteHttpStore";
import type { SnapshotStore } from "../storage/snapshotStore";

type RecommendationRequest = {
  userId: string;
  intent: UserIntent;
  preferences: UserPreferences;
  bodyProfile?: BodyProfile;
  wardrobe?: LocalDataSnapshot["wardrobeItems"];
  history?: LocalDataSnapshot["history"];
  feedback?: LocalDataSnapshot["feedback"];
  mood?: string[];
};

const readJson = async (req: http.IncomingMessage) => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  const raw = new TextDecoder("utf-8").decode(Buffer.concat(chunks));
  return raw ? JSON.parse(raw) : {};
};

const jsonResponse = (res: http.ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

const buildStore = (settings: ReturnType<typeof loadSettings>): SnapshotStore => {
  if (process.env.STORAGE_MODE === "remote") {
    if (!settings.remoteBaseUrl || !settings.remoteAuthToken) {
      throw new Error("Remote storage requires FASHION_AGENT_REMOTE_BASE_URL and AUTH token.");
    }
    return new RemoteHttpStore(settings.remoteBaseUrl, settings.remoteAuthToken);
  }
  return new LocalFileStore(settings.storeDir);
};

export const createServer = () => {
  const settings = loadSettings();
  const store = buildStore(settings);

  return http.createServer(async (req, res) => {
    try {
      if (!req.url || !req.method) {
        return jsonResponse(res, 400, { error: "Invalid request" });
      }
      const url = new URL(req.url, "http://localhost");

      if (req.method === "GET" && url.pathname === "/snapshot") {
        const userId = url.searchParams.get("userId") ?? "";
        if (!userId) {
          return jsonResponse(res, 400, { error: "userId is required" });
        }
        const snapshot = await store.load(userId);
        return jsonResponse(res, 200, { snapshot });
      }

      if (req.method === "POST" && url.pathname === "/snapshot") {
        const payload = (await readJson(req)) as { userId?: string; snapshot?: LocalDataSnapshot };
        if (!payload.userId || !payload.snapshot) {
          return jsonResponse(res, 400, { error: "userId and snapshot are required" });
        }
        await store.save(payload.userId, payload.snapshot);
        return jsonResponse(res, 200, { saved: true });
      }

      if (req.method === "POST" && url.pathname === "/recommendation/weekly") {
        const payload = (await readJson(req)) as RecommendationRequest;
        if (!payload.userId || !payload.intent || !payload.preferences) {
          return jsonResponse(res, 400, { error: "userId, intent, preferences are required" });
        }

        const stored = await store.load(payload.userId);
        const snapshot: LocalDataSnapshot = {
          wardrobeItems: payload.wardrobe ?? stored?.wardrobeItems ?? [],
          history: payload.history ?? stored?.history ?? [],
          feedback: payload.feedback ?? stored?.feedback ?? [],
          schedule: stored?.schedule ?? [],
          conversation: stored?.conversation ?? [],
          intent: payload.intent,
          preferences: payload.preferences,
          bodyProfile: payload.bodyProfile ?? stored?.bodyProfile
        };

        const context = {
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

        const result = await orchestrateWeeklyRecommendation({
          context,
          startDate: context.currentDate,
          endDate: context.currentDate,
          wardrobeItems: snapshot.wardrobeItems,
          history: snapshot.history,
          feedback: snapshot.feedback,
          schedule: snapshot.schedule,
          conversation: snapshot.conversation,
          intent: snapshot.intent ?? "weekly",
          preferences: snapshot.preferences ?? payload.preferences,
          bodyProfile: snapshot.bodyProfile
        });

        await store.save(payload.userId, snapshot);

        return jsonResponse(res, 200, {
          persona_mix: result.recommendation.persona_mix,
          cards: result.recommendation.cards,
          snapshotSaved: true
        });
      }

      return jsonResponse(res, 404, { error: "Not found" });
    } catch (error) {
      return jsonResponse(res, 500, { error: (error as Error).message });
    }
  });
};

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3000);
  const server = createServer();
  server.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });
}
