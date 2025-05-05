/**
 * External dependencies
 */
import { readFileSync, writeFileSync } from 'node:fs';
import fastGlob from 'fast-glob';
import deepMerge from 'deepmerge';

/**
 * Internal dependencies
 */
import { getConfig, getPlugins, Config } from '../utils/config.mjs';
import { logInfo, logError, logSuccess } from '../utils/logger.mjs';
import {
	camelCase,
	setNestedValue,
	isEmpty,
} from '../utils/object-helpers.mjs';

async function build() {
	try {
		const configs: Array<Config> = await getConfig();

		// Assign default names if not provided
		configs.forEach((config, index) => {
			config.name = config.name || `config-${index}`;
		});

		for (const config of configs) {
			logInfo(`Building theme.json for config: ${config.name}`);
			const themeJson = await generateThemeJson({
				...config,
			});
			writeFileSync(
				config.dest,
				JSON.stringify(themeJson, null, config.pretty ? '\t' : ''),
			);
			logSuccess(`theme.json created at ${config.dest}`);
		}
	} catch (error) {
		logError(
			'Error during build process',
			error instanceof Error ? error : undefined,
		);
	}
}

async function generateThemeJson(config: Config) {
	try {
		const { src, version, addSchema, wpVersion } = config;
		const plugins = await getPlugins(config);

		let themeJson: { version: number; $schema?: string } = { version };

		if (addSchema) {
			const schemaVersion =
				wpVersion === 'trunk' ? 'trunk' : `wp/${wpVersion}`;
			themeJson.$schema = `https://schemas.wp.org/${schemaVersion}/theme.json`;
		}

		if (plugins.before.length) {
			for (const plugin of plugins.before) {
				themeJson = await plugin(themeJson, config);
			}
		}

		const files = fastGlob.sync(`${src}**/*`, {
			ignore: [`${src}**/*.temp-fresh-import.{mjs,cjs}`],
		});

		for (const file of files) {
			logInfo(`Processing file: ${file}`);
			const fileConfig = await processFile(file, src);
			if (fileConfig) {
				themeJson = {
					...deepMerge(themeJson, fileConfig),
					version: themeJson.version,
				};
			}
		}

		if (plugins.after.length) {
			for (const plugin of plugins.after) {
				themeJson = await plugin(themeJson, config);
			}
		}

		return themeJson;
	} catch (error) {
		logError(
			'Error generating theme.json',
			error instanceof Error ? error : undefined,
		);

		throw error;
	}
}

interface FileConfig {
	[key: string]: any;
}

async function processFile(
	file: string,
	src: string,
): Promise<FileConfig | undefined> {
	try {
		let fileConfig: FileConfig | undefined;

		if (file.endsWith('.cjs') || file.endsWith('.mjs')) {
			const importedFile = await import(file);
			fileConfig = importedFile.default;

			if (typeof fileConfig === 'function') {
				fileConfig = fileConfig();
			}
		} else if (file.endsWith('.json')) {
			const content = readFileSync(file, { encoding: 'utf-8' });
			fileConfig = JSON.parse(content) as FileConfig;
		} else {
			throw new Error(`Unsupported file type: ${file}`);
		}

		if (fileConfig && !isEmpty(fileConfig)) {
			const destination = file.replace(src, '').replace(/\.[^/.]+$/, '');
			const splittedDestination = destination.split('/blocks/');

			let dest: string[] = (splittedDestination[0] ?? '')
				.split('/')
				.map(camelCase);

			if (splittedDestination[1]) {
				const [blockNamespace, blockName, ...blockDest] =
					splittedDestination[1].split('/');
				dest = [
					...dest,
					'blocks',
					`${blockNamespace}/${blockName}`,
					...blockDest,
				];
			}

			return setNestedValue({}, dest, fileConfig);
		}

		return undefined; // Explicitly return undefined if no fileConfig is found
	} catch (error) {
		logError(
			`Error processing file: ${file}`,
			error instanceof Error ? error : undefined,
		);

		throw error;
	}
}

export default build;
