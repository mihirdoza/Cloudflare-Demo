/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ACCOUNT_ID: string;
    readonly VITE_WORKER_NAME:string;
    readonly VITE_API_TOKEN:string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }