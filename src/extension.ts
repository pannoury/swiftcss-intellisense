import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { createObject } from './createObject';
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



export async function activate(context: vscode.ExtensionContext) {
	let config: Config | undefined | null; // Will hold the config file
	const extensionDir = vscode.extensions.getExtension('PatrickTannoury.swiftcss')!.extensionPath;
	const styleCSS = fs.readFileSync(path.join(extensionDir, 'style.css'), 'utf-8');
	const completionItems = createObject(styleCSS);

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
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext){
			//const lineString = document.lineAt(position).text;

			// We use Regex to extract the part that we are interested in
			//const processedString = processLineString(lineString, position.character);


			// Returns the string of what we actually are writing
			//const currentString = extractInputString(lineString.substring(0, position.character));

			// Position is an object of c: row number, and e

			//const spaceIndex = rangeReplace(document, lineString, position);

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