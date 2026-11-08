import fs from "node:fs";
import path from "node:path";

try {
  const planPath = path.resolve("docs/plan.md");
  const minnePath = path.resolve("docs/minne.md");

  if (fs.existsSync(planPath)) {
    const plan = fs.readFileSync(planPath, "utf-8");
    const summary = `# Sparat minne inför kontextkomprimering\nTid: ${new Date().toISOString()}\n\n${plan.slice(0, 1500)}\n`;
    fs.writeFileSync(minnePath, summary, "utf-8");
  }
} catch {}
process.exit(0);
