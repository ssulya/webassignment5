// Task 2 · Option A · Kanban board built from an array of objects
(() => {
const WIP_LIMIT = 3;                         // max cards in "In progress"
const COLUMNS = [
  { key: 'todo', title: 'To do' },
  { key: 'progress', title: 'In progress' },
  { key: 'done', title: 'Done' },
];
const PRIORITIES = { 1: 'Low', 2: 'Medium', 3: 'High' };
const TAGS = ['design', 'code', 'docs', 'test'];

let tasks = [
  { id: 1,  title: 'Design the logo',        tag: 'design', priority: 3, hours: 4, urgent: true,  status: 'todo' },
  { id: 2,  title: 'Write the HTML layout',  tag: 'code',   priority: 3, hours: 5, urgent: false, status: 'progress' },
  { id: 3,  title: 'Style with CSS',         tag: 'code',   priority: 2, hours: 6, urgent: false, status: 'progress' },
  { id: 4,  title: 'Collect the content',    tag: 'docs',   priority: 1, hours: 2, urgent: false, status: 'done' },
  { id: 5,  title: 'Draw the wireframes',    tag: 'design', priority: 2, hours: 3, urgent: false, status: 'done' },
  { id: 6,  title: 'Write the JS game',      tag: 'code',   priority: 3, hours: 8, urgent: true,  status: 'todo' },
  { id: 7,  title: 'Test on mobile',         tag: 'test',   priority: 2, hours: 2, urgent: false, status: 'todo' },
  { id: 8,  title: 'Write the report',       tag: 'docs',   priority: 3, hours: 4, urgent: true,  status: 'todo' },
  { id: 9,  title: 'Fix form validation',    tag: 'code',   priority: 2, hours: 3, urgent: false, status: 'progress' },
  { id: 10, title: 'Check accessibility',    tag: 'test',   priority: 1, hours: 2, urgent: false, status: 'todo' },
  { id: 11, title: 'Prepare screenshots',    tag: 'docs',   priority: 1, hours: 1, urgent: false, status: 'todo' },
  { id: 12, title: 'Publish on GitHub Pages',tag: 'code',   priority: 2, hours: 1, urgent: false, status: 'todo' },
];
let nextId = tasks.length + 1;
let message = { text: '', type: 'ok' };

const $ = (id) => document.getElementById(id);
const board = $('board');

function countStatus(status) {
  let n = 0;
  for (const t of tasks) if (t.status === status) n++;
  return n;
}
function fillSelect(select, items, keepValue) {
  select.textContent = '';
  for (const [value, label] of items) {
    const o = document.createElement('option');
    o.value = value; o.textContent = label;
    select.append(o);
  }
  if (keepValue && items.some(([v]) => v === keepValue)) select.value = keepValue;
}
function makeCard(t) {
  const card = document.createElement('article');
  card.className = 'kcard prio' + t.priority + (t.urgent ? ' urgent' : '');
  const title = document.createElement('h4');
  title.textContent = t.title;
  const meta = document.createElement('p');
  meta.className = 'small';
  meta.textContent = `#${t.tag} · ${PRIORITIES[t.priority]} · ${t.hours} h` + (t.urgent ? ' · urgent' : '');
  const actions = document.createElement('div');
  actions.className = 'row';
  const idx = COLUMNS.findIndex((c) => c.key === t.status);
  const add = (action, label, aria) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'small-btn';
    b.dataset.action = action; b.dataset.id = t.id;
    b.textContent = label; b.setAttribute('aria-label', aria + ': ' + t.title);
    actions.append(b);
  };
  if (idx > 0) add('left', '◀', 'Move back');
  if (idx < COLUMNS.length - 1) add('right', '▶', 'Move forward');
  add('delete', '✕', 'Delete');
  card.append(title, meta, actions);
  return card;
}

// ONE render function: called after every change
function render() {
  const q = $('search').value.trim().toLowerCase();
  const tagVal = $('tagFilter').value || 'all';
  const sortVal = $('sortBy').value;

  const tagList = [...new Set(tasks.map((t) => t.tag))];
  fillSelect($('tagFilter'), [['all', 'All tags'], ...tagList.map((x) => [x, '#' + x])], tagVal);

  let shown = tasks.filter((t) => ($('tagFilter').value === 'all' || t.tag === $('tagFilter').value) &&
                                  t.title.toLowerCase().includes(q));
  if (sortVal === 'high') shown.sort((a, b) => b.priority - a.priority);
  if (sortVal === 'low') shown.sort((a, b) => a.priority - b.priority);

  board.textContent = '';
  for (const col of COLUMNS) {
    const list = shown.filter((t) => t.status === col.key);
    const colEl = document.createElement('section');
    colEl.className = 'column' + (col.key === 'progress' && countStatus('progress') >= WIP_LIMIT ? ' full' : '');
    const h = document.createElement('h3');
    h.textContent = col.title + ' (' + countStatus(col.key) + (col.key === 'progress' ? '/' + WIP_LIMIT : '') + ')';
    colEl.append(h);
    if (list.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty'; empty.textContent = 'No cards';
      colEl.append(empty);
    }
    for (const t of list) colEl.append(makeCard(t));
    board.append(colEl);
  }
  $('notFound').hidden = shown.length > 0;

  // own loop: totals and progress
  let doneCount = 0, hoursDone = 0, hoursTotal = 0;
  for (const t of tasks) {
    hoursTotal += t.hours;
    if (t.status === 'done') { doneCount++; hoursDone += t.hours; }
  }
  const percent = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);
  $('bar').value = percent;
  $('percent').textContent = percent + '%';
  $('stats').textContent = `Done: ${doneCount} of ${tasks.length} cards · ${hoursDone} of ${hoursTotal} hours`;
  $('boardMsg').textContent = message.text;
  $('boardMsg').className = 'msg ' + message.type;
}

// event delegation: one listener for all card buttons
board.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const t = tasks.find((x) => x.id === Number(btn.dataset.id));
  if (!t) return;
  const action = btn.dataset.action;
  if (action === 'delete') {
    tasks = tasks.filter((x) => x.id !== t.id);
    message = { text: `Deleted: ${t.title}`, type: 'ok' };
  } else {
    const idx = COLUMNS.findIndex((c) => c.key === t.status) + (action === 'right' ? 1 : -1);
    const target = COLUMNS[idx];
    if (!target) return;
    if (target.key === 'progress' && countStatus('progress') >= WIP_LIMIT) {
      message = { text: `Blocked: "In progress" already has ${WIP_LIMIT} cards. Finish one first.`, type: 'error' };
    } else {
      t.status = target.key;
      message = { text: `"${t.title}" moved to ${target.title}.`, type: 'ok' };
    }
  }
  render();
});

$('search').addEventListener('input', render);
$('tagFilter').addEventListener('change', render);
$('sortBy').addEventListener('change', render);
$('addForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = $('newTitle').value.trim();
  if (title.length < 3) {
    message = { text: 'Title must have at least 3 characters.', type: 'error' };
  } else {
    tasks.push({ id: nextId++, title, tag: $('newTag').value, priority: Number($('newPrio').value),
                 hours: 1, urgent: false, status: 'todo' });
    $('newTitle').value = '';
    message = { text: `Added: ${title}`, type: 'ok' };
  }
  render();
});

fillSelect($('newTag'), TAGS.map((x) => [x, '#' + x]));
fillSelect($('newPrio'), Object.entries(PRIORITIES).map(([k, v]) => [k, 'Priority: ' + v]), '2');
render();
})();
