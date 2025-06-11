/**
 * Internal dependencies
 */
const themeJson = require('./theme.json');

describe('Theme JSON', () => {
	it('should add version', () => {
		expect(themeJson.version).toBe(3);
	});

	it('should merge', () => {
		// From .mjs file
		expect(themeJson.settings.border.radius).toBeFalsy();

		// From plugin
		expect(themeJson.settings.border.width).toBeTruthy();
	});
});
