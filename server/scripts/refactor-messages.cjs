const fs = require("fs");
const path = require("path");

const root = "D:/Programming/SportNexus/server/src/controllers";
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name.endsWith(".js")) files.push(f);
  }
})(root);

const IMPORTS = [
  /^import\s+.*\n/gm,
];

let totalChanged = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  let changed = false;

  // 1. static double-quoted: message: "..."  (skip already-wrapped t(req,)
  content = content.replace(
    /message\s*:\s*(?!"?t\(req,)(?:"((?:[^"\\]|\\.)*)")/g,
    (m, body) => `message: t(req, "${body}")`
  );

  // 2. static single-quoted
  content = content.replace(
    /message\s*:\s*(?!t\(req,)('((?:[^'\\]|\\.)*)')/g,
    (m, body) => `message: t(req, ${body})`
  );

  // 3. dynamic error.message / result.message / other var.message -> wrap
  content = content.replace(
    /message\s*:\s*((?:error|err|result|data|coupon|user)\.message)/g,
    (m, expr) => `message: t(req, ${expr})`
  );

  if (content !== original) {
    // add import { t } after the first import line (or at top)
    const rel = path.relative(path.dirname(file), path.resolve(root, "../locales/messages.js")).replace(/\\/g, "/");
    const imp = `import { t } from "${rel}";`;
    if (!content.includes(imp)) {
      const lines = content.split("\n");
      let idx = 0;
      while (idx < lines.length && (lines[idx].startsWith("import ") || lines[idx].trim() === "")) idx++;
      lines.splice(idx, 0, imp);
      content = lines.join("\n");
    }
    fs.writeFileSync(file, content, "utf8");
    totalChanged++;
    console.log("CHANGED", file);
  }
}
console.log("Total changed files:", totalChanged);
