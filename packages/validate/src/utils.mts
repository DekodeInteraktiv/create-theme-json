/**
 * External dependencies
 */
import pc from 'picocolors';
import type { ErrorObject } from 'ajv';

/**
 * Checks if a value is empty (replaces lodash's isEmpty).
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is empty, false otherwise.
 */
function isEmpty(value: any): boolean {
	if (value == null) {
		// Null or undefined
		return true;
	}
	if (typeof value === 'string' || Array.isArray(value)) {
		// Empty string or array
		return value.length === 0;
	}
	if (typeof value === 'object') {
		// Empty object
		return Object.keys(value).length === 0;
	}
	return false;
}

export function errorsText(errors: ErrorObject[] | undefined | null): string {
	if (!errors || errors.length === 0) {
		return 'No errors';
	}

	return (
		errors
			.map((err) => {
				if (!isEmpty(err.instancePath)) {
					return `${err.instancePath} ${err.message}`;
				}

				return err.message;
			})
			.reduce((text, msg) => `${text}${pc.red('error')} ${msg}\n`, '') ||
		''
	);
}
