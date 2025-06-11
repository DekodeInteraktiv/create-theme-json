/**
 * External dependencies
 */
import { cosmiconfig } from 'cosmiconfig';
import { join } from 'path';
import slash from 'slash';

/**
 * Internal dependencies
 */
import { getCurrentWorkingDirectory } from './process.mjs';
import { addTrailingSlash } from './file.mjs';

export interface Config {
	src: string;
	dest: string;
	addSchema?: boolean;
	pretty?: boolean;
	version: number;
	wpVersion: string;
	plugins: string[];
	name?: string;
}

const defaultConfig: Config = {
	src: 'theme-json',
	dest: 'theme.json',
	addSchema: false,
	pretty: false,
	version: 3,
	wpVersion: 'trunk',
	plugins: [],
	name: '',
};

export async function getConfig(): Promise<Array<Config>> {
	const explorerSync = cosmiconfig('theme-json');

	const config = (await explorerSync.search()) || { config: {} };
	const optimizedConfig: Array<Config> = [];

	if (!Array.isArray(config.config)) {
		config.config = [config.config];
	}

	// Loop through each config object and merge with default config
	for (const currentConfig of config.config) {
		const mergedConfig = {
			...defaultConfig,
			...currentConfig,
		};

		// Make src absolute
		mergedConfig.src = slash(
			join(
				getCurrentWorkingDirectory(),
				addTrailingSlash(mergedConfig.src),
			),
		);

		// Make dest absolute
		mergedConfig.dest = join(
			getCurrentWorkingDirectory(),
			mergedConfig.dest,
		);

		optimizedConfig.push(mergedConfig);
	}

	return optimizedConfig;
}

export async function getPlugins(config: Config) {
	const before = [];
	const after = [];

	for (const plugin of config.plugins) {
		const importedPlugin = await import(plugin);

		if (importedPlugin.before) {
			before.push(importedPlugin.before);
		}

		if (importedPlugin.after) {
			after.push(importedPlugin.after);
		}
	}

	return {
		before,
		after,
	};
}
