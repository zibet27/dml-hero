import { Context, END_B, literals, NEG, START_B } from ".";
import { Statement } from "./statement";
import { binaryCombinations, str } from "./utils";

type St = Statement | string;

class TruthTable {
    #row: Element;
    mainColumnIndex = 0;
    element: HTMLTableElement;

    constructor(st: Statement) {
        this.element = document.createElement('table');
        const head = document.createElement('thead');
        const body = document.createElement('tbody');
        const headRow = document.createElement('tr');

        const [combinations, indexes] = binaryCombinations([...literals]);
        const context: Context = { combinations: [], indexes };

        this.#row = headRow;
        this.#drawHeader(st, true);

        for (const c of combinations) {
            this.#row = document.createElement('tr');
            context.combinations = c;
            this.#drawTh(st, context);
            body.appendChild(this.#row);
        }

        literals.clear();
        head.appendChild(headRow);
        this.element.append(head, body);
    };

    #drawHeader = (st: St, start = false) => {
        if (typeof st === 'string') {
            return this.#appendTh(st);
        }
        const startLen = this.#row.childElementCount;
        if (st.left) this.#drawHeader(st.left);
        if (st.connective) this.#drawHeader(st.connective);
        if (start) this.mainColumnIndex = this.#row.childElementCount! - 1;
        if (st.right) this.#drawHeader(st.right);
        // add brackets to see the order of operations
        if (st.connective && st.connective !== NEG && !start) {
            const left = this.#row.childNodes[startLen];
            left.textContent = START_B + left.textContent;
            this.#row.lastChild!.textContent += END_B;
        };
    }

    #appendTh = (statement: string | boolean) => {
        const th = document.createElement('th');
        th.textContent = typeof statement === 'boolean'
            ? str(statement) : statement;
        this.#row.appendChild(th);
    }

    #drawTh = (st: St, ctx: Context) => {
        if (typeof st === 'string') {
            this.#appendTh(ctx.combinations[ctx.indexes[st]]);
            return;
        }
        if (st.left) this.#drawTh(st.left, ctx);
        if (st.connective) this.#appendTh(st.calculate(ctx));
        if (st.right) this.#drawTh(st.right, ctx);
    }

}

export { TruthTable };
