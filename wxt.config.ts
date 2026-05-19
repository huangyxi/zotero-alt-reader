import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { build } from 'vite';
import { defineConfig, type Wxt } from 'wxt';

import pkg from './package.json';
import { docComments } from './utils/comments';
import { getGitInfo } from './utils/gitinfo';

const { version_name, tag } = await getGitInfo();

const comments = [
	`${pkg.homepage}`,
	`${pkg.config.pluginName} ${version_name}`,
	`Build date: ${new Date().toISOString()}`,
];
if (process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID) {
	comments.push(
		`GitHub Actions Build URI: ${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
	);
}

const REPLACEMENT_DEFINES = {
	__PLUGIN_INSTANCE__: JSON.stringify(pkg.config.pluginInstance),
};

export default defineConfig({
	srcDir: 'src',
	manifestVersion: 2,
	manifest: {
		name: pkg.config.pluginName,
		version: version_name,
		description: pkg.description,
		// @ts-expect-error - Zotero doesn't support the email format for the author field
		author: pkg.author,
		homepage_url: pkg.homepage,
		applications: {
			zotero: {
				id: pkg.config.pluginId,
				update_url: `${pkg.homepage}/releases/download/release/update.json`,
				...pkg.config.zoteroVersion,
			},
		},
	},
	suppressWarnings: {
		firefoxDataCollection: true,
	},
	zip: {
		name: pkg.name,
		artifactTemplate: '{{name}}-{{version}}.xpi',
	},
	vite: () => ({
		build: {
			minify: false,
			rolldownOptions: {
				output: {
					banner: docComments(comments),
				},
			},
		},
		define: REPLACEMENT_DEFINES,
	}),
	hooks: {
		// Build bootstrap.js using Vite
		'build:done': async (wxt: Wxt) => {
			const targetDir = wxt.config.outDir;
			await build({
				configFile: false,
				build: {
					emptyOutDir: false,
					outDir: targetDir,
					minify: false,
					rolldownOptions: {
						output: {
							banner: docComments(comments),
						},
					},
					lib: {
						entry: 'src/bootstrap.ts',
						name: '_ZoteroBootstrap',
						formats: ['iife'],
						fileName: () => 'bootstrap.js',
					},
				},
				define: REPLACEMENT_DEFINES,
			});
		},
		// Generate update.json for GitHub Releases
		'zip:done': async (wxt: Wxt, zipFiles: string[]) => {
			const zipFile = zipFiles[0];
			const fileBuffer = await fs.readFile(zipFile);
			const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
			const updateInfo = {
				addons: {
					[pkg.config.pluginId]: {
						updates: [
							{
								version: version_name,
								update_link: `${pkg.homepage}/releases/download/${tag}/${path.basename(zipFile)}`,
								update_hash: `sha256:${hash}`,
								applications: {
									zotero: pkg.config.zoteroVersion,
								},
							},
						],
					},
				},
			};
			const outputPath = path.join(wxt.config.outBaseDir, 'update.json');
			await fs.writeFile(outputPath, JSON.stringify(updateInfo, null, '\t'), 'utf-8');
			wxt.logger.success(`Generated update.json at ${outputPath}`);
		},
	},
});
