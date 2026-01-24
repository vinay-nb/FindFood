import "dotenv/config";

interface Config {
  google: {
    apiKey: string;
  };
  server: {
    port: number | string;
  };
}

export const config: Config = {
  google: {
    apiKey: process.env.GOOGLE_API_KEY || "",
  },
  server: {
    port: process.env.PORT || 3000,
  },
};

// Fail Fast Check
if (!config.google.apiKey) {
  throw new Error("MISSING REQUIRED ENV VAR: GOOGLE_API_KEY");
}
