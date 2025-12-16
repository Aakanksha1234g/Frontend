// DownloadStoryDocx.jsx → FINAL FIXED & WORKING VERSION
import DocxDownloadButton from "@shared/docxDownload/DocxDownloadButton";
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Footer,
  ImageRun,
} from "docx";

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
    console.warn("Logo not found for footer");
    return null;
  }
};

// Footer with small logo in bottom-right corner
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
        text: "STORY ARENA GENERATION",
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

// Story Page
const createStoryPage = (storyText) => [
  new Paragraph({
    children: [
      new TextRun({
        text: "STORY",
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

  new Paragraph({
    children: [
      new TextRun({
        text: storyText,
        size: 24,
        color: "000000",
        font: "Times New Roman",
      }),
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, after: 400 },
    indent: { left: 200, right: 200 },
  }),
];

// Main Generator — ALWAYS RETURNS A DOCUMENT
export const generateStoryDocx = async ({ data, projectName, createdBy }) => {
  const footer = await createFooterWithLogo();

  const doc = new Document({
    creator: "LORVEN AI Studio",
    title: projectName,
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
        children: createStoryPage(data),
      },
    ],
  });

  return doc; // ← REQUIRED!
};

// Download Button — CORRECT WAY (passes generator function)
const StoryDocxDownloadButton = ({ data, projectName, createdBy }) => {
  if (!data || !projectName) return null;

  return (
    <DocxDownloadButton
      fileName={`${projectName.replace(/\s+/g, "_")}_story_arena.docx`}
      docCreator={() => generateStoryDocx({ data, projectName, createdBy })}
    />
  );
};

export default StoryDocxDownloadButton;