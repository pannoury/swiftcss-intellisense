import { Position, Range, TextEditor, window, DecorationOptions } from 'vscode';

interface DecorationObject {
    [key: number]: [
        {
            range: Range,
            color: string
        }
    ]
}

export default function updateDecorations(editor: TextEditor){
    //const decorationObject: DecorationObject = new Object;

    console.log(editor.document.getText());
    window.visibleTextEditors.forEach((editor) => {
        const code = editor.document.getText();
        const regex = /\b(?:bg-|#|color-|fill-|brd-color-)\[#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\]/g;

        // Find all matches
        const matches = [...code.matchAll(regex)];
        console.log(matches);

        // Process each match
        matches.forEach((match) => {
            if(match.index){
                const className = match[0]; // color-[#fff]
                const colorCode = `#${match[1]}`; // fff
                /* 
                    match.index --> number
                    match.input --> the string
                */
                console.log(match);
    
                const start = match.index; // Start index of the match
                const end = start + className.length; // End index of match

                // Calculate line and column based on indices
                const position = editor.document.positionAt(start);
                const line = position.line + 1;
                const column = position.character + 1;

                // Create a range for the match
                const range = new Range(
                    new Position(position.line, position.character),
                    new Position(position.line, position.character + className.length)
                );

                const smallDecorator = window.createTextEditorDecorationType({
                    cursor: 'text-edit',
                    before: {
                        width: '10px',
                        height: '10px',
                        contentText: ' ',
                        border: '0.1 em solid',
                        margin: '0.1em 0.2em 0',
                    },
                    dark: {
                        before: {
                          borderColor: '#eeeeee',
                        },
                    },
                    light: {
                        before: {
                          borderColor: '#000000',
                        },
                    },
                });

                const decorationOptions: DecorationOptions[] = [
                    {
                        range: range,
                        renderOptions: {
                            before: {
                                backgroundColor: `${colorCode}`
                            }
                        }
                    }
                ];

                editor.setDecorations(smallDecorator, decorationOptions);
            }
        });
    });
}