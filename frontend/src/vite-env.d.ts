/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RUNPOD_ENDPOINT_ID: string;
  readonly VITE_RUNPOD_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
