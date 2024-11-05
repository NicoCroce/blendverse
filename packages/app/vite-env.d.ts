/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  // Añade aquí otras variables de entorno que uses en tu proyecto
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
