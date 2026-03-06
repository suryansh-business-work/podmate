interface AdminConfig {
  /** Full GraphQL endpoint URL */
  apiUrl: string;
  /** Whether the app is running in production mode */
  isProduction: boolean;
}

const PRODUCTION_API = 'https://podify-api.exyconn.com/graphql';
const LOCAL_API = 'http://localhost:4039/graphql';

function buildConfig(): AdminConfig {
  // Vite injects VITE_API_URL at build time (set via Dockerfile ARG or .env)
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;

  if (envUrl) {
    return {
      apiUrl: envUrl,
      isProduction: import.meta.env.PROD,
    };
  }

  return {
    apiUrl: import.meta.env.PROD ? PRODUCTION_API : LOCAL_API,
    isProduction: import.meta.env.PROD,
  };
}

const config: AdminConfig = buildConfig();

export default config;
