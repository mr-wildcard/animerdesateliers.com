// https://stackoverflow.com/questions/57132428/augmentations-for-the-global-scope-can-only-be-directly-nested-in-external-modul
export {};

declare const tailwindConfig: any;
declare const __PROD__: boolean;

declare global {
  interface Window {
    lintrk(string, { conversion_id: number }): void;
  }

  namespace NodeJS {
    interface ProcessEnv {
      CF_PAGES_BRANCH: string;
      CF_PAGES: string;
    }
  }
}
