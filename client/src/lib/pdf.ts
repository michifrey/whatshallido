/**
 * Erzeugt aus dem Brieftext ein echtes PDF (A4, auswählbarer Text) und lädt es herunter.
 * jsPDF wird dynamisch geladen, damit es nicht im Haupt-Bundle landet.
 */
export async function downloadLetterPdf(text: string, filename: string): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 64; // ~2.25 cm
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  // splitTextToSize bricht lange Zeilen um und erhält bestehende Zeilenumbrüche.
  const lines = doc.splitTextToSize(text, maxWidth) as string[];

  let y = margin;
  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  doc.save(filename);
}
