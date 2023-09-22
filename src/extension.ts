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

let cssPath: null | string = null;

export async function activate(context: vscode.ExtensionContext) {
	let config: Config | undefined | null; // Will hold the config file
	const extensionDir = vscode.extensions.getExtension('PatrickTannoury.swiftcss')!.extensionPath;
	const acceptedStyling = ['className', 'style-light', 'style-dark', 'class']; // We will push in screens provided in config file
	
	try {
		const configFile = await vscode.workspace.findFiles('**/swiftcss.config.js');
		if (configFile.length > 0) {
			const hasModuleInstalled = configFile.find((path: vscode.Uri) => String(path).includes('node_modules/swiftcss'));
			if(hasModuleInstalled){
				cssPath = path.resolve(path.join(hasModuleInstalled.fsPath, 'dist', 'src', 'style.css')).replace('swiftcss.config.js/', '');
			} else {
				vscode.window.showErrorMessage("Missing SwiftCSS package, please run 'npm install swiftcss' to install the package");
				deactivate();
			}

			// Construct the path to the config file
			config = require(path.resolve(configFile[0].fsPath)) as Config;

			Object.keys(config.screens).forEach((screenKey) => {
				const mediaQueryString = `style-${screenKey}`;
				acceptedStyling.push(mediaQueryString);
			});
		}
	} catch (err) {
		console.log(err);
		vscode.window.showErrorMessage("Missing swiftcss.config.js, please run 'npx swiftcss init' to create a config file, and then reactive this extension");
		deactivate();
	}

	try {
		//const styleCSS = fs.readFileSync(path.join(extensionDir, 'style.css'), 'utf-8');
		const completionItems = createObject(fs.readFileSync(cssPath as string, 'utf-8') as string);
	
		// Register a "Hello World" command
		const disposable = vscode.commands.registerCommand('swiftcss.helloWorld', () => {
			//loadingMessage = vscode.window.showInformationMessage('Loading Extension...', 'Cancel');
			vscode.window.showInformationMessage('SwiftCSS is ready to be used!');
		});
	
		const _provideCompletionItems = {provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext){ return completionItems; }};
	
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
			const acceptedLanguages = ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'];
			const position = event.contentChanges[0].range.start;
			// Get the entire line string where the change occurred
			const line = event.document.lineAt(position.line).text;
			let elementProperty: null | {
				extractedString: string
				property: string
			};
	
			// Find the first occurrence of '='
			const startIndex = line.trim().indexOf("=");
	
			// This method does not work as intended...
			if (startIndex !== -1) {
				const trimmedString = line.trim();
				const elementProperty = trimmedString.substring(0, startIndex);
				console.log(elementProperty);
	
				// If the word has a space --> Usually the string looks like this: <div className
				if(elementProperty.includes(" ")){
					const spaceIndex = elementProperty.indexOf(" ");
					const fixedElementProperty = elementProperty.substring(spaceIndex +1, elementProperty.length);

					if (acceptedLanguages.includes(event.document.languageId) && acceptedStyling.includes(fixedElementProperty)) {
						vscode.commands.executeCommand('editor.action.triggerSuggest');
					}
				} else {
					// The property is within accepted properties
					if (acceptedLanguages.includes(event.document.languageId) && acceptedStyling.includes(elementProperty)) {
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
		
	} catch (error) {
		console.log(error);
		vscode.window.showErrorMessage("Missing swiftcss.config.js, please run 'npx swiftcss init' to create a config file, and then reactive this extension");
		deactivate();
	}

}

export function deactivate() { }