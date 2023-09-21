import { CompletionItem, MarkdownString, ProviderResult } from 'vscode';

export interface StyleObject {
    [key: string]: string[]
}

export interface NewStyleObject {
    [key: string]: {
        metrics?: string[] | null // The array will show supported values
        min?: number
        max?: number
        isDash: boolean
    }
}

export const classNameObject = new Object as StyleObject;
export const attributeObject = new Object as StyleObject;
export const newClassObject = new Object as NewStyleObject;

export function createObject(styleCSS: string) {
    // Create completionItems
    const completionItems: CompletionItem[] = new Array; // Will hold all completionItems in an array
    const suggestionArray = new Array;
    const uniqueLabels = new Set();

    styleCSS.split('}').forEach((styleBlock: string) => {
        const trimmedStyleBlock = styleBlock.trim();

        /*
        let property: string | null = null;

        // Use a regular expression to match content between "{" and "}"
        const matches = trimmedStyleBlock.match(/\{([^}]+)\}/);

        if(matches){
            property = matches[1].trim();
        }
        */

        /* .py-550 {
            padding-top: 550px;
            padding-bottom: 550px;
        }
        */
       let currClassNameMatch: null | any[] = null;
       let errorTrack: null | string = null;
       let errorTrack2: null | string = null;

        try {
            const classNameMatch = trimmedStyleBlock.match(/\.([a-zA-Z0-9_-]+)\s*\{/) as any[];
            currClassNameMatch = classNameMatch;
            const classAttribute = trimmedStyleBlock?.split('{')[1]?.trim();
            errorTrack2 = classAttribute;
            const classAttributes = classAttribute?.split(';')?.filter(item => item !== "");
            const classString = classNameMatch[1]; // border-radius-600-px
            errorTrack = classString;

            // Create the window that will show information
            const classDocumentation = new MarkdownString();
            let classCompletionItem: null | CompletionItem = null;

            // New method, will automatically parse numeric values to int
            const stringArray = classString
                .split('-')
                .map((string: any) => {
                    if (!isNaN(string)) {
                        return parseInt(string);
                    } else {
                        return string;
                    };
                });

            const isNumeric = stringArray.some((string: any) => !isNaN(string));
            // Undefined if no numeric value exists
            /*
                numericValue will not be undefined if it finds a number separated by a '-'
                like in py-100 -> numericValue will be equal to 100

                However, w-600prc will be undefined, so we need to add a logic for that
            */
            const numericValue = stringArray.find((e: any) => !isNaN(e));
            const numberIndex = stringArray.findIndex((string: any) => !isNaN(string));

            let numberValue: null | string = null;
            let metricValue: null | string = null;
            let altClassName: null | string = null;

            // If numericValue is undefined, see if the class ends with something like 100prc
            // numberValue will be null for classes like cursor-pointer
            if (!numericValue && numericValue !== 0) {
                const lastAlphaNumeric = stringArray[stringArray.length - 1]
                    .split('')
                    .map((e: any) => {
                        if (!isNaN(e)) {
                            return parseInt(e);
                        } else {
                            return e;
                        }
                    });

                numberValue = lastAlphaNumeric.filter((e: any) => !isNaN(e)).join('') !== "" ? lastAlphaNumeric.filter((e: any) => !isNaN(e)).join('') : null;
                metricValue = lastAlphaNumeric.filter((e: any) => isNaN(e)).join('');

                // Only applicable if numericValue is null
                altClassName = classString
                .split('')
                .splice(0, classString.split('').findIndex((e: any) => !isNaN(e)) - 1)
                .join('');
            }

            // The metric i.e. prc, px etc.
            const CLASS_METRIC = numericValue ? numericValue : metricValue ? metricValue : null;
            const classMetric = Array.isArray(CLASS_METRIC) ? CLASS_METRIC.filter((e: any) => isNaN(e))[0] : CLASS_METRIC;
            const CLASS_NAME = numericValue > 0 ? stringArray.slice(0, numberIndex).join('-') : altClassName;
            
            // newClassObject
            if (!newClassObject[CLASS_NAME]) {
                classCompletionItem = new CompletionItem(CLASS_NAME);
                classCompletionItem.commitCharacters = ['.'];
                classCompletionItem.documentation = classDocumentation;
                classCompletionItem.filterText = CLASS_NAME;
                classCompletionItem.detail = classAttribute.split(':')[0];

                newClassObject[CLASS_NAME] = {
                    metrics: classMetric ? [classMetric] : [],
                    min: numericValue ? numericValue : numberValue ? numberValue : 0,
                    max: numericValue ? numericValue : numberValue ? numberValue : 0,
                    isDash: isNumeric
                };

                classDocumentation.appendCodeblock(`${classString.trim()}`, 'css');
            } else if (newClassObject[CLASS_NAME]) {
                if (classMetric && !newClassObject[CLASS_NAME].metrics?.includes(classMetric)) {
                    newClassObject[CLASS_NAME].metrics?.push(classMetric);
                }


                if (numericValue || numberValue) {
                    // @ts-ignore
                    if (newClassObject[CLASS_NAME].min > parseInt(numericValue ? numericValue : numberValue)) {
                        newClassObject[CLASS_NAME].min = parseInt(numericValue ? numericValue : numberValue);
                    }

                    // @ts-ignore
                    if (newClassObject[CLASS_NAME].max < parseInt(numericValue ? numericValue : numberValue)) {
                        newClassObject[CLASS_NAME].max = parseInt(numericValue ? numericValue : numberValue);
                    }
                }
            }

            classAttributes.forEach((attribute: string) => {
                if (!attributeObject[attribute]) {
                    attributeObject[attribute] = [classNameMatch[1]];
                    classDocumentation.appendCodeblock(`${attribute.trim()}`, 'css');

                    /*
                    // Lets create a completionItem for the attribute as well
                    const attributeCompletionItem = new CompletionItem(attribute);
                    const attributeDocumentation = new MarkdownString();
                    attributeDocumentation.appendCodeblock(`${classNameMatch[1].trim()}`, 'css');
                    attributeCompletionItem.insertText = `${classNameMatch[1]}`;
                    attributeCompletionItem.filterText = classNameMatch[1];
                    attributeCompletionItem.commitCharacters = ['.'];
                    attributeCompletionItem.documentation = attributeDocumentation;
                    attributeCompletionItem.detail = attribute;

                    // Add the completion item to the list
                    if (!uniqueLabels.has(attribute)) {
                        suggestionArray.push(attributeCompletionItem);
                        uniqueLabels.add(attribute);
                    }
                    */

                } else if (attributeObject[attribute] && !attributeObject[attribute].includes(classNameMatch[1])) {
                    attributeObject[attribute].push(classNameMatch[1]);
                    classDocumentation.appendCodeblock(`${attribute.trim()}`, 'css');
                }
            });

            // Add the completion item to the list
            if (!uniqueLabels.has(classNameMatch[1]) && classCompletionItem) {
                suggestionArray.push(classCompletionItem);
                uniqueLabels.add(classNameMatch[1]);
            }

        } catch (error) {
            try {
                if(currClassNameMatch){
                    console.log(currClassNameMatch[1]);
                }
            } catch (error) {
                
            }
            console.log(`Error in parsing CSS & CompletionItems: ${error}. Error caused while parsing ${errorTrack2}: ${errorTrack}`);
        }
    });

    // Create a label fo className --> bg-0
    /*
    const classCompletionItem = new CompletionItem(cssClassString);
    */
    console.log(newClassObject);

    completionItems.push(...new Set(suggestionArray));
    return completionItems;
    /*
    try {
        // When user is typing a CSS classname
        for (const key in classNameObject) {
            try {
                // Create the window that will show information
                const documentation = new MarkdownString();

                // Each key has an array, so we need to iterate through and 
                // append the attribute (multi attribute) the key holds
                classNameObject[key].forEach((attribute) => {
                    documentation.appendCodeblock(`${attribute.trim()}`, 'css');
                });

                const commitCharacterCompletion = new CompletionItem(key);
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
            } catch (err) {
                console.log(`Error in parsing classNames: ${err}`);
            }
        }

        // When user is writing a CSS attribute
        for (const key in attributeObject) {
            // Check if the attribute matches the typed text
            const _PRE_CLASS_NAME = attributeObject[key];

            _PRE_CLASS_NAME.forEach((className) => {
                if (_PRE_CLASS_NAME.length === 1) {
                    // Create the window that will show information
                    const documentation = new MarkdownString();
                    // Each key has an array, so we need to iterate through and 
                    // append the attribute (multi attribute) the key holds
                    documentation.appendCodeblock(`${className.trim()}`, 'css');

                    const commitCharacterCompletion = new CompletionItem(`${key}`);
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

        completionItems.push(...new Set(suggestionArray));
        return completionItems;
    } catch (err) {
        console.log(`Error in parsing completionItems: ${err}`);
    }
    */

    /*
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
*/
}

// Might be removed
export function processLineString(lineString: string, position: number) {
    // Regex to identify attributes that triggers our extension:
    const classRegex = /(?:className|class)\s*=\s*"([^"]+)"/g;
    const attributeRegex = /(?:style-dark|style-light)\s*=\s*"([^"]+)"/g;


    const classAttribute = lineString.match(classRegex);
    const modeAttribute = lineString.match(attributeRegex);

    if (classAttribute) {
        return classAttribute[1];
    } else if (modeAttribute) {
        if (modeAttribute[0].includes('style-dark')) {
            const newString = modeAttribute[0].replace('style-dark="', '').replace('"', '');
            console.log(newString.substring(0, (position - 4)));
            return newString;
        } else if (modeAttribute[0].includes('style-light')) {
            const newString = modeAttribute[0].replace('style-light="', '').replace('"', '');
            console.log(newString.substring(0, (position - 4)));
            return newString;
        }

    } else {
        return undefined;
    }
}

export function extractInputString(input: string) {
    const reversedText = input.split('').reverse().join(''); // Reverse the text

    const regex = /[^A-Za-z0-9-]/; // Define the regex to match special characters

    let result = '';
    for (const char of reversedText) {
        if (regex.test(char) || char === ' ') {
            break; // Exit the loop when a space or special character is encountered
        }
        result = char + result; // Add the character to the result in reverse order
    }

    return result;
}