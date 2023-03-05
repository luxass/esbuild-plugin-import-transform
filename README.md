<h1 align="center">Import Transform Plugin</h1>

This plugin allows you to transform imports with ESBUILD
<br/>
<br/>

## 📦 Installation

```sh
pnpm install -D esbuild esbuild-plugin-import-transform
```

## 📚 Usage

Add this to your build file

```js
import { build } from "esbuild";
import importTransform from "esbuild-plugin-import-transform";

const yourConfig = {};

await build({
  ...yourConfig,
  plugins: [
    importTransform({
      "imported-module": "imported-module/dist/index.js",

      // This will transform all imports from "node:path" to "path-browserify"
      // when esbuilds platform is set to "browser"
      "node:path": {
        platform: "browser",
        to: "path-browserify"
      },

      "./locate": {
        text: "export function locate() { return \"found\" }"
      }
    })
  ]
});
```
