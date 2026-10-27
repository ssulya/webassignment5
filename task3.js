// Task 3 · Option A · Ticket builder with live validation
(() => {
const EVENTS = [
  { id: 'concert', name: 'AITU Concert',     from: '2026-11-10', to: '2026-12-20' },
  { id: 'hack',    name: 'AITU Hack Finals', from: '2026-11-05', to: '2026-11-30' },
  { id: 'talk',    name: 'Tech Talk',        from: '2026-11-01', to: '2026-12-31' },
];
const TYPES = [
  { id: 'standard', label: 'Standard', price: 5000,  seats: 20 },
  { id: 'vip',      label: 'VIP',      price: 12000, seats: 3 },
  { id: 'student',  label: 'Student',  price: 2500,  seats: 0 },   // sold out
];
const SOLD_OUT_DATES = ['2026-11-14', '2026-11-21', '2026-12-05'];
const PROMOS = [{ code: 'AITU10', percent: 10 }, { code: 'HACK25', percent: 25 }, { code: 'STUDENT5', percent: 5 }];
const BLOCKED_DOMAINS = ['mailinator.com', 'tempmail.com', '10minutemail.com'];
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

const $ = (id) => document.getElementById(id);
const form = $('ticketForm');
form.noValidate = true;                       // browser bubbles off, checkValidity() still works
const NAMES = ['event', 'date', 'type', 'quantity', 'name', 'email', 'promo'];
const touched = new Set();

const findEvent = () => EVENTS.find((e) => e.id === form.elements.event.value);
const findType = () => TYPES.find((t) => t.id === form.elements.type.value);
const findPromo = () => PROMOS.find((p) => p.code === form.elements.promo.value.trim().toUpperCase());
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const money = (n) => n.toLocaleString('en-US') + ' ₸';
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// each rule returns an error text, or '' when the value is valid
const rules = {
  event: (el) => (el.validity.valueMissing ? 'Choose an event.' : ''),
  date: (el) => {
    if (el.validity.valueMissing) return 'Choose a date.';
    if (el.validity.badInput) return 'Enter a real date.';
    const ev = findEvent();
    if (el.value < todayStr()) return 'The date cannot be in the past.';
    if (ev && (el.value < ev.from || el.value > ev.to)) return `${ev.name} takes place from ${ev.from} to ${ev.to}.`;
    if (SOLD_OUT_DATES.includes(el.value)) return 'This date is sold out. Choose another date.';
    return '';
  },
  type: (el) => (el.validity.valueMissing ? 'Choose a ticket type.' : ''),
  quantity: (el) => {
    if (el.validity.valueMissing || el.validity.badInput) return 'Enter the quantity.';
    if (el.validity.stepMismatch) return 'Quantity must be a whole number.';
    if (el.validity.rangeUnderflow) return 'Minimum is 1 ticket.';
    if (el.validity.rangeOverflow) return 'Maximum is 10 tickets per order.';
    const t = findType();
    if (t && Number(el.value) > t.seats) return t.seats === 0 ? `${t.label} tickets are sold out.` : `Only ${t.seats} ${t.label} seats left.`;
    return '';
  },
  name: (el) => {
    if (el.validity.valueMissing || el.value.trim() === '') return 'Enter your name.';
    if (!/^[\p{L}'-]+(\s+[\p{L}'-]+)+$/u.test(el.value.trim())) return 'Enter first and last name, letters only.';
    return '';
  },
  email: (el) => {
    if (el.validity.valueMissing) return 'Enter your email.';
    if (el.validity.typeMismatch) return 'Email must look like name@example.com.';
    const domain = el.value.trim().split('@')[1].toLowerCase();
    if (BLOCKED_DOMAINS.includes(domain)) return 'Temporary email services are not allowed.';
    return '';
  },
  promo: (el) => (el.value.trim() !== '' && !findPromo() ? 'Unknown promo code.' : ''),
};

function setError(el, text) {
  $('err-' + el.name).textContent = text;
  el.setAttribute('aria-invalid', text ? 'true' : 'false');
  el.classList.toggle('invalid', text !== '');
  el.classList.toggle('valid', text === '' && el.value.trim() !== '');
}
function validateField(el) {
  const text = rules[el.name](el);
  setError(el, text);
  return text === '';
}

function updateSeatHint() {
  $('seatHint').textContent = 'Seats left: ' + TYPES.map((t) => `${t.label} ${t.seats}`).join(' · ');
}
function fillOptions() {
  const evSel = form.elements.event, tySel = form.elements.type;
  const evVal = evSel.value, tyVal = tySel.value;
  evSel.textContent = ''; tySel.textContent = '';
  const first = (text) => { const o = document.createElement('option'); o.value = ''; o.textContent = text; return o; };
  evSel.append(first('— choose event —')); tySel.append(first('— choose type —'));
  for (const e of EVENTS) { const o = document.createElement('option'); o.value = e.id; o.textContent = e.name; evSel.append(o); }
  for (const t of TYPES) {
    const o = document.createElement('option'); o.value = t.id;
    o.textContent = `${t.label} — ${money(t.price)} (${t.seats === 0 ? 'sold out' : t.seats + ' left'})`;
    tySel.append(o);
  }
  evSel.value = evVal; tySel.value = tyVal;
  updateSeatHint();
}

function calcTotal() {
  const t = findType(), qty = Number(form.elements.quantity.value);
  if (!t || !(qty >= 1)) return null;
  const promo = findPromo();
  const sum = t.price * qty * (promo ? (100 - promo.percent) / 100 : 1);
  return { sum, promo };
}
function updatePreview() {
  const v = (n) => form.elements[n].value.trim();
  const ev = findEvent(), t = findType(), total = calcTotal();
  $('pvEvent').textContent = ev ? ev.name : '—';
  $('pvDate').textContent = v('date') || '—';
  $('pvType').textContent = t ? t.label : '—';
  $('pvQty').textContent = v('quantity') || '—';
  $('pvName').textContent = v('name') || '—';
  $('pvTotal').textContent = total ? money(total.sum) + (total.promo ? ` (−${total.promo.percent}%)` : '') : '—';
}

form.addEventListener('input', (e) => {
  const el = e.target;
  updatePreview();
  if (touched.has(el.name)) validateField(el);
  // fields that depend on others are checked again
  if (el.name === 'event' && touched.has('date')) validateField(form.elements.date);
  if (el.name === 'type' && touched.has('quantity')) validateField(form.elements.quantity);
});
form.addEventListener('focusout', (e) => {          // blur bubbles as focusout
  const el = e.target;
  if (!NAMES.includes(el.name)) return;
  touched.add(el.name);
  validateField(el);
});

function randomCode() {
  let code = 'AT-';
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[randInt(0, CODE_ALPHABET.length - 1)];
  return code;
}
function buildTicket(data) {
  const box = document.createElement('article');
  box.className = 'ticket';
  const h = document.createElement('h3'); h.textContent = data.event;
  const rows = [['Date', data.date], ['Type', `${data.type} × ${data.qty}`], ['Name', data.name],
                ['Email', data.email], ['Paid', data.paid], ['Booking code', data.code]];
  const dl = document.createElement('dl');
  for (const [k, val] of rows) {
    const dt = document.createElement('dt'), dd = document.createElement('dd');
    dt.textContent = k; dd.textContent = val; dl.append(dt, dd);
  }
  box.append(h, dl);
  return box;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  $('success').hidden = true;
  const invalid = [];
  for (const n of NAMES) {
    touched.add(n);
    if (!validateField(form.elements[n])) invalid.push(form.elements[n]);
  }
  const summary = $('summary');
  if (invalid.length > 0) {
    summary.textContent = `Please fix ${invalid.length} ${invalid.length === 1 ? 'error' : 'errors'} below.`;
    summary.hidden = false;
    invalid[0].focus();
    return;
  }
  summary.hidden = true;
  const ev = findEvent(), t = findType(), total = calcTotal(), qty = Number(form.elements.quantity.value);
  const data = { event: ev.name, date: form.elements.date.value, type: t.label, qty, name: form.elements.name.value.trim(),
                 email: form.elements.email.value.trim(), paid: money(total.sum), code: randomCode() };
  t.seats -= qty;                                   // seats are really taken
  $('tickets').prepend(buildTicket(data));
  $('success').textContent = `Done! Your booking code is ${data.code}.`;
  $('success').hidden = false;
  form.reset();
  touched.clear();
  for (const n of NAMES) { setError(form.elements[n], ''); form.elements[n].removeAttribute('aria-invalid'); form.elements[n].classList.remove('valid'); }
  fillOptions();
  updatePreview();
});

form.elements.date.min = todayStr();
fillOptions();
updatePreview();
})();
