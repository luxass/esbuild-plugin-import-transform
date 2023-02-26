import { build } from "esbuild";
import { expect, test } from "vitest";

import ImportTransformPlugin from "../src";

test("transform `node:path` to `path-browserify`", async () => {
  const result = await build({
    entryPoints: ["./tests/fixtures/file.ts"],
    format: "esm",
    bundle: true,
    write: false,
    plugins: [
      ImportTransformPlugin({
        "node:path": "path-browserify"
      })
    ],
    outfile: "./tests/fixtures/out/file.js"
  });
  expect({
    errors: result.errors,
    warnings: result.warnings
  }).toEqual({ errors: [], warnings: [] });
  expect(result.outputFiles[0].text)
    .toBe(`// tests/fixtures/node_modules/path-browserify/index.js
function join(...args) {
  return args.join("/");
}

// tests/fixtures/file.ts
console.log(join("a", "b"));
`);
});

test("transform `node:path` to `path-browserify` when platform is set to browser", async () => {
  const nodeResult = await build({
    entryPoints: ["./tests/fixtures/file.ts"],
    bundle: true,
    platform: "node",
    write: false,
    plugins: [
      ImportTransformPlugin({
        "node:path": {
          platform: "browser",
          to: "path-browserify"
        }
      })
    ],
    outfile: "./tests/fixtures/out/file2.js"
  });

  expect({
    errors: nodeResult.errors,
    warnings: nodeResult.warnings
  }).toEqual({ errors: [], warnings: [] });
  expect(nodeResult.outputFiles[0].text).toBe(`"use strict";

// tests/fixtures/file.ts
var import_node_path = require("node:path");
console.log((0, import_node_path.join)("a", "b"));
`);

  const browserResult = await build({
    entryPoints: ["./tests/fixtures/file.ts"],
    bundle: true,
    platform: "browser",
    write: false,
    plugins: [
      ImportTransformPlugin({
        "node:path": {
          platform: "browser",
          to: "path-browserify"
        }
      })
    ],
    outfile: "./tests/fixtures/out/file2.js"
  });

  expect({
    errors: browserResult.errors,
    warnings: browserResult.warnings
  }).toEqual({ errors: [], warnings: [] });
  expect(browserResult.outputFiles[0].text).toBe(`"use strict";
(() => {
  // tests/fixtures/node_modules/path-browserify/index.js
  function join(...args) {
    return args.join("/");
  }

  // tests/fixtures/file.ts
  console.log(join("a", "b"));
})();
`);
});
