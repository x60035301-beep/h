import fs from "node:fs";
import path from "node:path";

export function loadEnvFiles(cwd = process.cwd()) {
  for (const fileName of [".env.local", ".env"]) {
    const filePath = path.join(cwd, fileName);
    if (!fs.existsSync(filePath)) continue;

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const equalsIndex = line.indexOf("=");
      if (equalsIndex <= 0) continue;

      const key = line.slice(0, equalsIndex).trim();
      let value = line.slice(equalsIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (!process.env[key]) process.env[key] = value;
    }
  }
}

export function getEnvStatus(name) {
  const value = process.env[name]?.trim();
  const missing = !value;
  const placeholder = Boolean(value && /your-|your_project|your-project|example\.com/i.test(value));

  return {
    name,
    value,
    ok: Boolean(value && !placeholder),
    missing,
    placeholder
  };
}

export function getFirstEnv(names) {
  for (const name of names) {
    const status = getEnvStatus(name);
    if (status.ok) return status;
  }

  return {
    name: names.join(" or "),
    value: undefined,
    ok: false,
    missing: true,
    placeholder: false
  };
}
