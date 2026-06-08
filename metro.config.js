const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.resolver.unstable_enableSymlinks = true;
// lucide-react-native exports can point at missing entry files with package exports enabled
config.resolver.unstable_enablePackageExports = false;

const pinnedPackages = [
  "expo",
  "expo-modules-core",
  "expo-constants",
  "expo-splash-screen",
  "expo-audio",
  "expo-file-system",
  "expo-image-picker",
  "expo-secure-store",
  "expo-status-bar",
  "expo-video",
];

config.resolver.extraNodeModules = pinnedPackages.reduce((acc, name) => {
  acc[name] = path.resolve(projectRoot, "node_modules", name);
  return acc;
}, {});

module.exports = config;
