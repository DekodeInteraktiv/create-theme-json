/**
 * External dependencies
 */
import chokidar, { FSWatcher } from 'chokidar';

/**
 * Internal dependencies
 */
import build from '../lib/build.mjs';
import { getConfig, Config } from '../utils/config.mjs';
import { logInfo, logError, logSuccess } from '../utils/logger.mjs';
import { validateAndResolvePath } from '../utils/path-utils.mjs';

async function initializeWatcher() {
	try {
		const configs = await getConfig();

		// Dynamically determine the base directory (e.g., from the first config)
		const baseDir = determineBaseDirectory(configs);

		// Perform an initial build
		await performInitialBuild();

		// Extract root directories to watch
		const roots = extractWatchRoots(configs, baseDir);

		// Start watching for file changes
		startWatching(roots, baseDir);
	} catch (error) {
		logError(
			'Error initializing watcher',
			error instanceof Error ? error : undefined,
		);
	}
}

/**
 * Dynamically determines the base directory from the configuration.
 * @param {Array} configs - The configuration array.
 * @returns {string} - The base directory.
 */
function determineBaseDirectory(configs: Array<Config>) {
	if (!configs || configs.length === 0) {
		throw new Error(
			'No configurations found to determine the base directory.',
		);
	}

	const baseDir = configs[0]?.src
		? validateAndResolvePath(process.cwd(), configs[0].src)
		: (() => {
				throw new Error(
					'The first configuration is missing or invalid.',
				);
			})();
	logInfo(`Base directory determined: ${baseDir}`);
	return baseDir;
}

async function performInitialBuild() {
	try {
		logInfo('Starting initial build...');
		await build();
		logSuccess('Initial build completed successfully.');
	} catch (error) {
		logError(
			'Error during initial build',
			error instanceof Error ? error : undefined,
		);
	}
}

/**
 * Extracts and validates root directories to watch.
 * @param {Array} configs - The configuration array.
 * @param {string} baseDir - The base directory.
 * @returns {Array<string>} - The validated root directories.
 */
function extractWatchRoots(configs: Array<Config>, baseDir: string) {
	return configs.map((config) => validateAndResolvePath(baseDir, config.src));
}

/**
 * Starts watching the specified directories for changes.
 * @param {Array<string>} roots - The directories to watch.
 * @param {string} baseDir - The base directory.
 */
function startWatching(roots: Array<string>, baseDir: string) {
	const ignoredPatterns = /.*\.temp-fresh-import\.[mc]js$/;

	logInfo(`Watching for changes in: ${roots.join(', ')}`);

	// Explicitly declare the watcher type
	const watcher: FSWatcher = chokidar.watch(roots, {
		ignoreInitial: true,
		ignored: ignoredPatterns,
	});

	// Inline type for the event handler
	const watcherEventHandler: (
		event: string,
		filePath: string,
	) => Promise<void> = async (event, filePath) => {
		try {
			const resolvedPath = validateAndResolvePath(baseDir, filePath);
			logInfo(`File ${event}: ${resolvedPath}`);
			await handleFileChange();
		} catch (error) {
			logError(
				'Blocked unauthorized access attempt',
				error instanceof Error ? error : undefined,
			);
		}
	};

	// Inline type for the error handler
	const watcherErrorHandler: (error: unknown) => void = (error) => {
		if (error instanceof Error) {
			logError('Watcher error', error);
		} else {
			logError('Watcher error', undefined);
		}
	};

	watcher.on('all', watcherEventHandler).on('error', watcherErrorHandler);
}

async function handleFileChange() {
	try {
		logInfo('Rebuilding due to file changes...');
		await build();
		logSuccess('Rebuild completed successfully.');
	} catch (error) {
		logError(
			'Error during rebuild',
			error instanceof Error ? error : undefined,
		);
	}
}

initializeWatcher();
