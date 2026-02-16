const { execSync } = require('child_process');

function checkNodeVersion() {
  const version = process.versions.node;
  const major = parseInt(version.split('.')[0], 10);
  if (major < 18) {
    console.error(`Error: Node.js v18+ is required. Current version: ${version}`);
    process.exit(1);
  }
  console.log(`Node.js version ${version} detected.`);
}

function checkTemporalCLI() {
  try {
    const version = execSync('temporal --version', { stdio: 'pipe' }).toString().trim();
    console.log(`Temporal CLI detected: ${version}`);
  } catch (error) {
    console.error('Error: Temporal CLI not found.');
    console.error('Please install it: winget install Temporal.TemporalCLI (Windows), brew install temporal (macOS), or see README.md');
    process.exit(1);
  }
}

console.log('Checking environment...');
checkNodeVersion();
checkTemporalCLI();
console.log('\nEnvironment is ready!');
