import fs from "node:fs";

try {
  const input = fs.readFileSync(0, "utf-8");
  let filePath = "";
  try {
    const data = JSON.parse(input);
    filePath = data.tool_input?.path || data.tool_input?.file_path || "";
  } catch {}

  if (filePath.includes(".env") && !filePath.includes(".env.example")) {
    process.stderr.write(`[PreToolUse Hook] STOPP: .env är en skyddad fil och får aldrig ändras eller läsas av agenten!\n`);
    process.exit(2);
  }

  // Hindra borttagning eller avstängning av tester
  if (filePath.includes("tests/") && input.includes('"content": ""')) {
    process.stderr.write(`[PreToolUse Hook] STOPP: Det är förbjudet att tömma eller inaktivera testfiler i tests/!\n`);
    process.exit(2);
  }
} catch {
  process.exit(0);
}
process.exit(0);
