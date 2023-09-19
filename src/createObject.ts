export interface StyleObject {
    [key: string]: string[]
}

export function createObject(styleCSS: string, classNameObject: StyleObject, attributeObject: StyleObject){
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

        try {
            const classNameMatch = trimmedStyleBlock.match(/\.([a-zA-Z0-9_-]+)\s*\{/) as any[];
            const classAttribute = trimmedStyleBlock.split('{')[1].trim();
            const classAttributes = classAttribute.split(';').filter(item => item !== "");

            if(!classNameObject[classNameMatch[1] as keyof StyleObject]){
                classNameObject[classNameMatch[1]] = [classAttribute];
            }

            classAttributes.forEach((attribute: string) => {
                if(!attributeObject[attribute]){
                    attributeObject[attribute] = [classNameMatch[1]];
                } else if(attributeObject[attribute] && !attributeObject[attribute].includes(classNameMatch[1])){
                    attributeObject[attribute].push(classNameMatch[1]);   
                }
            });


            /*
                ['.brd-radius-bl-8prc {', 'brd-radius-bl-8prc', index: 0, input: '.brd-radius-bl-8prc {
                border-bottom-left-radius: 8%;', groups: undefined],
                border-bottom-left-radius: 8%; 
                null
            */

            // classNameMatch[1] = className
            // classAttribute = CSS Attribute
        } catch (error) {}
    });
}

export function processLineString(lineString: string){
    console.log(lineString.trim());

    // Regex to identify attributes that triggers our extension:
    const classRegex = /(?:className|class)\s*=\s*"([^"]+)"/g;
    const attributeRegex = /(?:style-dark|style-light)\s*=\s*"([^"]+)"/g;


    const classAttribute = lineString.match(classRegex);
    const modeAttribute = lineString.match(attributeRegex);

    console.log(classAttribute);
    console.log(modeAttribute);

    if(classAttribute){
        return classAttribute[1];
    } else if(modeAttribute){
        return modeAttribute[1];
    } else {
        return undefined;
    }
}

export function extractInputString(input: string){
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