// Scarica in artifact/img/ le foto Unsplash usate dal componente, per l'anteprima Artifact
// (la CSP degli Artifact non carica immagini da host esterni). Usa curl, che rispetta HTTPS_PROXY.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";

const src = readFileSync("src/MariannaJ.tsx", "utf8");
const ids = [...new Set(src.match(/photo-\d+-[0-9a-f]+/g) ?? [])];
const dir = "artifact/img";
mkdirSync(dir, { recursive: true });

let failed = 0;
for (const id of ids) {
  const file = `${dir}/${id}.jpg`;
  if (existsSync(file) && statSync(file).size > 0) continue;
  const url = `https://images.unsplash.com/${id}?fm=jpg&fit=max&w=1600&q=72`;
  try {
    execFileSync("curl", ["-sSfL", "--retry", "2", "-o", file, url], { stdio: ["ignore", "ignore", "pipe"] });
    console.log(`ok   ${id}  ${(statSync(file).size / 1024).toFixed(0)} KB`);
  } catch (err) {
    failed++;
    console.error(`fail ${id}  ${String(err.stderr ?? err.message).trim()}`);
  }
}
console.log(`${ids.length - failed}/${ids.length} foto in ${dir}`);
if (failed) process.exitCode = 1;
