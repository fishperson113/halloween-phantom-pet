/**
 * Verification script to check that all resource paths exist
 * This simulates what the packaged extension will need
 */

const fs = require('fs');
const path = require('path');

console.log('Verifying resource file paths for packaged extension...\n');

let allPassed = true;

// Check compiled output
const requiredOutputFiles = [
  'out/extension.js',
  'out/webview/petView.js',
  'out/webview/petView.css',
  'out/webview/petView.html'
];

console.log('Checking compiled output files:');
for (const file of requiredOutputFiles) {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allPassed = false;
}

// Check sprite resources
const requiredSprites = [
  'resources/sprites/ghost-sprites.png',
  'resources/sprites/pumpkin-sprites.png',
  'resources/sprites/skeleton-sprites.png'
];

console.log('\nChecking sprite resources:');
for (const file of requiredSprites) {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allPassed = false;
}

// Check icon resource
const requiredIcons = [
  'resources/ghost-icon.svg'
];

console.log('\nChecking icon resources:');
for (const file of requiredIcons) {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allPassed = false;
}

// Verify package.json icon paths are relative
console.log('\nChecking package.json icon paths:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const iconPaths = [
  packageJson.contributes?.viewsContainers?.activitybar?.[0]?.icon,
  packageJson.contributes?.views?.['spooky-pets']?.[0]?.icon
];

for (const iconPath of iconPaths) {
  if (iconPath) {
    const isRelative = !path.isAbsolute(iconPath) && !iconPath.startsWith('/');
    const exists = fs.existsSync(iconPath);
    console.log(`  ${isRelative && exists ? '✓' : '✗'} ${iconPath} (relative: ${isRelative}, exists: ${exists})`);
    if (!isRelative || !exists) allPassed = false;
  }
}

// Verify PetPanelProvider uses correct paths
console.log('\nChecking PetPanelProvider resource path patterns:');
const providerSource = fs.readFileSync('out/providers/PetPanelProvider.js', 'utf8');

const checks = [
  {
    name: 'Uses asWebviewUri for sprites',
    pattern: /asWebviewUri/,
    expected: true
  },
  {
    name: 'Uses Uri.joinPath for resources',
    pattern: /Uri\.joinPath.*resources.*sprites/,
    expected: true
  },
  {
    name: 'CSS path uses out/webview',
    pattern: /out.*webview.*petView\.css/,
    expected: true
  },
  {
    name: 'JS path uses out/webview',
    pattern: /out.*webview.*petView\.js/,
    expected: true
  }
];

for (const check of checks) {
  const matches = check.pattern.test(providerSource);
  const passed = matches === check.expected;
  console.log(`  ${passed ? '✓' : '✗'} ${check.name}`);
  if (!passed) allPassed = false;
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✓ All resource path checks passed!');
  console.log('Extension is ready for packaging.');
  process.exit(0);
} else {
  console.log('✗ Some resource path checks failed.');
  console.log('Please review the issues above.');
  process.exit(1);
}
