import { TextDocument, Position, CancellationToken, Hover, Range, MarkdownString } from 'vscode';
import { uniqueAttributes, newClassObject, allAttributes } from './createObject';

const acceptedLanguages = ['javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'html'];

export function hoverProvider(document: TextDocument, position: Position, tooken: CancellationToken, acceptedStyling: string[]) {
    const _DOCUMENT_LINE = document.lineAt(position);
    const line = document.lineAt(position).text.trim(); // The string of the current row
    const newPosition = position.character - (_DOCUMENT_LINE.text.length - line.length);


    // console.log(document.getText()); --> Gets the entire text
    // console.log(position.line); --> get line row

    // Get the word at the current hover position
    const wordRange = document.getWordRangeAtPosition(position);
    const word = wordRange ? document.getText(wordRange) : '';

    // The string from start to the position of hover
    const stringToPosition = line.substring(0, newPosition);
    // The string from position of hover until end
    const stringAfterPostion = line.substring(newPosition, line.length);

    const finalString = formatString(stringToPosition, stringAfterPostion);

    const stringArray = finalString
        .split(' ')
        .map((e) => {
            if (e.includes("=")) {
                const x = e.split("=").map((y) => {
                    return y.replace(/["'`]/g, '');
                });

                return x.splice(1);
            } else {
                return e.replace(/["'`]/g, '');
            }
        })
        .flat();

    // Find the first occurrence of '='
    const startIndex = line.indexOf("=");
    // This method does not work as intended...
    if (startIndex !== -1) {
        const trimmedString = line.trim();
        const elementProperty = trimmedString.substring(0, startIndex);

        // If the word has a space --> Usually the string looks like this: <div className
        if (elementProperty.includes(" ")) {
            const spaceIndex = elementProperty.indexOf(" ");
            const fixedElementProperty = elementProperty.substring(spaceIndex + 1, elementProperty.length);

            if (acceptedLanguages.includes(document.languageId) && acceptedStyling.includes(fixedElementProperty)) {
                //vscode.commands.executeCommand('editor.action.triggerSuggest');
                return generateSuggestion(_DOCUMENT_LINE.text, position, stringArray);
            } else {
                return;
            }

        } else {
            // The property is within accepted properties
            if (acceptedLanguages.includes(document.languageId) && acceptedStyling.includes(elementProperty)) {
                //vscode.commands.executeCommand('editor.action.triggerSuggest');
                return generateSuggestion(_DOCUMENT_LINE.text, position, stringArray);
            } else {
                return;
            }
        }
    }


    function generateSuggestion(line: string, position: Position, stringArray: string[]) {
        const string = stringArray[0];
        const startIndex = line.indexOf(string);

        // Create the documentation
        const documentation = new MarkdownString(string, true);

        interface Suggestion {
            [key: string]: {
                score: number
            }
        }
        const suggestions = new Object as Suggestion;


        if(allAttributes[string]){
            console.log(allAttributes[string]);
            documentation.appendCodeblock(allAttributes[string].toString(), 'css');
        }

        if (startIndex !== -1) {
            // Calculate the ending position by adding the length of the substring
            const endIndex = startIndex + string.length - 1;

            const customRange = new Range(
                new Position(position.line, startIndex),
                new Position(position.line, endIndex + 1)
            );

            return new Hover(documentation, customRange);

        } else {
            console.log('Substring not found in the input string.');
            return new Hover(stringArray[0]);
        }
    }
}

function formatString(stringToPosition: string, stringAfterPostion: string) {
    const lastSpaceIndexTo = stringToPosition.lastIndexOf(' ');
    const spaceIndexAfter = stringAfterPostion.indexOf(' ');

    let firstString: null | string = null;
    let lastString: null | string = null;

    /*
        If spaceIndexAfter is -1, that means that there is no space after the
        className:

        'bg-100 fs' + '-100prc' --> no space
    */

    if (spaceIndexAfter === -1) {
        lastString = stringAfterPostion;
    } else {
        lastString = stringAfterPostion.substring(0, spaceIndexAfter);
    }

    if (lastSpaceIndexTo > -1) {
        firstString = stringToPosition.substring(lastSpaceIndexTo, stringToPosition.length);
    } else {
        firstString = stringToPosition;
    }

    return `${firstString}${lastString}`.trim();
}