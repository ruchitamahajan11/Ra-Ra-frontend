/// <reference types="vite/client" />


// src/vite-pwa.d.ts
// Tells TypeScript about the virtual module that vite-plugin-pwa generates.
// ── Place this file directly inside your src/ folder ──

declare module "virtual:pwa-register" {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (
      registration: ServiceWorkerRegistration | undefined
    ) => void;
    onRegisterError?: (error: any) => void;
  }

  export function registerSW(
    options?: RegisterSWOptions
  ): (reloadPage?: boolean) => Promise<void>;
}