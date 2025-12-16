import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles, Watermark, FirstPage } from '@shared/pdfDownload/PdfStyle';
import PdfDownloadButton from '@shared/pdfDownload/PdfDownloadButton';

// PDF Document Component
const BeatSheetPdfDocument = ({ data, projectName, createdBy }) => {
  if (!data || data.length === 0 || !projectName) return null;

  return (
    <Document>
      {/* First Page */}
      <FirstPage
        projectName={projectName}
        createdBy={createdBy}
        reportType={'Beat Sheet Generation'}
      />

      {/* Beat Sheet Page */}
      <Page size="A4" style={[styles.page, { paddingBottom: 40 }]}>
        <Watermark />

        <Text style={[styles.title, { marginBottom: 20 }]}>Beat Sheet</Text>

        {data.map((beat, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <Text style={[styles.heading2]}>Beat {index + 1}</Text>
            <Text style={styles.body}>{beat.text}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

// Download Button Component
const BeatSheetPdfDownloadButton = ({ data, projectName, createdBy }) => {
  if (!data || data.length === 0 || !projectName) return null;

  return (
    <PdfDownloadButton
      documentComponent={
        <BeatSheetPdfDocument
          data={data}
          projectName={projectName}
          createdBy={createdBy}
        />
      }
      fileName={`${projectName.replace(/\s+/g, '_')}_beat_sheet.pdf`}
    />
  );
};

export default BeatSheetPdfDownloadButton;
