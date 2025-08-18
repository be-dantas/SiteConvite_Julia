import { DEADLINE_ISO } from './config.js';

const qs = new URLSearchParams(location.search);
const scale = parseFloat(qs.get('scale'));
if (!Number.isNaN(scale) && scale > 0 && scale < 3) {
  document.documentElement.style.setProperty('--scale', String(scale));
}

function normalizeDeadline(s){
  let iso = String(s || '').trim();
  if (!iso) return null;
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(iso)) iso = iso.replace(' ', 'T');
  if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(iso)) {
    const off = new Date().getTimezoneOffset();
    const sign = off <= 0 ? '+' : '-';
    const hh = String(Math.floor(Math.abs(off)/60)).padStart(2,'0');
    const mm = String(Math.abs(off)%60).padStart(2,'0');
    iso += sign + hh + ':' + mm;
  }
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

function addOneMonth(d){ const nd = new Date(d.getTime()); nd.setMonth(nd.getMonth()+1); return nd; }
function diffCalendar(now, endDate){
  if (now >= endDate) return { months:0, days:0, hours:0, mins:0 };
  let months = 0, cursor = new Date(now.getTime()); cursor.setSeconds(0,0);
  while (true){ const next = addOneMonth(cursor); if (next <= endDate){ months++; cursor = next; } else break; }
  let ms = endDate - cursor;
  const days = Math.floor(ms/86400000);  ms -= days*86400000;
  const hours = Math.floor(ms/3600000);  ms -= hours*3600000;
  const mins = Math.floor(ms/60000);
  return { months, days, hours, mins };
}
const pad2 = n => String(Math.max(0,n)).padStart(2,'0');

export function initCountdown(root){
  const endTs = normalizeDeadline(qs.get('deadline') || DEADLINE_ISO);
  const el = (id) => root.querySelector(id);
  const elM = el('#mm'), elD = el('#dd'), elH = el('#hh'), elI = el('#mi');
  const ended = el('#ended'), invalid = el('#invalid');
  if (!endTs){ invalid.style.display = 'block'; return; }

  function render(){
    const now = new Date();
    const { months, days, hours, mins } = diffCalendar(now, new Date(endTs));
    elM.textContent = pad2(months); elD.textContent = pad2(days);
    elH.textContent = pad2(hours);  elI.textContent = pad2(mins);
    if (Date.now() >= endTs){ ended.style.display = 'block'; clearInterval(t); }
  }
  render();
  const t = setInterval(render, 1000);
}
