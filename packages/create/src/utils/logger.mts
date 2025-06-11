/**
 * External dependencies
 */
import pc from 'picocolors';

/**
 * Logs an informational message.
 * @param {string} message - The message to log.
 */
export function logInfo(message: string): void {
	console.log(pc.blue(`[INFO] ${message}`));
}

/**
 * Logs a warning message.
 * @param {string} message - The message to log.
 */
export function logWarning(message: string): void {
	console.warn(pc.yellow(`[WARNING] ${message}`));
}

/**
 * Logs an error message.
 * @param {string} message - The message to log.
 * @param {Error} [error] - Optional error object for additional details.
 */
export function logError(message: string, error?: Error): void {
	console.error(pc.red(`[ERROR] ${message}`));
	if (error) {
		console.error(pc.red(error.stack || error.message));
	}
}

/**
 * Logs a success message.
 * @param {string} message - The message to log.
 */
export function logSuccess(message: string): void {
	console.log(pc.green(`[SUCCESS] ${message}`));
}
