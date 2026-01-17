import http from "http";
import { createServer } from "../server/server";

const requestJson = (options: http.RequestOptions, body: unknown) =>
  new Promise<{ status: number; payload: string }>((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks: Uint8Array[] = [];
      res.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      res.on("end", () => {
        resolve({
          status: res.statusCode ?? 0,
          payload: new TextDecoder("utf-8").decode(Buffer.concat(chunks))
        });
      });
    });
    req.on("error", reject);
    req.write(JSON.stringify(body));
    req.end();
  });

const run = async () => {
  process.env.STORAGE_MODE = "local";
  process.env.FASHION_AGENT_STORE_DIR = ".data-test";

  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to bind server");
  }

  const response = await requestJson(
    {
      hostname: "127.0.0.1",
      port: address.port,
      path: "/recommendation/weekly",
      method: "POST",
      headers: { "Content-Type": "application/json" }
    },
    {
      userId: "smoke-user",
      intent: "weekly",
      preferences: {
        color_preference: "mixed",
        fit_preference: "mixed",
        discomfort_avoidance: [],
        novelty_preference: "repeat_ok",
        purchase_opt_in: false
      },
      wardrobe: [
        { id: "top-1", category: "top", color: "white", season: "all", condition: "good" },
        { id: "bottom-1", category: "bottom", color: "black", season: "all", condition: "good" },
        { id: "shoes-1", category: "shoes", color: "white", season: "all", condition: "good" }
      ]
    }
  );

  if (response.status !== 200) {
    throw new Error(`Server smoke test failed: ${response.payload}`);
  }

  server.close();
  console.log("server.smoke.test.ts passed");
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
