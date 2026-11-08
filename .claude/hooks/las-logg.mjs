import fs from "node:fs";
import path from "node:path";

try {
  const sessionsDir = path.resolve("sessions");
  if (fs.existsSync(sessionsDir)) {
    const files = fs.readdirSync(sessionsDir)
      .filter(f => f.startsWith("pass-") && f.endsWith(".md"))
      .sort();

    if (files.length > 0) {
      const latestFile = files[files.length - 1];
      const content = fs.readFileSync(path.join(sessionsDir, latestFile), "utf-8");
      process.stdout.write(`\n=== AUTOMATISKT INLADDAD SESSIONSLOGG (${latestFile}) ===\n${content}\n=======================================================\n`);
    } else {
      process.stdout.write("\n[SessionStart Hook] Inga tidigare sessionsloggar hittades i sessions/.\n");
    }
  }
} catch (err) {
  process.stdout.write(`[SessionStart Hook] Kunde inte läsa logg: ${err.message}\n`);
}
process.exit(0);
