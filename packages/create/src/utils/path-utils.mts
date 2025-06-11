import path from 'node:path';

/**
 * Validates and resolves a given path to ensure it is within the allowed base directory.
 * @param {string} baseDir - The base directory to restrict access to.
 * @param {string} targetPath - The path to validate and resolve.
 * @returns {string} - The resolved and validated path.
 * @throws {Error} - If the resolved path is outside the base directory.
 */
interface ValidateAndResolvePathParams {
	baseDir: string;
	targetPath: string;
}

export function validateAndResolvePath(
	baseDir: ValidateAndResolvePathParams['baseDir'],
	targetPath: ValidateAndResolvePathParams['targetPath'],
): string {
	const resolvedBaseDir = path.resolve(baseDir);
	const resolvedPath = path.resolve(resolvedBaseDir, targetPath);

	if (!resolvedPath.startsWith(resolvedBaseDir)) {
		throw new Error(
			`Invalid path detected: ${resolvedPath} is outside the base directory.`,
		);
	}

	return resolvedPath;
}
