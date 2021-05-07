const { resolve, join } = require('path');
const fs = require('fs');

const ROOT_PATH = resolve(__dirname, '..');
const CONFIG_FILE = join(ROOT_PATH, 'config.dev.js');
const TEMPLATE_FILE = join(ROOT_PATH, 'scripts', 'config.dev.template.js');

// returns a promise which resolves true if file exists:
function checkFileExists(filepath) {
  return new Promise((resolve) => {
    fs.access(filepath, fs.constants.F_OK, (error) => {
      resolve(!error);
    });
  });
}

async function main() {
  const exists = await checkFileExists(CONFIG_FILE);
  if (!exists) {
    fs.copyFileSync(TEMPLATE_FILE, CONFIG_FILE);
  }
  // eslint-disable-next-line no-console
  console.log('done');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
