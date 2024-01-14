import { join } from "node:path";
import { what } from "./dir1/file-b";

console.warn(join("a", "b", what));
