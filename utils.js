// utils.js
export function parseTextDate(dateStr) {
  if (!dateStr) return 'N/A';
  const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  const m = dateStr.match(/(\w{3})\s+(\d{1,2}),\s+(\d{4})/);
  if (m) {
    const [, mon, day, yr] = m;
    return new Date(yr, months[mon], day).toLocaleDateString('en-US', {year:'numeric', month:'short', day:'numeric'});
  }
  return dateStr || 'N/A';
}

export function normalizeName(name) {
  return name?.replace(/Perira/gi, 'Pereira')
            .replace(/Silviera/gi, 'Silveira')
            .replace(/[^\w\s]/g, '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ') || '';
}

export function badge(r) {
  const s = r['Status'] || '';
  const days = r['Days Remaining'] || '';
  const comp = r['Completion Date'] ? parseTextDate(r['Completion Date']) : '';
  if (s === 'Completed') return `<span class="badge badge-comp">Completed${comp !== 'N/A' ? ' ('+comp+')' : ''}</span>`;
  if (s === 'Not Due') return `<span class="badge badge-due">Not Due${days ? ' ('+days+'d)' : ''}</span>`;
  if (s === 'Overdue') return `<span class="badge badge-over">Overdue${days ? ' ('+days+'d)' : ''}</span>`;
  return `<span class="badge bg-secondary">${s || '—'}</span>`;
}

export function notifyBadge(r) {
  return r['Status'] === 'Overdue' && parseInt(r['Days Remaining']) < 0 ? '<span class="badge badge-notify ms-1">Notify</span>' : '';
}