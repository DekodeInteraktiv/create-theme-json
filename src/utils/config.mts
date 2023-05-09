/**
 * External dependencies
 */
import { cosmiconfig } from 'cosmiconfig';

const defaultConfig = {
	validateSchema: true,
	addSchema: false,
	wpVersion: 'trunk',
	plugins: [],
	src: 'theme-json',
};

export async function getConfig() {
	const explorerSync = cosmiconfig('theme-json');

	const config = (await explorerSync.search()) || { config: {} };

	return {
		...defaultConfig,
		...config.config,
	};
}

export async function getPlugins() {
	const config = await getConfig();
	const plugins = [];

	for (const plugin of config.plugins) {
		const pluginFile = await import(plugin);
		plugins.push(pluginFile.default);
	}

	return plugins;
}