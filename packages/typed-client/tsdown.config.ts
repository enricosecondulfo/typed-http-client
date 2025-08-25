import { defineConfig } from "tsdown";
import path from "node:path";
import fs from "node:fs/promises";

export default defineConfig({
  entry: "./src/index.ts",
  external: ["@angular/compiler", "@angular/core"],
  dts: true,
  sourcemap: true,
  outExtensions: () => ({ js: ".mjs", dts: ".ts" }),
  plugins: [
    {
      name: "enhance-package-json",
      async generateBundle() {
        const packageJsonPath = path.resolve("package.json");
        const packageJson = JSON.parse(
          await fs.readFile(packageJsonPath, "utf8"),
        );

        const { scripts, devDependencies, ...rest } = packageJson;
        const exports = {
          "./package.json": "./package.json",

          ".": {
            types: "./index.d.ts",
            default: "./index.mjs",
          },
        };

        this.emitFile({
          type: "asset",
          fileName: "package.json",
          source: JSON.stringify(
            { ...rest, types: "./index.d.ts", module: "./index.mjs", exports },
            null,
            2,
          ),
        });
      },
    },
  ],
});

/*

this.emitFile({
  type: 'asset',
  fileName: 'package.json',
  source: JSON.stringify({
    ...JSON.parse(this.getAsset('package.json').source.toString()),
    main: './index.js',
    module: './index.mjs',
    types: './index.d.ts'
  }, null, 2)
});*/
