import { execSync } from "node:child_process";
import fs from "node:fs";

try {
  const diff = execSync("git diff HEAD", { encoding: "utf-8" });
  const lines = diff.split("\n");
  const addedLogs = lines.filter(l => l.startsWith("+") && !l.startsWith("+++") && l.includes("console.log"));

  if (addedLogs.length > 0) {
    process.stderr.write(`[Stop Hook] FEL: Kvarglömd console.log hittades i ändringarna:\n${addedLogs.slice(0, 3).join("\n")}\nTa bort console.log innan du slutför svaret!\n`);
    process.exit(2);
  }
} catch (e) {
  // Vid fel eller ingen git-diff, fortsätt
  process.exit(0);
}
process.exit(0);
