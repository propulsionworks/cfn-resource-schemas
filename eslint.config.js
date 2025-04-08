import propulsionworks, { config } from "@propulsionworks/eslint-config";

export default config(
  {
    ignores: ["node_modules/", "out/"],
  },
  {
    files: ["src/**/*.js", "src/**/*.ts"],
    extends: [propulsionworks.configs.js],
  },
  {
    files: ["src/**/*.ts"],
    extends: [propulsionworks.configs.ts],
  }
);
