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
  },
  {
    files: ["src/build/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowTaggedTemplates: true }, // zx uses $`` for commands
      ],
      "n/no-process-exit": "off",
      "n/no-process-env": "off",
      "unicorn/no-process-exit": "off",
    },
  }
);
