/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test } from "vitest";
import { CON, DIS, IMPL, literals, NEG, operations } from ".";
import { Statement } from "./statement";
import { createTable } from "./table";
import { binaryCombinations, isLiteral, searchEnd } from "./utils";

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
        expect(st.left instanceof Statement).toBe(true);
        expect((st.left as Statement).left).toBe(A);
        expect((st.left as Statement).connective).toBe(NEG);
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
        expect((st.left as Statement).left instanceof Statement).toBe(true);
        expect(((st.left as Statement).left as Statement).left).toBe(A);
        expect(((st.left as Statement).left as Statement).right).toBe(B);
        expect(((st.left as Statement).left as Statement).connective).toBe(CON);

        expect(st.right instanceof Statement).toBe(true);
        expect((st.right as Statement).connective).toBe(NEG);
        expect(((st.right as Statement).left)).toBe(C);

    });

    afterEach(() => literals.clear());
});

function checkRow(parent: Element, expectedArr: string[]) {
    for (let i = 0; i < parent.children.length; i++) {
        expect(parent.children[i].textContent).toEqual(expectedArr[i]);
    }
}

const str = (b: boolean) => b ? '1' : '0';

describe('table', () => {
    test('Basic implication', () => {
        const op = operations[IMPL];
        const st = new Statement(A + IMPL + B);
        const table = createTable(st);
        checkRow(table.tHead!, [A, IMPL, B]);
        const [combinations, indexes] = binaryCombinations([A, B]);
        expect(table.rows.length).toBe(combinations.length);
        let c: boolean[];
        for (let i = 0; i < combinations.length; i++) {
            c = combinations[i];
            checkRow(table.rows.item(i)!, [
                str(c[0]),
                str(op(c[0], c[1])),
                str(c[1]),
            ]);
        }
        expect(indexes).toStrictEqual({ [A]: 0, [B]: 1 });
    });

    test('Negation', () => {
        const st = new Statement(NEG + A);
        const table = createTable(st);
        checkRow(table.tHead!, [NEG, A]);
        expect(table.rows.length).toBe(2);
        checkRow(table.rows.item(0)!, ['0', '1']);     
        checkRow(table.rows.item(1)!, ['1', '0']);     
    });

    test('Complicated case', () => {
        const neg = operations[NEG];
        const con = operations[CON];
        const dis = operations[DIS];
        const text = `${NEG} (${A} ${CON} ${B}) ${DIS} ${NEG} ${C}`;
        const st = new Statement(text);
        const table = createTable(st);
        checkRow(table.tHead!, text.split(' '));
        const [combinations, indexes] = binaryCombinations([A, B, C]);
        expect(table.rows.length).toBe(combinations.length);
        let c: boolean[];
        for (let i = 0; i < combinations.length; i++) {
            c = combinations[i];
            const conjunction = con(c[0], c[1])
            const firstNeg = neg(c[0], conjunction);
            const secondNeg = neg(c[1], c[2]);
            checkRow(table.rows.item(i)!, [
                str(firstNeg),
                str(c[0]),
                str(conjunction),
                str(c[1]),
                str(dis(firstNeg, secondNeg)),
                str(secondNeg),
                str(c[2])
            ]);
        }
        expect(indexes).toStrictEqual({ [A]: 0, [B]: 1, [C]: 2 });
    });

    afterEach(() => literals.clear());
});
