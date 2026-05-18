import { defineConfig, type Wxt } from 'wxt';
import { build } from 'vite';
import { getGitInfo } from './utils/gitinfo';
import pkg from './package.json';

const { version } = await getGitInfo();

export default defineConfig({
	srcDir: 'src',
	manifestVersion: 2,
	manifest: {
		name: pkg.config.pluginName,
		version: version,
		description: pkg.description,
		// @ts-ignore - Zotero doesn't support the email format for the author field
		author: pkg.author,
		homepage_url: pkg.homepage,
		applications: {
			zotero: {
				id: pkg.config.pluginId,
				update_url: `${pkg.homepage}/releases/download/release/update.json`,
				strict_min_version: '9.0',
				strict_max_version: '9.*'
			}
		}
	},
	suppressWarnings: {
		'firefoxDataCollection': true
	},
	zip: {
		name: pkg.name,
		artifactTemplate: '{{name}}-{{version}}.xpi'
	},
	vite: () => ({
		define: {
			__PLUGIN_INSTANCE__: JSON.stringify(pkg.config.pluginInstance)
		}
	}),
	hooks: {
		'build:done': async (wxt: Wxt) => {
			const targetDir = wxt.config.outDir || '.output/firefox-mv2';
			await build({
				configFile: false,
				build: {
					emptyOutDir: false,
					outDir: targetDir,
					lib: {
						entry: 'src/bootstrap.ts',
						name: '_ZoteroBootstrap',
						formats: ['iife'],
						fileName: () => 'bootstrap.js'
					}
				},
				define: {
					__PLUGIN_INSTANCE__: JSON.stringify(pkg.config.pluginInstance)
				}
			});
		}
	}
});
