import { Context, END_B, literals, NEG, START_B } from ".";
import { Statement } from "./statement";
import { binaryCombinations } from "./utils";

let mainColumnIndex = 0;

function drawHeader(st: Statement | string, row: HTMLElement, start = false) {
    if (typeof st === 'string') {
        const el = document.createElement('th');
        el.textContent = st;
        el.style.fontWeight = 'bold';
        el.style.borderWidth = '3px';
        row.appendChild(el);
    } else {
        if (st.connective === NEG && !st.right) {
            const tmp = st.left;
            st.left = st.right;
            st.right = tmp;
        }
        if (st.left) drawHeader(st.left, row);
        if (st.brackets) {
            const c = row.lastChild!;
            c.textContent = START_B + c.textContent;
        };
        if (st.connective) drawHeader(st.connective, row);
        if (start) mainColumnIndex = row.childElementCount - 1;
        if (st.right) drawHeader(st.right, row);
        if (st.brackets) {
            row.lastChild!.textContent += END_B;
        };
    }
}

function drawTh(st: Statement | string, ctx: Context, row: HTMLElement) {
    if (typeof st === 'string') {
        const el = document.createElement('th');
        el.textContent = ctx.combinations[ctx.indexes[st]] ? '1' : '0';
        row.appendChild(el);
    } else {
        if (st.left) drawTh(st.left, ctx, row);
        if (st.connective) {
            const el = document.createElement('th');
            el.textContent = st.calculate(ctx) ? '1' : '0';
            row.appendChild(el);
        };
        if (st.right) drawTh(st.right, ctx, row);
    }
}

function createTable(st: Statement) {
    const table = document.createElement('table');
    // draw top
    const topRow = document.createElement('thead');
    drawHeader(st, topRow, true);
    table.appendChild(topRow);
    // move literals to statements
    const [combinations, indexes] = binaryCombinations([...literals]);
    const context: Context = { combinations: [], indexes };
    for (const c of combinations) {
        const row = document.createElement('tr');
        context.combinations = c;
        drawTh(st, context, row);
        table.appendChild(row);
    }
    for (let i = 0; i < table.rows.length; i++) {
        const c = table.rows[i].children.item(mainColumnIndex)! as HTMLTableColElement;
        c.style.borderWidth = '3px';
        c.style.borderRightWidth = '3px';
    }
    return table;
}

export { createTable };