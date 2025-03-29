import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve("./package.json"), "utf8")
);
const version = packageJson.version;

if (!fs.existsSync("./builds")) {
  fs.mkdirSync("./builds", { recursive: true });
}

const command = `crx pack dist -o builds/imgs-${version}.crx -p key.pem`;

try {
  console.log(`Building CRX version ${version}...`);
  execSync(command, { stdio: "inherit" });
  console.log(`✅ Successfully built imgs-${version}.crx`);
} catch (error) {
  console.error("❌ Failed to build CRX:", error);
  process.exit(1);
}
