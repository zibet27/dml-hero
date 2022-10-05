import { connectives, Context, literals, operations, NEG, START_B } from ".";
import { isLiteral, searchEnd } from "./utils";

export class Statement {
    left?: Statement | string;
    right?: Statement | string;
    connective?: string;

    constructor(text?: string) {
        if (text) this.#parse(text);
    }

    #setChild(child?: Statement | string, nextConnective?: string) {
        if (!this.left) this.left = child;
        else if (!this.right) this.right = child;
        else {
            // case of connectives pipeline
            // set current connection to left and new to right
            const newLeft = new Statement();
            Object.assign(newLeft, this);
            this.left = newLeft;
            this.right = child;
            if (nextConnective) this.connective = nextConnective;
        };
    }

    #parse(text: string, stopOnFirstBlock = false) {
        let i = 0;
        let c = '';
        let nextConnective = '';
        while (i < text.length) {
            c = text[i];
            if (c === NEG) {
                // search for the next statement and negate it
                const negated = new Statement();
                const nextStatement = new Statement();
                const prefix = this.#parse.call(nextStatement, text.slice(i + 1), true);
                negated.right = nextStatement.connective
                    ? nextStatement
                    : nextStatement.left;
                negated.connective = NEG;
                this.#setChild(negated, nextConnective);
                i += prefix;
            } else if (c === START_B) {
                const end = searchEnd(text, i);
                if (stopOnFirstBlock) {
                    this.#parse(text.slice(i + 1, end));
                    return end;
                }
                const child = new Statement(text.slice(i + 1, end));
                this.#setChild(child, nextConnective);
                i = end;
            } else if (connectives.has(c)) {
                if (this.connective) nextConnective = c;
                else this.connective = c;
            } else if (isLiteral(c)) {
                literals.add(c);
                this.#setChild(c, nextConnective);
                if (stopOnFirstBlock) return i + 1;
            }
            i++;
        }
        return i;
    }

    #calcChild(ctx: Context, child?: Statement | string) {
        return typeof child === 'string'
            ? ctx.combinations[ctx.indexes[child]]
            : child ? child.calculate(ctx) : false;
    }

    calculate(ctx: Context): boolean {
        if (!this.connective || !operations[this.connective]) {
            console.log('Invalid connective', this);
            return false;
        }
        return operations[this.connective](
            this.#calcChild(ctx, this.left),
            this.#calcChild(ctx, this.right)
        );
    }
}