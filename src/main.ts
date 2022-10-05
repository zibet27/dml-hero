import { defaultConnectives, defaultLiterals } from '.';
import { Statement } from './statement';
import { TruthTable } from './table';
import './style.css';

const app = document.querySelector('#app')! as HTMLTableElement;
const input = document.querySelector('#input')! as HTMLInputElement;
const genButton = document.querySelector('#genButton')! as HTMLButtonElement;

function addButtons(buttons: string[], container: HTMLElement, className?: string) {
  for (const name of buttons) {
    const btn = document.createElement('button');
    if (className) btn.className = className;
    btn.textContent = name;
    btn.addEventListener('click', () => {
      const cursor = input.selectionStart;
      if (cursor === null) {
        input.value += name;
        return;
      };
      const val = input.value;
      input.value = val.slice(0, cursor) + name + val.slice(cursor, val.length);
    });
    container.appendChild(btn);
  }
}

addButtons(defaultLiterals, document.querySelector('#literals')!, 'primary-button');
addButtons(defaultConnectives, document.querySelector('#connectives')!);

genButton.addEventListener('click', () => {
  app.lastChild!.remove();
  const table = new TruthTable(new Statement(input.value));
  const rows = table.element.tBodies[0].rows;
  table.element.className = 'styled-table';
  for (let i = 0; i < rows.length; i++) {
    rows[i].children.item(table.mainColumnIndex)!.className = 'main-row';
  }
  app.appendChild(table.element);
});