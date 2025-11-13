// email.js
import { LINKS } from './links.js';
import { employeeMap } from './main.js';

export function openOutlookEmail(normName) {
  const emp = employeeMap[normName];
  if (!emp) return;
  const name = emp.original;
  const over = Object.entries(emp.records)
    .filter(([, r]) => r['Status'] === 'Overdue')
    .map(([topic, r]) => {
      const link = LINKS[topic] || 'Schedule Training';
      const exp = r['Expiration Date'] ? r['Expiration Date'] : 'N/A';
      return `• ${topic} (Expires: ${exp})\n  ${link}`;
    }).join('\n\n');

  const body = `Hi Team,

${name} has ${over.split('\n').filter(l=>l.startsWith('•')).length} overdue training(s):

${over || '• None'}

Please have ${name} complete the training ASAP.

Generated: ${new Date().toLocaleString()}
LWA Training Tracker`;

  const mail = `mailto:${RECIPIENT_EMAIL}?subject=Overdue Training: ${encodeURIComponent(name)}&body=${encodeURIComponent(body)}`;
  location.href = mail;
}