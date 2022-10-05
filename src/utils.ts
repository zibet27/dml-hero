import { END_B, START_B } from ".";

function searchEnd(text: string, start: number) {
    let openedNewBrackets = 0;
    for (let i = start + 1; i < text.length; i++) {
        if (text[i] === START_B) openedNewBrackets++;
        else if (text[i] === END_B) {
            if (openedNewBrackets === 0) return i;
            openedNewBrackets--;
        }
    }
    console.log('No closing bracket');
    return text.length;
}

function extendCombination(combinations: boolean[][]) {
    const nextCombinations: boolean[][] = [];
    for (const combination of combinations) {
        nextCombinations.push([...combination, true]);
        nextCombinations.push([...combination, false]);
    }
    return nextCombinations;
}

function binaryCombinations(arr: string[]) {
    let combinations = [[] as boolean[]];
    const indexes: Record<string, number> = {};
    for (let i = 0; i < arr.length; i++) {
        combinations = extendCombination(combinations);
        indexes[arr[i]] = i;
    }
    return [combinations, indexes] as const;
}

function isLiteral(l: string) {
    return l.length === 1 && l.toUpperCase() === l && l.toLowerCase() !== l;
}

export { searchEnd, binaryCombinations, isLiteral };