/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test } from "vitest";
import { CON, DIS, IMPL, literals, NEG, operations } from ".";
import { Statement } from "./statement";
import { TruthTable } from "./table";
import { binaryCombinations, isLiteral, searchEnd, str } from "./utils";

function testLength(length: number) {
    const arr = new Array(length).fill(0).map((_, i) => i.toString());
    const [combinations, indexes] = binaryCombinations(arr);
    expect(combinations.length).toBe(2 ** length);
    const uniqueCombinations = new Set();
    for (const combination of combinations) {
        for (const c of combination) {
            expect(c === true || c === false);
        }
        uniqueCombinations.add(combination.join(""));
    }
    expect(uniqueCombinations.size).toBe(combinations.length);
    for (let i = 0; i < arr.length; i++) {
        expect(indexes[arr[i]]).toBe(i);
    }
}

describe('binary combinations generator', () => {
    test('length 1', () => testLength(1));
    test('length 2', () => testLength(2));
    test('length 3', () => testLength(3));
    test('length 4', () => testLength(3));
    test('length 5', () => testLength(5));
});

test('isLiteral', () => {
    expect(isLiteral('A')).toBe(true);
    expect(isLiteral(CON)).toBe(false);
    expect(isLiteral('AB')).toBe(false);
});

test('search end', () => {
    const text = 'A(Bla))';
    const text2 = 'No brackets';
    expect(searchEnd(text, 0)).toBe(6);
    expect(searchEnd(text, 2)).toBe(5);
    expect(searchEnd(text2, 0)).toBe(text2.length);
});

const A = 'A';
const B = 'B';
const C = 'C';

describe('Statement', () => {
    test('Base conjunction', () => {
        const st = new Statement(A + CON + B);
        expect(st.left).toBe(A);
        expect(st.right).toBe(B);
        expect(st.connective).toBe(CON);
    });

    test('negation', () => {
        const st = new Statement(NEG + A);
        expect(st.right).toBe(A);
        expect(st.connective).toBe(NEG);
    });

    test('Pipe of conjunctions', () => {
        // should be ((a con c) dis b) con c 
        const st = new Statement(A + CON + C + DIS + B + CON + C);
        expect(st.left instanceof Statement).toBe(true);

        expect((st.left as Statement).left instanceof Statement).toBe(true);
        expect(((st.left as Statement).left as Statement).left).toBe(A);
        expect(((st.left as Statement).left as Statement).right).toBe(C);
        expect(((st.left as Statement).left as Statement).connective).toBe(CON);

        expect((st.left as Statement).right).toBe(B);
        expect((st.left as Statement).connective).toBe(DIS);

        expect(st.right).toBe(C);
        expect(st.connective).toBe(CON);
    });

    test('Pipe and negation', () => {
        const text = NEG + `(${A}${CON}${B})` + DIS + NEG + C;
        const st = new Statement(text);
        
        expect(st.left instanceof Statement).toBe(true);
        expect((st.left as Statement).connective).toBe(NEG);
        expect((st.left as Statement).right instanceof Statement).toBe(true);
        expect(((st.left as Statement).right as Statement).left).toBe(A);
        expect(((st.left as Statement).right as Statement).right).toBe(B);
        expect(((st.left as Statement).right as Statement).connective).toBe(CON);

        expect(st.right instanceof Statement).toBe(true);
        expect((st.right as Statement).connective).toBe(NEG);
        expect(((st.right as Statement).right)).toBe(C);
    });

    afterEach(() => literals.clear());
});

function checkRow(row: Element, values: boolean[]) {
    expect(row.textContent).toEqual(values.map(str).join(''));
}

describe('table', () => {
    test('Basic implication', () => {
        const op = operations[IMPL];
        const table = new TruthTable(A + IMPL + B).element;
        const rows = table.tBodies[0].rows;
        const [combinations, indexes] = binaryCombinations([A, B]);

        expect(rows.length).toBe(combinations.length);
        expect(table.tHead!.textContent).toBe(A + IMPL + B);
        
        for (let i = 0; i < combinations.length; i++) {
            const c = combinations[i];
            checkRow(rows.item(i)!, [c[0], op(c[0], c[1]), c[1]]);
        }
        expect(indexes).toStrictEqual({ [A]: 0, [B]: 1 });
    });

    test('Negation', () => {
        const table = new TruthTable(NEG + A).element;
        const rows = table.tBodies[0].rows;
        expect(table.tHead!.textContent).toBe(NEG + A);
        checkRow(rows.item(0)!, [false, true]);
        checkRow(rows.item(1)!, [true, false]);
    });

    test('Complicated case', () => {
        const neg = operations[NEG];
        const con = operations[CON];
        const dis = operations[DIS];
        const text = `${NEG}(${A}${CON}${B})${DIS}${NEG}${C}`;
        const table = new TruthTable(text).element;
        const rows = table.tBodies[0].rows;
        const [combinations, indexes] = binaryCombinations([A, B, C]);        

        expect(table.tHead!.textContent).toBe(text);
        expect(rows.length).toBe(combinations.length);
        
        for (let i = 0; i < combinations.length; i++) {
            const c = combinations[i];
            const conjunction = con(c[0], c[1])
            const firstNeg = neg(c[0], conjunction);
            const secondNeg = neg(c[1], c[2]);
            checkRow(rows.item(i)!, [
                firstNeg, c[0], conjunction, c[1],
                dis(firstNeg, secondNeg), secondNeg, c[2],
            ]);
        }
        
        expect(indexes).toStrictEqual({ [A]: 0, [B]: 1, [C]: 2 });
    });
});
