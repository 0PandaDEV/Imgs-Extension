import { execSync } from "child_process";
import fs from "fs";
import path from "path";

interface PackageJson {
  version: string;
}

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve("./package.json"), "utf8")
) as PackageJson;
const version = packageJson.version;

if (!fs.existsSync("./builds")) {
  fs.mkdirSync("./builds", { recursive: true });
}

const command = `web-ext build -s dist -a builds --filename imgs-${version}.xpi --overwrite-dest`;

try {
  console.log(`Building XPI version ${version}...`);
  execSync(command, { stdio: "inherit" });
  console.log(`✅ Successfully built imgs-${version}.xpi`);
} catch (error) {
  console.error("❌ Failed to build XPI:", error);
  process.exit(1);
}
