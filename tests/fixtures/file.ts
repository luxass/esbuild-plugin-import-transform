import { join } from "node:path";
import { what } from "./dir1/file-b";

console.log(join("a", "b", what));
