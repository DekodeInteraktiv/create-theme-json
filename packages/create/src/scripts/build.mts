/**
 * Internal dependencies
 */
import build from '../lib/build.mjs';
import { logInfo, logError, logSuccess } from '../utils/logger.mjs';

/**
 * Executes the build process.
 */
async function executeBuild() {
	try {
		logInfo('Starting build process...');
		await build();
		logSuccess('Build process completed successfully.');
	} catch (error) {
		logError(
			'Error during build process',
			error instanceof Error ? error : undefined,
		);
	}
}

executeBuild();
