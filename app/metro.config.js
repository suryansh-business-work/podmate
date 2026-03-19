const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// pnpm monorepo support: watch monorepo root for shared packages
config.watchFolders = [monorepoRoot];

// pnpm support: resolve from both app and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Disable package.json "exports" field support to avoid issues
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
