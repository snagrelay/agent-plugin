// Shared helpers for the release and validation scripts. No dependencies.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Every JSON file that carries the plugin version, and where in the file it lives.
 * `path` is a list of keys / array indexes from the document root.
 */
export const VERSION_FIELDS = [
    { file: '.cursor-plugin/plugin.json', path: ['version'] },
    { file: '.claude-plugin/plugin.json', path: ['version'] },
    { file: '.claude-plugin/marketplace.json', path: ['metadata', 'version'] },
    { file: '.claude-plugin/marketplace.json', path: ['plugins', 0, 'version'] },
    { file: '.codex-plugin/plugin.json', path: ['version'] },
    { file: 'server.json', path: ['version'] },
];

export const JSON_FILES = [
    '.cursor-plugin/plugin.json',
    '.claude-plugin/plugin.json',
    '.claude-plugin/marketplace.json',
    '.codex-plugin/plugin.json',
    '.agents/plugins/marketplace.json',
    'mcp.json',
    '.mcp.json',
    'server.json',
];

export const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

export function readText(file) {
    return readFileSync(join(ROOT, file), 'utf8');
}

export function writeText(file, text) {
    writeFileSync(join(ROOT, file), text);
}

export function readJson(file) {
    return JSON.parse(readText(file));
}

export function writeJson(file, value) {
    writeText(file, JSON.stringify(value, null, 4) + '\n');
}

export function getAt(doc, path) {
    return path.reduce((node, key) => (node == null ? undefined : node[key]), doc);
}

export function setAt(doc, path, value) {
    const parent = getAt(doc, path.slice(0, -1));
    parent[path[path.length - 1]] = value;
}

/** Latest released heading in CHANGELOG.md ("## 1.0.0"), ignoring "Unreleased". */
export function latestChangelogVersion() {
    const match = readText('CHANGELOG.md').match(/^##\s+v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\b/m);
    return match ? match[1] : null;
}
