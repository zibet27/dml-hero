import { defaultConnectives, defaultLiterals } from '.';
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
      input.value += name;
    });
    container.appendChild(btn);
  }
}

addButtons(defaultLiterals, document.querySelector('#literals')!, 'primary-button');

const deleteButton = document.createElement('button');
deleteButton.textContent = 'Del';
deleteButton.addEventListener('click', () => {
  input.value = input.value.slice(0, -1);
});
document.querySelector('#literals')!.appendChild(deleteButton);

addButtons(defaultConnectives, document.querySelector('#connectives')!);

genButton.addEventListener('click', () => {
  app.lastChild!.remove();
  const table = new TruthTable(input.value);
  const rows = table.element.tBodies[0].rows;
  table.element.className = 'styled-table';
  for (let i = 0; i < rows.length; i++) {
    rows[i].children.item(table.mainColumnIndex)!.className = 'main-row';
  }
  app.appendChild(table.element);
});