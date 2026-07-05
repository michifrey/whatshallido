import type { RenderedResume, ResumeSection } from "./resume";

/**
 * Erzeugt aus dem aufbereiteten Lebenslauf eine echte .docx-Datei (tabellarischer
 * Lebenslauf im Schweizer Stil) und lädt sie herunter. Die docx-Bibliothek wird
 * dynamisch geladen, damit sie nicht im Haupt-Bundle landet.
 */
export async function downloadResumeDocx(resume: RenderedResume, filename: string): Promise<void> {
  const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
    Table, TableRow, TableCell, WidthType, BorderStyle,
  } = await import("docx");

  const BRAND = "2563EB";
  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };

  const children: Array<InstanceType<typeof Paragraph> | InstanceType<typeof Table>> = [];

  // Kopf: Name gross, Kontaktzeilen darunter.
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: resume.name || "Lebenslauf", bold: true, size: 44, color: BRAND })],
    }),
  );
  for (const zeile of resume.kontaktzeilen) {
    children.push(new Paragraph({ children: [new TextRun({ text: zeile, size: 20, color: "555555" })] }));
  }
  for (const eck of resume.eckdaten) {
    children.push(new Paragraph({ children: [new TextRun({ text: eck, size: 20, color: "555555" })] }));
  }
  children.push(new Paragraph({ text: "", spacing: { after: 120 } }));

  const sectionHeading = (titel: string) =>
    new Paragraph({
      spacing: { before: 240, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND, space: 2 } },
      children: [new TextRun({ text: titel.toUpperCase(), bold: true, size: 24, color: BRAND })],
    });

  const sectionTable = (section: ResumeSection) =>
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorders,
      rows: section.eintraege.map((e) => {
        const rechts: InstanceType<typeof Paragraph>[] = [
          new Paragraph({ children: [new TextRun({ text: e.titel, bold: true, size: 22 })] }),
          ...e.details.map(
            (d) => new Paragraph({ children: [new TextRun({ text: d, size: 22, color: "333333" })] }),
          ),
        ];
        return new TableRow({
          children: [
            new TableCell({
              width: { size: 28, type: WidthType.PERCENTAGE },
              borders: noBorders,
              margins: { top: 40, bottom: 40, right: 120 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: e.zeitraum, size: 22, color: "555555" })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 72, type: WidthType.PERCENTAGE },
              borders: noBorders,
              margins: { top: 40, bottom: 40 },
              children: rechts,
            }),
          ],
        });
      }),
    });

  for (const section of resume.sections) {
    children.push(sectionHeading(section.titel));
    children.push(sectionTable(section));
  }

  // Ort/Datum-Unterschriftszeile am Ende (typisch für CH-Lebensläufe).
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 480 },
      children: [new TextRun({ text: resume.name, size: 22 })],
    }),
  );

  const doc = new Document({
    styles: { default: { document: { run: { font: "Calibri" } } } },
    sections: [
      {
        properties: {
          page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
