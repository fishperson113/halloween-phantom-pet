import { defineConfig } from '@vscode/test-cli';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
	tests: [{
		files: 'out/test/**/*.test.js',
		workspaceFolder: __dirname,
		mocha: {
			ui: 'bdd',
			timeout: 10000
		}
	}],
	launchArgs: [
		'--disable-extensions',
		'--skip-welcome',
		'--skip-release-notes',
		'--no-sandbox',
		'--user-data-dir=' + __dirname + '/.vscode-test-user-data'
	],
	extensionDevelopmentPath: __dirname
});
