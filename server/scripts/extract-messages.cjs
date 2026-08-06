const fs = require("fs");
const path = require("path");

const dirs = ["../src/controllers", "../src/services", "../src/middlewares"];
const results = [];

for (const d of dirs) {
  const base = path.resolve(__dirname, d);
  if (!fs.existsSync(base)) continue;
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".js")) results.push(full);
    }
  })(base);
}

const msgRe = /message\s*:\s*(`[^`]*`|"[^"]*"|'[^']*')/g;
const lines = [];
const unique = new Map();

for (const file of results) {
  const content = fs.readFileSync(file, "utf8");
  const fileLines = content.split("\n");
  fileLines.forEach((ln, i) => {
    let m;
    msgRe.lastIndex = 0;
    while ((m = msgRe.exec(ln))) {
      let raw = m[1];
      if (raw.startsWith("`")) raw = "TEMPLATE:" + raw;
      lines.push(`${file.replace(/\\/g, "/")}:${i + 1}\t${raw}`);
      unique.set(raw, (unique.get(raw) || 0) + 1);
    }
  });
}

const out = [
  "===== ALL OCCURRENCES =====",
  ...lines,
  "",
  `===== UNIQUE (${unique.size}) =====`,
  ...[...unique.keys()].sort(),
];
fs.writeFileSync(
  path.join(process.env.TEMP || "/tmp", "opencode", "messages-all.txt"),
  out.join("\n"),
  "utf8",
);
console.log(`Total occurrences: ${lines.length}`);
console.log(`Unique messages: ${unique.size}`);
console.log("Written to %TEMP%\\opencode\\messages-all.txt");
