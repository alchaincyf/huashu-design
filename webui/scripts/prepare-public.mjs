import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webuiRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(webuiRoot, "..");
const publicRoot = path.join(webuiRoot, "public");

await fs.mkdir(path.join(publicRoot, "skill-assets"), { recursive: true });
await fs.copyFile(path.join(repoRoot, "assets", "banner.svg"), path.join(publicRoot, "skill-assets", "banner.svg"));
await fs.rm(path.join(publicRoot, "demos"), { recursive: true, force: true });
await fs.cp(path.join(repoRoot, "demos"), path.join(publicRoot, "demos"), { recursive: true });
