/**
 * External dependencies
 */
import { existsSync, readdirSync, promises, unlink } from 'node:fs';
import { join, dirname, extname, basename, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const fromScriptsRoot = (scriptName: string) =>
	join(dirname(__dirname), 'scripts', `${scriptName}.mjs`);

export const hasScriptFile = (scriptName: string) =>
	existsSync(fromScriptsRoot(scriptName));

export const getScripts = (): string[] =>
	readdirSync(join(dirname(__dirname), 'scripts'))
		.filter((f) => extname(f) === '.mjs')
		.map((f) => basename(f, '.mjs'));

export const addTrailingSlash = (filePath: string) =>
	filePath.endsWith('/') ? filePath : `${filePath}/`;

/**
 * Import a module fresh. This is a workaround for the fact that Node.js caches
 * modules after the first import.
 *
 * @see https://github.com/nodejs/modules/issues/307
 */
export async function importFresh(modulePath: string): Promise<any> {
	const filepath = resolve(modulePath);
	const fileContent = await promises.readFile(filepath, 'utf8');
	const ext = extname(filepath);
	const extRegex = new RegExp(`\\${ext}$`);
	const newFilepath = `${filepath.replace(
		extRegex,
		'',
	)}${Date.now()}.temp-fresh-import${ext}`;

	await promises.writeFile(newFilepath, fileContent);

	// @ts-expect-error - Fixes a Windows issue
	const module = await import(pathToFileURL(newFilepath)).catch((err) => {
		unlink(newFilepath, () => {});
		console.log(err.stack.replace(pathToFileURL(newFilepath), modulePath));
		return { default: '' };
	});

	unlink(newFilepath, () => {});

	return module;
}
