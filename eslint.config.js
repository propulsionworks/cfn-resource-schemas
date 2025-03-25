import propulsionworks, { config } from "@propulsionworks/eslint-config";

export default config(
  {
    ignores: ["node_modules/", "out/"],
  },
  {
    files: ["**/*.js", "**/*.ts"],
    extends: [propulsionworks.configs.js],
  },
  {
    files: ["**/*.ts"],
    extends: [propulsionworks.configs.ts],
  }
);
