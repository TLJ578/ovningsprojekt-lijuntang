import { execSync } from "node:child_process";
import fs from "node:fs";

try {
  const input = fs.readFileSync(0, "utf-8");
  let filePath = "";
  try {
    const data = JSON.parse(input);
    filePath = data.tool_input?.path || data.tool_input?.file_path || "";
  } catch {
    // Om inte JSON på stdin, fortsätt
  }

  if (!filePath || filePath.endsWith(".ts")) {
    // Kör Prettier formatering
    try {
      execSync("npx prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"", { stdio: "ignore" });
    } catch {}

    // Kör TypeScript typkontroll
    try {
      execSync("npx tsc --noEmit", { stdio: "pipe" });
    } catch (err) {
      const errMsg = err.stdout?.toString() || err.stderr?.toString() || err.message;
      process.stderr.write(`[PostToolUse Hook] TypeScript typfel upptäcktes:\n${errMsg}\nRätta typfelet innan du fortsätter.\n`);
      process.exit(2);
    }
  }
} catch (e) {
  // Ignorera oväntade hookfel så verktyget inte kraschar
  process.exit(0);
}
