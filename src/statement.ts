import { connectives, Context, literals, NEG, operations } from ".";
import { isLiteral, searchEnd } from "./utils";

export class Statement {
    left?: Statement | string;
    right?: Statement | string;
    connective?: string;
    brackets?: boolean;
    nextConnective?: string;

    #calcChild(ctx: Context, child?: Statement | string) {
        return typeof child === 'string'
            ? ctx.combinations[ctx.indexes[child]]
            : child ? child.calculate(ctx) : false;
    }

    calculate(ctx: Context): boolean {
        if (!this.connective) return false;
        const l = this.#calcChild(ctx, this.left);
        const r = this.#calcChild(ctx, this.right);
        return operations[this.connective](l, r);
    }

    setChild(child?: Statement | string) {
        if (!this.left) this.left = child;
        else if (!this.right) this.right = child;
        else {
            const newLeft = new Statement();
            Object.assign(newLeft, this);
            this.left = newLeft;
            this.right = child;
            if (this.nextConnective) {
                this.connective = this.nextConnective;
                this.nextConnective = undefined;
            }
        };
    }

    parse(text: string, stopOnFirstBlock = false) {
        let i = 0;
        let c = '';
        while (i < text.length) {
            c = text[i];
            if (c === NEG) {
                const child = new Statement();
                const suffix = child.parse(text.slice(i + 1), true);
                const negated = new Statement();
                negated.left = child.connective ? child : child.left;
                negated.connective = c;
                this.setChild(negated);
                i += suffix;
            } else if (c === '(') {
                const end = searchEnd(text, i);
                if (stopOnFirstBlock) {
                    this.parse(text.slice(i + 1, end));
                    this.brackets = true;
                    return end;
                }
                const child = new Statement(text.slice(i + 1, end), true);
                /* if (stopOnFirstBlock) { 
                    Object.assign(this, child);
                    return end;
                } */
                this.setChild(child);
                i = end;
            } else if (connectives.has(c)) {
                if (this.connective) {
                    this.nextConnective = c;
                }
                else this.connective = c;
            } else if (isLiteral(c)) {
                literals.add(c);
                this.setChild(c);
            }
            i++;
        }
        /* if (this.nextConnective) {
            this.connective = this.nextConnective;
            this.nextConnective = undefined;
        } */
        return i;
    }

    constructor(text?: string, brackets = false) {
        if (text) this.parse(text);
        this.brackets = brackets;
    }
}