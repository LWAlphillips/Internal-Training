// data.js
export const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRMwtFhCZCDqPeWROrxXY6ytBvitNzyVKfGyNRQ5lfTXChyrqJDwBET4tRF4ocoSsafk0O0fUwoDxj6/pub?gid=1442283748&single=true&output=csv';
export const RECIPIENT_EMAIL = 'your-team@company.com';

export async function loadData() {
  const resp = await fetch(`${SHEET_URL}&_=${Date.now()}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const text = await resp.text();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const rec = {};
    headers.forEach((h, i) => rec[h] = vals[i] || '');
    return rec;
  }).filter(r => r['Employee Name'] && r['Topic']);
  return rows;
}