import type { RenderedEntry, RenderedResume, ResumeSection, TemplateId } from "./resume";
import { splitSections } from "./resume";

export interface DocxOptions {
  template: TemplateId;
  /** Akzentfarbe als Hex ohne #. */
  accent: string;
  /** Optionales Foto als Data-URL. */
  foto?: string;
}

const GREY = "6B7280";
const DARK = "1F2937";

function dataUrlToImage(dataUrl: string): { type: "png" | "jpg"; data: Uint8Array } {
  const [meta, b64] = dataUrl.split(",");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { type: meta.includes("image/png") ? "png" : "jpg", data: bytes };
}

/**
 * Baut aus dem aufbereiteten Lebenslauf ein docx-`Document` in der gewählten Vorlage
 * (klassisch, modern oder kreativ mit Seitenleiste). Die docx-Bibliothek wird dynamisch
 * geladen, damit sie nicht im Haupt-Bundle landet. Reine Dokument-Erzeugung ohne Browser-
 * APIs – dadurch auch in Node testbar.
 */
export async function buildResumeDoc(resume: RenderedResume, options: DocxOptions) {
  const d = await import("docx");
  const {
    Document, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun,
    Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, VerticalAlign,
  } = d;

  const accent = options.accent || "2563EB";
  const foto = options.foto ? dataUrlToImage(options.foto) : null;

  const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const noBorders = {
    top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE,
  };

  type Para = InstanceType<typeof Paragraph>;
  type Tbl = InstanceType<typeof Table>;

  const photoParagraph = (width: number, align?: (typeof AlignmentType)[keyof typeof AlignmentType]) =>
    foto
      ? new Paragraph({
          alignment: align,
          spacing: { after: 120 },
          children: [
            new ImageRun({
              type: foto.type,
              data: foto.data,
              transformation: { width, height: Math.round(width * 1.2) },
            }),
          ],
        })
      : null;

  const line = (text: string, opts: { size?: number; color?: string; bold?: boolean } = {}) =>
    new Paragraph({
      spacing: { after: 20 },
      children: [new TextRun({ text, size: opts.size ?? 20, color: opts.color ?? GREY, bold: opts.bold })],
    });

  // Zeitraum-Eintrag als Absätze (für Seitenleiste & einspaltige Absatz-Varianten).
  const entryParagraphs = (e: RenderedEntry, bodyColor: string, mutedColor: string): Para[] => {
    const out: Para[] = [];
    if (e.zeitraum) out.push(new Paragraph({ children: [new TextRun({ text: e.zeitraum, size: 18, color: mutedColor })] }));
    out.push(new Paragraph({ children: [new TextRun({ text: e.titel, bold: true, size: 22, color: bodyColor })] }));
    for (const det of e.details) out.push(new Paragraph({ children: [new TextRun({ text: det, size: 20, color: bodyColor })] }));
    out.push(new Paragraph({ text: "", spacing: { after: 80 } }));
    return out;
  };

  // Zeitraum-Eintrag als Tabellenzeile (Datum links, Inhalt rechts) – für klassisch/modern.
  const entryRow = (e: RenderedEntry) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 26, type: WidthType.PERCENTAGE },
          borders: noBorders,
          margins: { top: 40, bottom: 40, right: 140 },
          children: [new Paragraph({ children: [new TextRun({ text: e.zeitraum, size: 20, color: GREY })] })],
        }),
        new TableCell({
          width: { size: 74, type: WidthType.PERCENTAGE },
          borders: noBorders,
          margins: { top: 40, bottom: 40 },
          children: [
            new Paragraph({ children: [new TextRun({ text: e.titel, bold: true, size: 22, color: DARK })] }),
            ...e.details.map((det) => new Paragraph({ children: [new TextRun({ text: det, size: 20, color: "374151" })] })),
          ],
        }),
      ],
    });

  const sectionHeadingLine = (titel: string, color: string, underline: string) =>
    new Paragraph({
      spacing: { before: 240, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: underline, space: 2 } },
      children: [new TextRun({ text: titel.toUpperCase(), bold: true, size: 24, color })],
    });

  const tableSection = (section: ResumeSection): (Para | Tbl)[] => [
    sectionHeadingLine(section.titel, accent, accent),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders, rows: section.eintraege.map(entryRow) }),
  ];

  // ---- Vorlage: klassisch (schwarz-weiss, Datum/Inhalt-Tabelle) ----
  function buildClassic(): (Para | Tbl)[] {
    const children: (Para | Tbl)[] = [];
    const photo = photoParagraph(84, AlignmentType.RIGHT);
    if (photo) {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: noBorders,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 72, type: WidthType.PERCENTAGE }, borders: noBorders, verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({ children: [new TextRun({ text: resume.name || "Lebenslauf", bold: true, size: 40, color: DARK })] }),
                    ...resume.kontaktzeilen.map((z) => line(z)),
                    ...resume.eckdaten.map((z) => line(z)),
                  ],
                }),
                new TableCell({ width: { size: 28, type: WidthType.PERCENTAGE }, borders: noBorders, children: [photo] }),
              ],
            }),
          ],
        }),
      );
    } else {
      children.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: resume.name || "Lebenslauf", bold: true, size: 40, color: DARK })] }));
      resume.kontaktzeilen.forEach((z) => children.push(line(z)));
      resume.eckdaten.forEach((z) => children.push(line(z)));
    }
    children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
    for (const section of resume.sections) {
      children.push(sectionHeadingLine(section.titel, DARK, DARK));
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noBorders, rows: section.eintraege.map(entryRow) }));
    }
    return children;
  }

  // ---- Vorlage: modern (farbiges Namensbanner, farbige Überschriften) ----
  function buildModern(): (Para | Tbl)[] {
    const children: (Para | Tbl)[] = [];
    const bannerText = new TableCell({
      borders: noBorders,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 200, bottom: 200, left: 240, right: 200 },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: accent },
      children: [
        new Paragraph({ children: [new TextRun({ text: resume.name || "Lebenslauf", bold: true, size: 48, color: "FFFFFF" })] }),
        ...resume.kontaktzeilen.map((z) => new Paragraph({ spacing: { before: 20 }, children: [new TextRun({ text: z, size: 20, color: "EAF1FF" })] })),
        ...resume.eckdaten.map((z) => new Paragraph({ spacing: { before: 20 }, children: [new TextRun({ text: z, size: 20, color: "EAF1FF" })] })),
      ],
    });
    const photo = photoParagraph(84, AlignmentType.CENTER);
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders,
        rows: [
          new TableRow({
            children: photo
              ? [
                  bannerText,
                  new TableCell({
                    width: { size: 24, type: WidthType.PERCENTAGE }, borders: noBorders, verticalAlign: VerticalAlign.CENTER,
                    shading: { type: ShadingType.CLEAR, color: "auto", fill: accent },
                    margins: { top: 160, bottom: 160, right: 160 },
                    children: [photo],
                  }),
                ]
              : [bannerText],
          }),
        ],
      }),
    );
    children.push(new Paragraph({ text: "", spacing: { after: 160 } }));
    for (const section of resume.sections) children.push(...tableSection(section));
    return children;
  }

  // ---- Vorlage: kreativ (farbige Seitenleiste links, Hauptspalte rechts) ----
  function buildSidebar(): (Para | Tbl)[] {
    const { sidebar, main } = splitSections(resume.sections);
    const light = "F1F5F9";

    const sidebarChildren: Para[] = [];
    const photo = photoParagraph(120, AlignmentType.CENTER);
    if (photo) sidebarChildren.push(photo);
    sidebarChildren.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "KONTAKT", bold: true, size: 22, color: "FFFFFF" })] }));
    resume.kontaktzeilen.forEach((z) => sidebarChildren.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: z, size: 19, color: light })] })));
    resume.eckdaten.forEach((z) => sidebarChildren.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: z, size: 19, color: light })] })));
    for (const section of sidebar) {
      sidebarChildren.push(new Paragraph({ spacing: { before: 200, after: 80 }, children: [new TextRun({ text: section.titel.toUpperCase(), bold: true, size: 22, color: "FFFFFF" })] }));
      section.eintraege.forEach((e) => entryParagraphs(e, light, "CBD5E1").forEach((p) => sidebarChildren.push(p)));
    }

    const mainChildren: Para[] = [
      new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: resume.name || "Lebenslauf", bold: true, size: 46, color: accent })] }),
    ];
    for (const section of main) {
      mainChildren.push(sectionHeadingLine(section.titel, accent, accent));
      section.eintraege.forEach((e) => entryParagraphs(e, "1F2937", GREY).forEach((p) => mainChildren.push(p)));
    }

    return [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noBorders,
        columnWidths: [3200, 6400],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 34, type: WidthType.PERCENTAGE },
                borders: noBorders,
                shading: { type: ShadingType.CLEAR, color: "auto", fill: accent },
                margins: { top: 260, bottom: 400, left: 220, right: 220 },
                children: sidebarChildren,
              }),
              new TableCell({
                width: { size: 66, type: WidthType.PERCENTAGE },
                borders: noBorders,
                margins: { top: 260, bottom: 260, left: 300, right: 200 },
                children: mainChildren,
              }),
            ],
          }),
        ],
      }),
    ];
  }

  const builders: Record<TemplateId, () => (Para | Tbl)[]> = {
    klassisch: buildClassic,
    modern: buildModern,
    kreativ: buildSidebar,
  };
  const children = builders[options.template]();

  const marginKreativ = options.template === "kreativ";
  return new Document({
    styles: { default: { document: { run: { font: "Calibri" } } } },
    sections: [
      {
        properties: {
          page: {
            margin: marginKreativ
              ? { top: 420, bottom: 420, left: 420, right: 420 }
              : { top: 1000, bottom: 1000, left: 1100, right: 1100 },
          },
        },
        children,
      },
    ],
  });
}

/**
 * Erzeugt die .docx-Datei in der gewählten Vorlage und lädt sie im Browser herunter.
 */
export async function downloadResumeDocx(
  resume: RenderedResume,
  filename: string,
  options: DocxOptions,
): Promise<void> {
  const { Packer } = await import("docx");
  const doc = await buildResumeDoc(resume, options);
  const blob = await Packer.toBlob(doc);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
