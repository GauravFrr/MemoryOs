// Plasmo special import declarations
// These are handled by Plasmo's bundler at build time, but TypeScript needs
// explicit declarations to avoid "Cannot find module" IDE errors.

declare module "data-text:*" {
  const content: string;
  export default content;
}

declare module "data-base64:*" {
  const content: string;
  export default content;
}

declare module "data-env:*" {
  const content: string;
  export default content;
}

declare module "url:*" {
  const content: string;
  export default content;
}
