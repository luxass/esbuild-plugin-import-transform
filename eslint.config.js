// @ts-check
import { luxass } from "@luxass/eslint-config";

export default luxass({
  formatters: true,
}, {
  files: ["tests/fixtures/**"],
  rules: {
    "no-console": "off",
  },
});
