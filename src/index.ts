export const START_B = "(";
export const END_B = ")";

export const NEG = "¬";
export const CON = "∧";
export const DIS = "∨";
export const IMPL = "⇒";
export const EQ = "⇔";

export const operations: Record<string, (l: boolean, r: boolean) => boolean> = {
    // when we negate we have only right side
    [NEG]: (_, r) => !r,
    [CON]: (l, r) => l && r,
    [DIS]: (l, r) => l || r,
    [IMPL]: (l, r) => !l || r,
    [EQ]: (l, r) => l === r,
};

export const literals = new Set<string>();
export const connectives = new Set([NEG, CON, DIS, IMPL, EQ]);

export const defaultLiterals = ['A', 'B', 'C', 'D', 'E', 'F'];
export const defaultConnectives = [START_B, END_B, NEG, CON, DIS, IMPL, EQ];

export type Context = {
    combinations: boolean[],
    indexes: Record<string, number>,
}