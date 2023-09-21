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

export interface UniqueAttributes {
    [key: string]: {
        attributes: any[]
        example?: string
    }
}

export const classNameObject = new Object as StyleObject;
export const attributeObject = new Object as StyleObject;
export const newClassObject = new Object as NewStyleObject;
export const uniqueAttributes = new Object as UniqueAttributes;

export function createObject(styleCSS: string) {
    // Create completionItems
    const completionItems: CompletionItem[] = new Array; // Will hold all completionItems in an array
    const suggestionArray = new Array;
    const uniqueLabels = new Set();

    styleCSS.split('}').forEach((styleBlock: string, index: number) => {
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
            let secondAltClassName: null | string = null;

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
                .splice(0, (classString.split('').findIndex((e: any) => !isNaN(e))) - 1)
                .join('');
            }

            try {
                secondAltClassName = classString
                .split('')
                .splice(0, (classString.split('').findIndex((e: any) => !isNaN(e))) - 1)
                .join('');
            } catch (error) {}

            // The metric i.e. prc, px etc.
            const CLASS_METRIC = numericValue ? numericValue : metricValue ? metricValue : null;
            const classMetric = Array.isArray(CLASS_METRIC) ? CLASS_METRIC.filter((e: any) => isNaN(e))[0] : CLASS_METRIC;
            const CLASS_NAME = 
                numericValue > 0 ? 
                    stringArray.slice(0, numberIndex).join('-') !== "" 
                        ? stringArray.slice(0, numberIndex).join('-') 
                        : altClassName 
                            ? altClassName
                            : classString
                : altClassName 
                    ? altClassName
                    : classString.split('').some((e: any) => !isNaN(e)) 
                        ? secondAltClassName
                        : classString;
            
            //         
            try {
                const cssAttribute = trimmedStyleBlock?.split('{')[1]?.trim().split(':')[0];
                if(!uniqueAttributes[cssAttribute]){
                    uniqueAttributes[cssAttribute] = {
                        attributes: [CLASS_NAME],
                        example: classString
                    };
                } else if(uniqueAttributes[cssAttribute]){
                    if(!uniqueAttributes[cssAttribute]?.attributes.includes(CLASS_NAME)){
                        uniqueAttributes[cssAttribute].attributes.push(CLASS_NAME);
                    } else {
                        uniqueAttributes[cssAttribute].attributes = [CLASS_NAME];
                    }
                }
            } catch (error) {
                console.log(`Error creating attribute object ${trimmedStyleBlock?.split('{')[1]?.trim().split(':')[0]}: ${error}, ${CLASS_NAME}`);
            }

            // newClassObject
            if (!newClassObject[CLASS_NAME] && CLASS_NAME !== 'null' && CLASS_NAME) {
                classDocumentation.appendCodeblock(`${CLASS_NAME.trim()}`, 'css');

                classCompletionItem = new CompletionItem(CLASS_NAME, 6);
                classCompletionItem.commitCharacters = ['.'];
                classCompletionItem.documentation = classDocumentation;
                classCompletionItem.filterText = CLASS_NAME;
                classCompletionItem.detail = `The following ${CLASS_NAME} applies styling of ${classAttribute.split(':')[0]}`;

                newClassObject[CLASS_NAME] = {
                    metrics: classMetric ? [classMetric] : [],
                    min: numericValue ? numericValue : numberValue ? numberValue : 0,
                    max: numericValue ? numericValue : numberValue ? numberValue : 0,
                    isDash: isNumeric
                };

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

    Object.keys(uniqueAttributes).forEach((key) => {
        const { attributes, example } = uniqueAttributes[key];

        const documentation = new MarkdownString();
        documentation.appendCodeblock(`Example: ${example}`);
        const commitCharacterCompletion = new CompletionItem(key, 6);
        commitCharacterCompletion.detail = key;
        commitCharacterCompletion.documentation = documentation;
        commitCharacterCompletion.insertText = attributes[0];

        suggestionArray.push(commitCharacterCompletion);
        uniqueLabels.add(key);
    });    

    pseudoClasses.forEach((pseudoClass) => {
        // Create the window that will show information
        const documentation = new MarkdownString();
        documentation.appendCodeblock(`Attribute triggered when user ${pseudoClass}.`);
        documentation.appendCodeblock(`Specified by ${pseudoClass}:<SwiftCSS class>`);

        const commitCharacterCompletion = new CompletionItem(`${pseudoClass}:`, 6);
        commitCharacterCompletion.commitCharacters = ['.'];
        commitCharacterCompletion.documentation = documentation;
        commitCharacterCompletion.detail = `${pseudoClass}: Add a CSS attribute to be triggered when user makes a certain action`;

        suggestionArray.push(commitCharacterCompletion);
        uniqueLabels.add(pseudoClass);
    });
    
    dynamicClasses.forEach((dynamicClass) => {
        // Create the window that will show information
        const documentation = new MarkdownString();
        documentation.appendCodeblock(`${dynamicClass}-[#000] or ${dynamicClass}-[#f4f4f4]`);

        const commitCharacterCompletion = new CompletionItem(`${dynamicClass}-`, 6);
        commitCharacterCompletion.commitCharacters = ['.'];
        commitCharacterCompletion.documentation = documentation;
        commitCharacterCompletion.detail = `Dynamic class that allows you to specify the CSS attribute within the square brackets "[]". Value for bg & color has to start with "#" followed by 3 or 6 characters`;

        suggestionArray.push(commitCharacterCompletion);
        uniqueLabels.add(dynamicClass);
    });

    // Create a label fo className --> bg-0
    /*
    const classCompletionItem = new CompletionItem(cssClassString);
    */
    console.log(newClassObject);
    console.log(uniqueAttributes);

    completionItems.push(...new Set(suggestionArray));
    return completionItems;
}

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