import { Position, Range, TextDocument } from "vscode";

export default function rangeReplace(document: TextDocument, lineString: string, position: Position){

    const characters = ['"', "'", "`"];

    // We want to get the position before the string, and the position after

    console.log(lineString.substring(0, position.character));
    const newString = lineString.substring(0, position.character);
    const spaceIndex = lineString.lastIndexOf(' ', newString.length -1);
    const nextSpaceIndex = lineString.lastIndexOf(' ', position.character + 1);
    console.log(newString, spaceIndex, newString, newString.length, nextSpaceIndex, lineString, position.character, lineString.substring(position.character, lineString.length));
    console.log(`String from: ${newString.substring(spaceIndex, newString.length)}`);
    console.log(lineString.substring(spaceIndex, position.character));

    return spaceIndex;
}