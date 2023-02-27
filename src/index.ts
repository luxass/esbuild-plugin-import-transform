import type { Platform, Plugin, PluginBuild } from "esbuild";

export interface ImportTransform {
  platform?: Platform
  to: string
}

function transformer(build: PluginBuild, from: string, to: string) {
  const filter = new RegExp(`^${from}$`);

  build.onResolve({ filter }, (args) => {
    if (args.resolveDir === "") return;

    return {
      path: args.path,
      namespace: "import-transform",
      pluginData: {
        resolveDir: args.resolveDir,
        name: from
      }
    };
  });

  build.onLoad({ filter, namespace: "import-transform" }, (args) => {
    const importerCode = `
    export * from '${args.path.replace(args.pluginData.name, to)}';
    export { default } from '${args.path.replace(args.pluginData.name, to)}';
  `;

    return {
      contents: importerCode,
      resolveDir: args.pluginData.resolveDir
    };
  });
}

const ImportTransformPlugin = (
  modules?: Record<string, string | ImportTransform>
): Plugin => ({
  name: "import-transform",
  setup(build) {
    for (const [mod, transform] of Object.entries(modules || {})) {
      if (typeof transform === "object") {
        const { platform, to } = transform;
        if (build.initialOptions.platform !== platform) return;

        transformer(build, mod, to);
      } else if (typeof transform === "string") {
        transformer(build, mod, transform);
      }
    }
  }
});

export default ImportTransformPlugin;
