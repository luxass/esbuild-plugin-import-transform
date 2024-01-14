import { build } from "esbuild";
import { describe, expect, it } from "vitest";

import ImportTransformPlugin from "../src";

it("transform without platform set", async () => {
  const result = await build({
    entryPoints: ["./tests/fixtures/file.ts"],
    format: "esm",
    bundle: true,
    write: false,
    plugins: [
      ImportTransformPlugin({
        "node:path": "path-browserify",
      }),
    ],
    outfile: "./tests/fixtures/out/file.js",
  });
  expect({
    errors: result.errors,
    warnings: result.warnings,
  }).toEqual({ errors: [], warnings: [] });
  expect(result.outputFiles[0].text)
    .toBe(`// tests/fixtures/node_modules/path-browserify/index.js
function join(...args) {
  return args.join("/");
}

// tests/fixtures/dir1/file-b.ts
var what = join("a", "b");

// tests/fixtures/file.ts
console.warn(join("a", "b", what));
`);
});

describe("transform `node:path` to `path-browserify`", () => {
  const transformPlugin = ImportTransformPlugin({
    "node:path": {
      platform: "browser",
      to: "path-browserify",
    },
  });

  it("transform when platform is set to `browser`", async () => {
    const result = await build({
      entryPoints: ["./tests/fixtures/file.ts"],
      bundle: true,
      platform: "browser",
      write: false,
      plugins: [transformPlugin],
      outfile: "./tests/fixtures/out/file2.js",
    });

    expect({
      errors: result.errors,
      warnings: result.warnings,
    }).toEqual({ errors: [], warnings: [] });
    expect(result.outputFiles[0].text).toBe(`"use strict";
(() => {
  // tests/fixtures/node_modules/path-browserify/index.js
  function join(...args) {
    return args.join("/");
  }

  // tests/fixtures/dir1/file-b.ts
  var what = join("a", "b");

  // tests/fixtures/file.ts
  console.warn(join("a", "b", what));
})();
`);
  });

  it("should not transform", async () => {
    const result = await build({
      entryPoints: ["./tests/fixtures/file.ts"],
      bundle: true,
      platform: "node",
      write: false,
      plugins: [transformPlugin],
      outfile: "./tests/fixtures/out/file2.js",
    });

    expect({
      errors: result.errors,
      warnings: result.warnings,
    }).toEqual({ errors: [], warnings: [] });

    expect(result.outputFiles[0].text).toBe(`"use strict";

// tests/fixtures/file.ts
var import_node_path2 = require("node:path");

// tests/fixtures/dir1/file-b.ts
var import_node_path = require("node:path");
var what = (0, import_node_path.join)("a", "b");

// tests/fixtures/file.ts
console.warn((0, import_node_path2.join)("a", "b", what));
`);
  });
});

it("transform `./locate` to code", async () => {
  const result = await build({
    entryPoints: ["./tests/fixtures/file.ts"],
    format: "esm",
    bundle: true,
    write: false,
    plugins: [
      ImportTransformPlugin({
        "node:path": {
          text: `export function join(...args) {
            return args.join("/");
          }`,
        },
      }),
    ],
    outfile: "./tests/fixtures/out/file.js",
  });
  expect({
    errors: result.errors,
    warnings: result.warnings,
  }).toEqual({ errors: [], warnings: [] });
  expect(result.outputFiles[0].text).toBe(`// import-transform:node:path
function join(...args) {
  return args.join("/");
}

// tests/fixtures/dir1/file-b.ts
var what = join("a", "b");

// tests/fixtures/file.ts
console.warn(join("a", "b", what));
`);
});
