import { defaultConnectives, defaultLiterals, literals } from '.';
import { Statement } from './statement';
import './style.css';
import { createTable } from './table';

const table = document.querySelector('#table')! as HTMLTableElement;
const input = document.querySelector('#input')! as HTMLInputElement;
const genButton = document.querySelector('#genButton')! as HTMLButtonElement;

function addButtons(buttons: string[], container: HTMLElement) {
  for (const name of buttons) {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.onclick = () => {
      const cursor = input.selectionStart;
      if (cursor === null) {
        input.value += name;
        return;
      };
      input.value = input.value.substring(0, cursor) + name + input.value.substring(cursor, input.value.length);
    }
    container.appendChild(btn);
  }
}

addButtons(defaultLiterals, document.querySelector('#literals')!);
addButtons(defaultConnectives, document.querySelector('#connectives')!);

genButton.onclick = () => {
  literals.clear();
  table.childNodes.forEach(n => n.remove());
  table.appendChild(createTable(new Statement(input.value)));
}