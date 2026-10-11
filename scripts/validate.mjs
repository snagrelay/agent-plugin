#!/usr/bin/env node
// CI guardrails. Every check here prevents a failure that would cost a directory review cycle.
//
//   node scripts/validate.mjs            offline checks
//   node scripts/validate.mjs --live     also probe the MCP URL (expects 401 + WWW-Authenticate)
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
    JSON_FILES,
    ROOT,
    SEMVER,
    VERSION_FIELDS,
    getAt,
    latestChangelogVersion,
    readJson,
    readText,
} from './lib.mjs';

const errors = [];
const fail = (message) => errors.push(message);
const live = process.argv.includes('--live');

// --- 1. Every JSON file parses --------------------------------------------------------------
const docs = {};
for (const file of JSON_FILES) {
    try {
        docs[file] = readJson(file);
    } catch (error) {
        fail(`${file}: ${error.message}`);
    }
}

// --- 2. Versions agree everywhere -----------------------------------------------------------
const versions = new Map();
for (const { file, path } of VERSION_FIELDS) {
    if (!docs[file]) continue;
    const value = getAt(docs[file], path);
    if (typeof value !== 'string' || !SEMVER.test(value)) {
        fail(`${file} ${path.join('.')}: missing or not a semantic version (${JSON.stringify(value)})`);
        continue;
    }
    versions.set(`${file} ${path.join('.')}`, value);
}
const changelog = latestChangelogVersion();
if (!changelog) {
    fail('CHANGELOG.md: no "## x.y.z" heading found');
} else {
    versions.set('CHANGELOG.md latest heading', changelog);
}
if (new Set(versions.values()).size > 1) {
    fail(
        'versions differ:\n' +
            [...versions].map(([where, v]) => `    ${where.padEnd(52)} ${v}`).join('\n'),
    );
}

// --- 3. No dev URLs anywhere a reviewer or user can see ------------------------------------
const DEV_HOST = /(?:\.test\b|\blocalhost\b|127\.0\.0\.1|0\.0\.0\.0|\.local\b|ngrok|\.internal\b)/i;
for (const file of JSON_FILES) {
    for (const [index, line] of readText(file).split('\n').entries()) {
        if (/https?:\/\//.test(line) && DEV_HOST.test(line)) {
            fail(`${file}:${index + 1}: dev URL in a published manifest: ${line.trim()}`);
        }
    }
}

// --- 4. mcp.json and .mcp.json are identical, and point at production -----------------------
if (readText('mcp.json') !== readText('.mcp.json')) {
    fail('mcp.json and .mcp.json differ. Run: node scripts/sync-manifests.mjs');
}
const mcpUrl = docs['mcp.json']?.mcpServers?.snagrelay?.url;
if (mcpUrl !== 'https://mcp.snagrelay.com/v1') {
    fail(`mcp.json: snagrelay url must be https://mcp.snagrelay.com/v1 (got ${mcpUrl})`);
}
const remoteUrl = docs['server.json']?.remotes?.[0]?.url;
if (remoteUrl !== mcpUrl) {
    fail(`server.json remotes[0].url (${remoteUrl}) must equal the mcp.json url (${mcpUrl})`);
}

// --- 5. server.json rules the registry enforces ---------------------------------------------
const server = docs['server.json'];
if (server) {
    if (!/^com\.snagrelay\/[a-z0-9][a-z0-9._-]*$/.test(server.name ?? '')) {
        fail(`server.json name must be com.snagrelay/<name> (got ${server.name})`);
    }
    if ((server.description ?? '').length === 0 || server.description.length > 100) {
        fail(`server.json description must be 1-100 chars (got ${server.description?.length})`);
    }
    if (server.remotes?.[0]?.type !== 'streamable-http') {
        fail('server.json remotes[0].type must be streamable-http');
    }
}

// --- 6. Plugin names agree ------------------------------------------------------------------
const names = new Set(
    [
        docs['.cursor-plugin/plugin.json']?.name,
        docs['.claude-plugin/plugin.json']?.name,
        docs['.claude-plugin/marketplace.json']?.plugins?.[0]?.name,
        docs['.codex-plugin/plugin.json']?.name,
        docs['.agents/plugins/marketplace.json']?.plugins?.[0]?.name,
    ].filter(Boolean),
);
if (names.size !== 1 || ![...names].every((name) => /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(name))) {
    fail(`plugin name must be one kebab-case value in every manifest (got ${[...names].join(', ')})`);
}

// --- 7. Skills and rules have frontmatter ---------------------------------------------------
function frontmatter(file) {
    const match = readText(file).match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) return null;
    const fields = {};
    for (const line of match[1].split('\n')) {
        const pair = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
        if (pair) fields[pair[1]] = pair[2].trim();
    }
    return fields;
}

const skillDirs = readdirSync(join(ROOT, 'skills')).filter((entry) =>
    statSync(join(ROOT, 'skills', entry)).isDirectory(),
);
if (skillDirs.length === 0) fail('skills/: no skills found');
for (const dir of skillDirs) {
    const file = `skills/${dir}/SKILL.md`;
    if (!existsSync(join(ROOT, file))) {
        fail(`${file}: missing`);
        continue;
    }
    const meta = frontmatter(file);
    if (!meta?.name || !meta?.description) {
        fail(`${file}: frontmatter needs name and description`);
    } else if (meta.name !== dir) {
        fail(`${file}: name "${meta.name}" must match the folder "${dir}"`);
    }
}
for (const rule of readdirSync(join(ROOT, 'rules')).filter((f) => f.endsWith('.mdc'))) {
    const meta = frontmatter(`rules/${rule}`);
    if (!meta?.description) fail(`rules/${rule}: frontmatter needs a description`);
    if (meta && !('alwaysApply' in meta)) fail(`rules/${rule}: frontmatter needs alwaysApply`);
}

// --- 7b. OpenAI / Codex directory rules (developers.openai.com/plugins/deploy/submission) --------
const codex = docs['.codex-plugin/plugin.json'];
if (codex) {
    const ui = codex.interface ?? {};
    const max = (field, limit) => {
        if (typeof ui[field] !== 'string' || ui[field].length === 0 || ui[field].length > limit) {
            fail(`.codex-plugin interface.${field} must be 1-${limit} characters (got ${ui[field]?.length})`);
        }
    };
    max('displayName', 30);
    max('shortDescription', 30);
    max('longDescription', 4000);
    max('developerName', 80);
    for (const field of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
        if (!/^https:\/\/[^/@\s]+\S*$/.test(ui[field] ?? '')) fail(`.codex-plugin interface.${field} must be an https URL`);
    }
    for (const field of ['logo', 'composerIcon']) {
        const path = ui[field];
        if (!/^\.\/.+\.(png|jpe?g|webp|svg)$/.test(path ?? '')) {
            fail(`.codex-plugin interface.${field} must be a ./ path to a png, jpg, webp or svg (got ${path})`);
        } else if (!existsSync(join(ROOT, path))) {
            fail(`.codex-plugin interface.${field}: ${path} does not exist`);
        }
    }
    if (!Array.isArray(ui.capabilities)) fail('.codex-plugin interface.capabilities must be an array');
    const prompts = [].concat(ui.defaultPrompt ?? []);
    if (prompts.length > 3 || prompts.some((p) => p.length > 128)) {
        fail('.codex-plugin interface.defaultPrompt: at most 3 prompts of 128 characters');
    }
    const cases = codex.extensions?.['com.openai']?.review?.test_cases ?? {};
    if ((cases.positive ?? []).length !== 5) fail('.codex-plugin review.test_cases.positive must have exactly 5 cases');
    if ((cases.negative ?? []).length !== 3) fail('.codex-plugin review.test_cases.negative must have exactly 3 cases');
    for (const c of cases.positive ?? []) {
        if (!c.description || !c.prompt || !c.tools_triggered || !c.expected_behavior) {
            fail(`.codex-plugin positive case "${c.description}" needs description, prompt, tools_triggered, expected_behavior`);
        }
    }
}

// --- 7c. Claude rejects binary files in the plugin (manual review); keep the repo text-only -------
const BINARY = /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|woff2?|ttf|mp4|mov)$/i;
const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
for (const file of tracked) {
    if (BINARY.test(file)) fail(`${file}: binary file. Directory scans hold the plugin for manual review. Host media elsewhere.`);
}

// --- 8. Logos exist -------------------------------------------------------------------------
for (const asset of ['assets/logo.svg']) {
    if (!existsSync(join(ROOT, asset))) fail(`${asset}: missing`);
}

// --- 9. Files a directory reviewer expects --------------------------------------------------
for (const file of ['LICENSE', 'README.md', 'SECURITY.md', 'TELEMETRY.md', 'CHANGELOG.md', 'AGENTS.md']) {
    if (!existsSync(join(ROOT, file))) fail(`${file}: missing`);
}

// --- 10. Optional live smoke test -----------------------------------------------------------
if (live && mcpUrl) {
    try {
        const response = await fetch(mcpUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
            signal: AbortSignal.timeout(15000),
        });
        if (response.status !== 401) {
            fail(`live: unauthenticated POST ${mcpUrl} returned ${response.status}, expected 401`);
        } else if (!/resource_metadata=/.test(response.headers.get('www-authenticate') ?? '')) {
            fail('live: 401 is missing WWW-Authenticate with resource_metadata');
        }
    } catch (error) {
        fail(`live: could not reach ${mcpUrl}: ${error.message}`);
    }
}

if (errors.length > 0) {
    console.error(`\n${errors.length} problem(s):\n`);
    for (const message of errors) console.error(`  ✗ ${message}`);
    process.exit(1);
}
console.log(`✓ All checks passed (version ${[...versions.values()][0]}${live ? ', live probe ok' : ''}).`);
