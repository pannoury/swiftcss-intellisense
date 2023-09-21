import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { createObject, extractInputString, processLineString } from './createObject';
import rangeReplace from './rangeReplace';

export interface BaseStyle {
	[key: string]: string[];
}
export interface StyleObject {
	[key: string]: string[]
}

export interface Subscriptions {
	[key: string]: { //language_id?
		id?: any,
		dispose: any
	}
}

export interface Config {
	fileExtensions: any[string]
	directories: any[string]
	input: string
	output: string
	screens: {
		[key: string]: { [key: string]: number }
	}
}

export const classNameObject = new Object as StyleObject;
export const attributeObject = new Object as StyleObject;

export async function activate(context: vscode.ExtensionContext) {
	let config: Config | undefined | null; // Will hold the config file
	const extensionDir = vscode.extensions.getExtension('PatrickTannoury.swiftcss')!.extensionPath;
	const styleCSS = fs.readFileSync(path.join(extensionDir, 'style.css'), 'utf-8');
	createObject(styleCSS, classNameObject, attributeObject);

	const acceptedStyling = ['className', 'style-light', 'style-dark']; // We will push in screens provided in config file

	try {
		const configFile = await vscode.workspace.findFiles('**/swiftcss.config.js');
		if (configFile.length > 0) {
			// Construct the path to the config file
			config = require(path.resolve(configFile[0].fsPath)) as Config;

			Object.keys(config.screens).forEach((screenKey) => {
				const mediaQueryString = `style-${screenKey}`;
				acceptedStyling.push(mediaQueryString);
			});
		}
	} catch (err) {
		vscode.window.showErrorMessage("Missing swiftcss.config.js, please run 'npx swiftcss init' to create a config file, and then reactive this extension");
		deactivate();
	}

	// Register a "Hello World" command
	const disposable = vscode.commands.registerCommand('swiftcss.helloWorld', () => {
		//loadingMessage = vscode.window.showInformationMessage('Loading Extension...', 'Cancel');
		vscode.window.showInformationMessage('SwiftCSS is ready to be used!');
	});

	const _provideCompletionItems = {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
			const lineString = document.lineAt(position).text;

			// We use Regex to extract the part that we are interested in
			//const processedString = processLineString(lineString, position.character);


			// Returns the string of what we actually are writing
			const currentString = extractInputString(lineString.substring(0, position.character));

			if (!currentString) { return; }

			// Position is an object of c: row number, and e:

			const suggestionArray = new Array;
			const uniqueLabels = new Set();

			const spaceIndex = rangeReplace(document, lineString, position);

			const completionItems: vscode.CompletionItem[] = new Array;

			// When user is typing a CSS classname
			for (const key in classNameObject) {
				try {
					if (key.includes(currentString)) {
	
						// Create the window that will show information
						const documentation = new vscode.MarkdownString();
						// Each key has an array, so we need to iterate through and 
						// append the attribute (multi attribute) the key holds
						classNameObject[key].forEach((attribute) => {
							documentation.appendCodeblock(`${attribute.trim()}`, 'css');
						});
	
						// @ts-ignore
						//const rangeToReplace = new vscode.Range(spaceIndex, position.character);
	
						console.log(rangeToReplace);
	
						const commitCharacterCompletion = new vscode.CompletionItem(key);
						commitCharacterCompletion.commitCharacters = ['.'];
						commitCharacterCompletion.documentation = documentation;
						commitCharacterCompletion.filterText = key;
						commitCharacterCompletion.detail = key;
						//commitCharacterCompletion.range = rangeToReplace;
	
						// Add the completion item to the list
						if (!uniqueLabels.has(key)) {
							suggestionArray.push(commitCharacterCompletion);
							uniqueLabels.add(key);
						}
					}
				} catch (err) {
					console.log(`Error in parsing classNames: ${err}`);
				}
			}

			// When user is writing a CSS attribute
			for (const key in attributeObject) {
				// Check if the attribute matches the typed text
				if (key.includes(currentString) || currentString.includes(key)) {
					const _PRE_CLASS_NAME = attributeObject[key];

					_PRE_CLASS_NAME.forEach((className) => {
						if (_PRE_CLASS_NAME.length === 1) {
							// Create the window that will show information
							const documentation = new vscode.MarkdownString();
							// Each key has an array, so we need to iterate through and 
							// append the attribute (multi attribute) the key holds
							documentation.appendCodeblock(`${className.trim()}`, 'css');

							const commitCharacterCompletion = new vscode.CompletionItem(`${key}`);
							commitCharacterCompletion.insertText = `${className}`;
							commitCharacterCompletion.filterText = className;
							commitCharacterCompletion.commitCharacters = ['.'];
							commitCharacterCompletion.documentation = documentation;
							commitCharacterCompletion.detail = key;
							//commitCharacterCompletion.range = new vscode.Range(position, position);

							// Add the completion item to the list
							if (!uniqueLabels.has(key)) {
								suggestionArray.push(commitCharacterCompletion);
								uniqueLabels.add(key);
							}
						}
					});
				}
			}

			pseudoClasses.forEach((pseudoClass) => {
				if (currentString.includes(pseudoClass) || pseudoClass.includes(currentString)) {
					// Create the window that will show information
					const documentation = new vscode.MarkdownString();
					documentation.appendCodeblock(`Attribute triggered when user ${pseudoClass}.`);
					documentation.appendCodeblock(`Specified by ${pseudoClass}:<SwiftCSS class>`);

					const commitCharacterCompletion = new vscode.CompletionItem(`${pseudoClass}:`, 6);
					commitCharacterCompletion.commitCharacters = ['.'];
					commitCharacterCompletion.documentation = documentation;
					commitCharacterCompletion.detail = `${pseudoClass}: Add a CSS attribute to be triggered when user makes a certain action`;

					suggestionArray.push(commitCharacterCompletion);
					uniqueLabels.add(pseudoClass);
				}
			});

			dynamicClasses.forEach((dynamicClass) => {
				if (currentString.includes(dynamicClass) || dynamicClass.includes(currentString)) {
					// Create the window that will show information
					const documentation = new vscode.MarkdownString();
					documentation.appendCodeblock(`${dynamicClass}-[#000] or ${dynamicClass}-[#f4f4f4]`);

					const commitCharacterCompletion = new vscode.CompletionItem(`${dynamicClass}-`, 6);
					commitCharacterCompletion.commitCharacters = ['.'];
					commitCharacterCompletion.documentation = documentation;
					commitCharacterCompletion.detail = `Dynamic class that allows you to specify the CSS attribute within the square brackets "[]". Value for bg & color has to start with "#" followed by 3 or 6 characters`;

					suggestionArray.push(commitCharacterCompletion);
					uniqueLabels.add(dynamicClass);
				}
			});

			completionItems.push(...new Set(suggestionArray));
			//vscode.window.showInformationMessage('SwiftCSS is ready to be used!');
			//loadingMessage?.dispose();

			return completionItems;
		},
	};

	// Register the provider for multiple file types
	// Add the language IDs you want to support
	const supportedLanguages = ['html', 'typescript', 'php', 'javascriptreact', 'typescriptreact', 'plaintext', 'javascript', 'json'];
	supportedLanguages.forEach((language) => {
		try{
			context.subscriptions.push(disposable, vscode.languages.registerCompletionItemProvider(
				{ scheme: 'file', language: `${language}` },
				_provideCompletionItems
			));
		} catch(err){
			console.log(`Error occurred: ${err}`);
		}
	});

	// When the user makes an edit
	vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
		const acceptedLanguages = ['javascript', 'javascriptreact', 'typescript', 'typesscriptreact'];
		const position = event.contentChanges[0].range.start;
		// Get the entire line string where the change occurred
		const line = event.document.lineAt(position.line).text;
		let elementProperty: null | {
			extractedString: string
			property: string
		};

		// Find the first occurrence of '<'
		const startIndex = line.indexOf('<');

		if (startIndex !== -1) {
			// Find the first space after '<'
			const spaceIndex = line.indexOf(' ', startIndex);

			if (spaceIndex !== -1) {
				// Extract the substring from '<' to the first space
				const extractedString = line.substring(spaceIndex + 1, line.length);

				const elementProperty = {
					extractedString: extractedString,
					property: extractedString.substring(0, extractedString.indexOf('='))
				};

				// The property is within accepted properties
				if (acceptedLanguages.includes(event.document.languageId) && acceptedStyling.includes(elementProperty?.property)) {
					vscode.commands.executeCommand('editor.action.triggerSuggest');
				}
			}
		}

	});

	// When user changes the document of focus
	vscode.window.onDidChangeActiveTextEditor((event: vscode.TextEditor | undefined) => {
		console.log(event);
	});

	vscode.languages.registerHoverProvider('javascript', {
		provideHover(document, position, token) {
			return {
				contents: ['Hover Content']
			};
		}
	});
}

export function deactivate() { }

const dynamicClasses = [
	'bg', 'color', 'content', 'text'
];

const pseudoClasses = [
	'active',
	'any',
	'any-link',
	'checked',
	'default',
	'defined',
	'dir',
	'disabled',
	'empty',
	'enabled',
	'first',
	'first-child',
	'first-of-type',
	'fullscreen',
	'focus',
	'focus-visible',
	'focus-within',
	'has',
	'hover',
	'indeterminate',
	'in-range',
	'invalid',
	'lang',
	'last-child',
	'last-of-type',
	'link',
	'not',
	'nth-child',
	'nth-last-child',
	'nth-last-of-type',
	'nth-of-type',
	'only-child',
	'only-of-type',
	'optional',
	'out-of-range',
	'placeholder-shown',
	'read-only',
	'read-write',
	'required',
	'root',
	'scope',
	'target',
	'target-within',
	'user-invalid',
	'valid',
	'visited',
	// Logical Combinations
	'is',
	'where',
];

const pseudoElements = [
	'after',
	'before',
	'first-line',
	'selection',
	'placeholder',
	'marker',
	'backdrop',
	'cue',
	'part',
	'slotted'
];