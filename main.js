// main.js
import { loadData, RECIPIENT_EMAIL } from './data.js';
import { LINKS } from './links.js';
import { parseTextDate, normalizeName, badge, notifyBadge } from './utils.js';
import { exportPDF } from './pdf.js';
import { openOutlookEmail } from './email.js';

export let employeeMap = {};
let topicMap = {}, allTopics = new Set();

async function buildData() {
  const records = await loadData();
  if (!records.length) return;

  topicMap = {}; employeeMap = {}; allTopics = new Set();
  let overdueCount = 0, overdueEmps = new Set();

  records.forEach(r => {
    const orig = r['Employee Name'];
    const topic = r['Topic'];
    const status = r['Status'] || '';

    const norm = normalizeName(orig);
    if (!norm) return;

    if (!employeeMap[norm]) employeeMap[norm] = { original: orig, records: {} };
    employeeMap[norm].records[topic] = r;
    allTopics.add(topic);

    if (!topicMap[topic]) topicMap[topic] = [];
    topicMap[topic].push({ ...r, 'Employee Name': orig });

    if (status === 'Overdue') {
      overdueCount++;
      overdueEmps.add(norm);
    }
  });

  document.getElementById('overdueCount').textContent = overdueCount;
  document.getElementById('overdueEmps').textContent = overdueEmps.size;
  const banner = document.getElementById('overdueBanner');
  overdueCount ? banner.classList.remove('d-none') : banner.classList.add('d-none');

  renderTopics();
  populateEmployeeDropdown();
}

function renderTopics(filter = '') {
  const list = document.getElementById('topicList');
  list.innerHTML = '';
  Object.keys(topicMap).sort((a,b)=>a.localeCompare(b)).forEach(t => {
    if (filter && !t.toLowerCase().includes(filter.toLowerCase())) return;
    const cnt = topicMap[t].length;
    const link = LINKS[t] || '';
    const item = document.createElement('a');
    item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
    if (link) {
      item.innerHTML = `<a href="${link}" target="_blank" class="training-link">${t}</a> <span class="badge bg-primary rounded-pill">${cnt}</span>`;
    } else {
      item.innerHTML = `<span class="schedule-training">${t}</span> <span class="badge bg-primary rounded-pill">${cnt}</span>`;
    }
    item.onclick = e => { if (e.target.tagName==='A') return; showTopicDetail(t); };
    list.appendChild(item);
  });
}

document.getElementById('topicSearch').addEventListener('input', e => renderTopics(e.target.value.trim()));

function populateEmployeeDropdown() {
  const sel = document.getElementById('employeeSelect');
  sel.innerHTML = '<option value="">— Jump to employee —</option>';
  Object.keys(employeeMap).sort((a,b)=>a.localeCompare(b)).forEach(norm => {
    const opt = document.createElement('option');
    opt.value = norm;
    opt.textContent = employeeMap[norm].original;
    sel.appendChild(opt);
  });
  sel.onchange = e => e.target.value && showEmployeeDetail(e.target.value);
}

function showTopicDetail(topic) {
  const recs = topicMap[topic] || [];
  const link = LINKS[topic] || '';
  let html = `<div class="card-body"><div class="d-flex justify-content-between"><h4>${link ? `<a href="${link}" target="_blank" class="training-link">${topic}</a>` : `<span class="schedule-training">${topic}</span>`}</h4><button class="btn btn-success btn-sm" onclick="exportPDF()">PDF</button></div><p class="text-muted">${recs.length} record(s)</p><div class="table-responsive"><table id="detailTable" class="table table-sm table-hover"><thead><tr><th>Employee</th><th>Training</th><th>Expires</th><th>Days Left</th><th>Status</th></tr></thead><tbody>`;
  recs.forEach(r => {
    const norm = normalizeName(r['Employee Name']);
    const name = employeeMap[norm]?.original || r['Employee Name'];
    html += `<tr><td><a href="javascript:void(0)" onclick="showEmployeeDetail('${norm}')">${name}</a></td><td>${parseTextDate(r['Training Date'])}</td><td>${parseTextDate(r['Expiration Date'])}</td><td>${r['Days Remaining']||'-'}</td><td>${badge(r)}${notifyBadge(r)}</td></tr>`;
  });
  html += `</tbody></table></div></div>`;
  document.getElementById('detailPane').innerHTML = html;
}

function showEmployeeDetail(norm) {
  const emp = employeeMap[norm];
  if (!emp) return;
  const name = emp.original;
  const over = Object.entries(emp.records).filter(([,r])=>r['Status']==='Overdue').length;
  let html = `<div class="card-body"><div class="d-flex justify-content-between"><h4>${name}</h4><div><button class="btn btn-success btn-sm" onclick="exportPDF()">PDF</button><button class="btn btn-primary btn-sm" onclick="openOutlookEmail('${norm}')">Send Email</button></div></div><p class="text-muted">All trainings | Overdues: ${over}</p><div class="table-responsive"><table id="detailTable" class="table table-sm table-hover"><thead><tr><th>Topic</th><th>Training</th><th>Expires</th><th>Days Left</th><th>Status</th><th>Notify</th></tr></thead><tbody>`;
  Array.from(allTopics).sort((a,b)=>a.localeCompare(b)).forEach(topic => {
    const r = emp.records[topic];
    const link = LINKS[topic] || '';
    const cell = link ? `<a href="${link}" target="_blank" class="training-link">${topic}</a>` : `<span class="schedule-training">${topic}</span>`;
    if (r) {
      html += `<tr><td>${cell}</td><td>${parseTextDate(r['Training Date'])}</td><td>${parseTextDate(r['Expiration Date'])}</td><td>${r['Days Remaining']||'-'}</td><td>${badge(r)}</td><td>${notifyBadge(r)}</td></tr>`;
    } else {
      html += `<tr class="table-secondary"><td>${cell}</td><td colspan="5"><span class="badge badge-norecord">No Record</span></td></tr>`;
    }
  });
  html += `</tbody></table></div></div>`;
  document.getElementById('detailPane').innerHTML = html;
}

/* Dark-mode toggle */
document.getElementById('darkModeToggle').addEventListener('change', e => {
  document.body.classList.toggle('dark', e.target.checked);
  localStorage.setItem('darkMode', e.target.checked);
});
if (localStorage.getItem('darkMode') === 'true') {
  document.getElementById('darkModeToggle').checked = true;
  document.body.classList.add('dark');
}

/* Start */
buildData();
setInterval(buildData, 600000);