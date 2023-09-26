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