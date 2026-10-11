#!/usr/bin/env node
// Keeps every manifest in step.
//
//   node scripts/sync-manifests.mjs            copy mcp.json -> .mcp.json only
//   node scripts/sync-manifests.mjs 1.2.0      also set the version everywhere
//   node scripts/sync-manifests.mjs --check    change nothing, exit 1 if out of sync
//
// The changelog is not edited here: add the "## 1.2.0" heading yourself, then run this.
import {
    JSON_FILES,
    SEMVER,
    VERSION_FIELDS,
    getAt,
    readJson,
    readText,
    setAt,
    writeJson,
    writeText,
} from './lib.mjs';

const args = process.argv.slice(2);
const check = args.includes('--check');
const version = args.find((arg) => !arg.startsWith('--'));

if (version && !SEMVER.test(version)) {
    console.error(`"${version}" is not a semantic version (expected 1.2.3).`);
    process.exit(2);
}

let drift = 0;

// 1. Version in every manifest.
if (version) {
    const docs = new Map();
    for (const { file, path } of VERSION_FIELDS) {
        const doc = docs.get(file) ?? readJson(file);
        docs.set(file, doc);
        if (getAt(doc, path) !== version) {
            drift++;
            console.log(`${check ? 'would set' : 'set'} ${file} ${path.join('.')} = ${version}`);
            setAt(doc, path, version);
        }
    }
    if (!check) {
        for (const [file, doc] of docs) {
            writeJson(file, doc);
        }
    }
}

// 2. .mcp.json is a byte-for-byte copy of mcp.json (Cursor reads one, Claude and Codex the other).
if (readText('mcp.json') !== readText('.mcp.json')) {
    drift++;
    console.log(`${check ? 'would copy' : 'copied'} mcp.json -> .mcp.json`);
    if (!check) {
        writeText('.mcp.json', readText('mcp.json'));
    }
}

// Normalise formatting of the manifests we own so diffs stay small.
if (!check) {
    for (const file of JSON_FILES) {
        const raw = readText(file);
        const normal = JSON.stringify(JSON.parse(raw), null, 4) + '\n';
        if (raw !== normal) {
            writeText(file, normal);
        }
    }
}

if (check && drift > 0) {
    console.error(`${drift} manifest(s) out of sync. Run: node scripts/sync-manifests.mjs${version ? ' ' + version : ''}`);
    process.exit(1);
}
console.log(drift === 0 ? 'Manifests in sync.' : 'Done.');
