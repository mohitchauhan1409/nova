export type ExtensionRelease =
  | { available: true; version: string; bytes: number; sha256: string; builtAt: string; downloadUrl: string }
  | { available: false; message: string };
