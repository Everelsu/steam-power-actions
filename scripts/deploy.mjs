import { cpSync, lstatSync, mkdirSync, rmdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = 'C:\\Program Files (x86)\\Steam\\millennium\\plugins\\steam-power-actions';

const entries = ['plugin.json', 'README.md', 'LICENSE', '.millennium', 'backend/main.lua'];

let stat;
try {
	stat = lstatSync(target);
} catch {
	stat = undefined;
}

if (stat) {
	try {
		rmdirSync(target);
	} catch {
		if (stat.isSymbolicLink()) throw new Error(`Refusing to recursively delete link at ${target}`);
		rmSync(target, { recursive: true, force: true });
	}
}

mkdirSync(target, { recursive: true });
for (const entry of entries) {
	cpSync(path.join(root, entry), path.join(target, entry), { recursive: true });
}

console.log(`Deployed to ${target}`);
