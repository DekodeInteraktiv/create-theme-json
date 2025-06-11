/**
 * External dependencies
 */
import AvjDraft04, { AnySchema as Draft04Schema } from 'ajv-draft-04';
import AjvDraft07, { AnySchema as Draft07Schema } from 'ajv';
import axios from 'axios';

/**
 * Internal dependencies
 */
import { errorsText } from './utils.mjs';

let schema: {
	data: Draft04Schema | Draft07Schema;
};

/**
 * Detects the schema version and returns the appropriate AJV instance.
 * @param {AnySchema} schema - The JSON schema.
 * @returns {AjvDraft04 | AjvDraft07} - The appropriate AJV instance.
 */
function getSchemaChecker(schema: Draft04Schema | Draft07Schema) {
	if (
		schema &&
		typeof schema === 'object' &&
		'$schema' in schema &&
		typeof (schema as { $schema: string }).$schema === 'string' &&
		(schema as { $schema: string }).$schema ===
			'http://json-schema.org/draft-04/schema#'
	) {
		return new AvjDraft04({
			allErrors: true,
			strict: true,
			allowMatchingProperties: true,
		});
	} else if (
		schema &&
		typeof schema === 'object' &&
		'$schema' in schema &&
		typeof (schema as { $schema: string }).$schema === 'string' &&
		(schema as { $schema: string }).$schema ===
			'http://json-schema.org/draft-07/schema#'
	) {
		return new AjvDraft07({
			allErrors: true,
			strict: true,
			allowMatchingProperties: true,
		});
	} else {
		throw new Error(
			`Unsupported schema version: ${(schema as { $schema: string }).$schema}`,
		);
	}
}

export const after = async (
	themeJson: Record<string, unknown>,
	config: Record<string, unknown>,
) => {
	const schemaVersion =
		config['wpVersion'] === 'trunk' ? 'trunk' : `wp/${config['wpVersion']}`;

	if (!schema) {
		schema = await axios.get(
			`https://schemas.wp.org/${schemaVersion}/theme.json`,
		);
	}

	const schemaChecker = getSchemaChecker(schema.data);
	const validate = schemaChecker.compile(schema.data);
	const valid = validate(themeJson);

	if (!valid) {
		console.log('\n‼️  Invalid theme.json\n');
		console.log(errorsText(validate?.errors));
	}

	return themeJson;
};
