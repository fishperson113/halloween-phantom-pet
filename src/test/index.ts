import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
    timeout: 10000
  });

  const testsRoot = path.resolve(__dirname);
  console.log('Tests root:', testsRoot);

  const files = await glob('**/*.test.js', { cwd: testsRoot });
  console.log('Found test files:', files);

  // Add files to the test suite
  files.forEach(f => {
    const fullPath = path.resolve(testsRoot, f);
    console.log('Adding test file:', fullPath);
    mocha.addFile(fullPath);
  });

  return new Promise((resolve, reject) => {
    try {
      // Run the mocha test
      mocha.run(failures => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
