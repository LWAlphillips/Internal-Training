// pdf.js
let html2canvas, jsPDF;

async function loadPDFLibs() {
  if (!window.html2canvas) {
    const s = document.createElement('script');
    s.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
    document.head.appendChild(s);
    await new Promise(r => s.onload = r);
    html2canvas = window.html2canvas;
  }
  if (!window.jspdf) {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(s);
    await new Promise(r => s.onload = r);
    jsPDF = window.jspdf.jsPDF;
  }
}

export async function exportPDF() {
  await loadPDFLibs();
  setTimeout(async () => {
    try {
      const pane = document.querySelector('#detailPane .card-body');
      if (!pane) { alert('Click an employee first'); return; }

      const clone = pane.cloneNode(true);
      clone.querySelectorAll('button').forEach(b => b.remove());

      // style for PDF
      clone.style.padding = '20px';
      clone.style.background = '#fff';
      clone.style.border = '1px solid #ddd';
      clone.style.borderRadius = '12px';

      document.body.appendChild(clone);
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.width = '800px';

      const canvas = await html2canvas(clone, { scale: 2, useCORS: true });
      document.body.removeChild(clone);

      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = 190;
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, 'PNG', 10, 10, w, h);

      const name = pane.querySelector('h4')?.textContent?.trim() || 'Training-Report';
      pdf.save(`${name.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (e) {
      console.error(e);
      alert('PDF failed – open console (F12)');
    }
  }, 500);
}