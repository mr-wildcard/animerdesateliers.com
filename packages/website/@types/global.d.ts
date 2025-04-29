// https://stackoverflow.com/questions/57132428/augmentations-for-the-global-scope-can-only-be-directly-nested-in-external-modul
export {};

declare const __PROD__: boolean;

declare global {
  interface Window {
    lintrk(string, { conversion_id: number }): void;
  }

  namespace NodeJS {
    interface ProcessEnv {
      CF_PAGES: string;
      CF_PAGES_URL: string;
    }
  }
}
