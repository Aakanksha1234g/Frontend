// ScenesDocxDownloadButton.jsx → FINAL FIXED & WORKING (No Errors!)
import DocxDownloadButton from '@shared/docxDownload/DocxDownloadButton';
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Footer,
  ImageRun,
} from 'docx';

// Load logo from public folder
const loadImageBase64 = async () => {
  try {
    const res = await fetch("/logo.png");
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Footer logo not found");
    return null;
  }
};

// Footer: Small logo in bottom-right corner
const createFooterWithLogo = async () => {
  const base64 = await loadImageBase64();

  if (!base64) {
    return new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: "LORVEN AI Studio",
              size: 18,
              color: "999999",
              italics: true,
            }),
          ],
        }),
      ],
    });
  }

  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 },
        children: [
          new ImageRun({
            data: base64,
            transformation: {
              width: 140,
              height: 28,
            },
          }),
        ],
      }),
    ],
  });
};

// Cover Page
const createCoverPage = (projectName, createdBy) => [
  new Paragraph({ children: [new TextRun("\n\n\n\n\n\n\n\n")] }),

  new Paragraph({
    children: [
      new TextRun({
        text: projectName.toUpperCase(),
        bold: true,
        size: 60,
        color: "000000",
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
  }),

  new Paragraph({
    children: [
      new TextRun({
        text: "SCENES GENERATION",
        bold: true,
        size: 40,
        color: "555555",
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 800 },
  }),

  new Paragraph({
    children: [
      new TextRun({
        text: `Author: ${createdBy}`,
        bold: true,
        size: 36,
        color: "000000",
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 4000 },
  }),
];

// Scenes Content Page
const createScenesPage = (data) => [
  // Title: SCENE SUMMARIES
  new Paragraph({
    children: [
      new TextRun({
        text: "SCENE SUMMARIES",
        bold: true,
        allCaps: true,
        color: "000000",
        size: 36,
        font: "Times New Roman",
      }),
    ],
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { after: 1000 },
  }),

  ...data.map((scene, index) => {
    const header = `SCENE ${index + 1} – ${[
      scene.int_ext,
      scene.location,
    ]
      .filter(Boolean)
      .join('. ')} (${scene.shot_time || 'Day'})`;

    return [
      // Scene Header — 100% BLACK, ALL CAPS
      new Paragraph({
        children: [
          new TextRun({
            text: header,
            bold: true,
            allCaps: true,
            color: "000000",
            size: 26,
            font: "Times New Roman",
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 600, after: 300 },
      }),

      // Scene Title (if exists)
      scene.title
        ? new Paragraph({
            children: [
              new TextRun({
                text: scene.title,
                bold: true,
                size: 26,
                color: "000000",
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 200 },
            indent: { left: 200 },
          })
        : null,

      // Scene Summary — Justified + indented
      new Paragraph({
        children: [
          new TextRun({
            text: scene.text || "",
            size: 24,
            color: "000000",
            font: "Times New Roman",
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: 200, right: 200 },
        spacing: { after: 400, line: 360 },
      }),

      // Divider space
      new Paragraph({
        spacing: { after: 600 },
        children: [new TextRun("")],
      }),
    ].filter(Boolean);
  }).flat(),
];

// Main Generator — ALWAYS RETURNS A DOCUMENT
export const generateScenesDocx = async ({ data, projectName, createdBy }) => {
  const footer = await createFooterWithLogo();

  const doc = new Document({
    creator: "LORVEN AI Studio",
    title: `${projectName} - Scenes`,
    styles: {
      default: {
        document: {
          run: { font: "Times New Roman", size: 24, color: "000000" },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margins: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        footers: { default: footer },
        children: createCoverPage(projectName, createdBy),
      },
      {
        properties: {
          page: {
            margins: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
        footers: { default: footer },
        children: createScenesPage(data),
      },
    ],
  });

  return doc; // REQUIRED!
};

// Download Button — CORRECT WAY (passes generator function)
const ScenesDocxDownloadButton = ({ data, projectName, createdBy }) => {
  if (!data || data.length === 0 || !projectName) return null;

  return (
    <DocxDownloadButton
      fileName={`${projectName.replace(/\s+/g, "_")}_scenes.docx`}
      docCreator={() => generateScenesDocx({ data, projectName, createdBy })}
    />
  );
};

export default ScenesDocxDownloadButton;