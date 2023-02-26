import type { Platform, Plugin } from "esbuild";

export interface ImportTransform {
  platform: Platform
  to: string
}

const ImportTransformPlugin = (
  modules?: Record<string, string | ImportTransform>
): Plugin => ({
  name: "import-transform",
  setup(build) {
    for (const [from, transform] of Object.entries(modules || {})) {
      const filter = new RegExp(`^${from}$`);
      if (typeof transform === "object") {
        const { platform, to } = transform;
        build.onResolve({ filter }, (args) => {
          if (args.resolveDir === "") return;

          if (build.initialOptions.platform !== platform) return;
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
          export { default } from '${args.path.replace(
            args.pluginData.name,
            to
          )}';
        `;

          return {
            contents: importerCode,
            resolveDir: args.pluginData.resolveDir
          };
        });
      } else if (typeof transform === "string") {
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
          export * from '${args.path.replace(args.pluginData.name, transform)}';
          export { default } from '${args.path.replace(
            args.pluginData.name,
            transform
          )}';
        `;

          return {
            contents: importerCode,
            resolveDir: args.pluginData.resolveDir
          };
        });
      }
    }
  }
});

export default ImportTransformPlugin;
