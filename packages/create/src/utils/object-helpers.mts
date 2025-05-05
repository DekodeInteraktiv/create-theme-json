/**
 * Converts a string to camelCase.
 * @param {string} str - The string to convert.
 * @returns {string} - The camelCase version of the string.
 */
export function camelCase(str: string): string {
	return str
		.replace(/[-_]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
		.replace(/^(.)/, (char) => char.toLowerCase());
}

/**
 * Sets a value in a nested object using a path array.
 * @param {Record<string, any>} obj - The object to modify.
 * @param {Array<string>} path - The path array to the property.
 * @param {*} value - The value to set.
 * @returns {Record<string, any>} - The updated object.
 */
export function setNestedValue(
	obj: Record<string, any>,
	path: string[],
	value: any,
): Record<string, any> {
	let current = obj;
	for (let i = 0; i < path.length - 1; i++) {
		const key = path[i];
		if (key !== undefined && !current[key]) {
			current[key] = {};
		}
		if (key !== undefined) {
			current = current[key];
		}
	}
	const lastKey = path[path.length - 1];
	if (lastKey !== undefined) {
		current[lastKey] = value;
	}
	return obj;
}

/**
 * Checks if a value is empty (replaces lodash's isEmpty).
 * @param {any} value - The value to check.
 * @returns {boolean} - True if the value is empty, false otherwise.
 */
export function isEmpty(value: any): boolean {
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
