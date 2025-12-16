import { Document, Page, Text } from '@react-pdf/renderer';
import { styles, Watermark, FirstPage } from '@shared/pdfDownload/PdfStyle';
import PdfDownloadButton from '@shared/pdfDownload/PdfDownloadButton';

const StoryPdfDocument = ({ data, projectName, createdBy }) => {
  if (!data) return null;

  return (
    <Document>
      <FirstPage
        projectName={projectName}
        createdBy={createdBy}
        reportType={'Story Arena Generation'}
      />
      {/* Graph Data Page */}
      <Page size="A4" style={[styles.page, { paddingBottom: 40 }]}>
        <Watermark />

        <Text style={[styles.title, { marginBottom: 20 }]}>Story</Text>
        <Text style={[styles.body, { marginBottom: 8 }]}>{data}</Text>
      </Page>
    </Document>
  );
};

const StoryPdfDownloadButton = ({ data, projectName, createdBy }) => {
  if (!data || !projectName) return null;

  return (
    <PdfDownloadButton
      documentComponent={
        <StoryPdfDocument
          data={data}
          projectName={projectName}
          createdBy={createdBy}
        />
      }
      fileName={`${projectName.split(' ').join('_')}_story_arena.pdf`}
    />
  );
};

export default StoryPdfDownloadButton;
