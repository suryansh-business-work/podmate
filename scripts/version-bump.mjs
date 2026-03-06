#!/usr/bin/env node

/**
 * Version management script for PartyWings monorepo.
 *
 * Usage:
 *   node scripts/version-bump.mjs <major|minor|patch> [--packages <pkg1,pkg2,...>]
 *
 * If no --packages flag, bumps ALL workspace packages.
 *
 * Follows MAJOR.MINOR.PATCH (SemVer):
 *   - MAJOR: Breaking changes
 *   - MINOR: New features (backward-compatible)
 *   - PATCH: Bug fixes
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';

const WORKSPACE_ROOT = resolve(import.meta.dirname, '..');

const PACKAGES = [
  { name: 'root', path: WORKSPACE_ROOT },
  { name: 'server', path: join(WORKSPACE_ROOT, 'server') },
  { name: 'admin-panel', path: join(WORKSPACE_ROOT, 'admin-panel') },
  { name: 'app', path: join(WORKSPACE_ROOT, 'app') },
  { name: 'website', path: join(WORKSPACE_ROOT, 'website') },
];

function bumpVersion(currentVersion, type) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid version type: ${type}. Use major, minor, or patch.`);
  }
}

function updatePackageVersion(pkgPath, type) {
  const pkgJsonPath = join(pkgPath, 'package.json');
  const content = readFileSync(pkgJsonPath, 'utf-8');
  const pkg = JSON.parse(content);

  const oldVersion = pkg.version || '1.0.0';
  const newVersion = bumpVersion(oldVersion, type);
  pkg.version = newVersion;

  writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');

  return { name: pkg.name || pkgPath, oldVersion, newVersion };
}

function updateAppJson(type) {
  const appJsonPath = join(WORKSPACE_ROOT, 'app', 'app.json');
  try {
    const content = readFileSync(appJsonPath, 'utf-8');
    const appJson = JSON.parse(content);

    if (appJson.expo?.version) {
      const oldVersion = appJson.expo.version;
      const newVersion = bumpVersion(oldVersion, type);
      appJson.expo.version = newVersion;
      writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf-8');
      return { oldVersion, newVersion };
    }
  } catch {
    /* app.json may not exist in all scenarios */
  }
  return null;
}

// --- Main ---
const args = process.argv.slice(2);
const type = args[0];

if (!type || !['major', 'minor', 'patch'].includes(type)) {
  console.error('Usage: node scripts/version-bump.mjs <major|minor|patch> [--packages <pkg1,pkg2>]');
  process.exit(1);
}

const pkgFlagIndex = args.indexOf('--packages');
let targetPackages = PACKAGES;

if (pkgFlagIndex !== -1 && args[pkgFlagIndex + 1]) {
  const names = args[pkgFlagIndex + 1].split(',');
  targetPackages = PACKAGES.filter((p) => names.includes(p.name));
  if (targetPackages.length === 0) {
    console.error(`No matching packages found for: ${names.join(', ')}`);
    process.exit(1);
  }
}

console.log(`\n📦 Bumping ${type} version for: ${targetPackages.map((p) => p.name).join(', ')}\n`);

const results = targetPackages.map((pkg) => updatePackageVersion(pkg.path, type));

const appResult = targetPackages.some((p) => p.name === 'app') ? updateAppJson(type) : null;

results.forEach((r) => {
  console.log(`  ${r.name}: ${r.oldVersion} → ${r.newVersion}`);
});

if (appResult) {
  console.log(`  app.json (expo.version): ${appResult.oldVersion} → ${appResult.newVersion}`);
}

console.log('\n✅ Version bump complete.\n');
