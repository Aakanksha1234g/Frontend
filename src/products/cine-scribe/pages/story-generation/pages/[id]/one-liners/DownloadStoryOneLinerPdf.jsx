import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles, Watermark, FirstPage } from '@shared/pdfDownload/PdfStyle';
import PdfDownloadButton from '@shared/pdfDownload/PdfDownloadButton';

// PDF Document Component
const OneLinersPdfDocument = ({ data, projectName, createdBy }) => {
  if (!data || data.length === 0) return null;

  return (
    <Document>
      {/* First Page */}
      <FirstPage
        projectName={projectName}
        createdBy={createdBy}
        reportType={'Oneliners Generation'}
      />

      {/* Beat Sheet Page */}
      <Page size="A4" style={[styles.page, { paddingBottom: 40 }]}>
        <Watermark />

        <Text style={[styles.title, { marginBottom: 20 }]}>Oneliners</Text>

        {data.map((beat, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <Text style={[styles.heading2]}>Oneliner {index + 1}</Text>
            <Text style={styles.body}>{beat.text}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

// Download Button Component
const OneLinersPdfDownloadButton = ({ data, projectName, createdBy }) => {
  if (!data || data.length === 0 || !projectName) return null;

  return (
    <PdfDownloadButton
      documentComponent={
        <OneLinersPdfDocument
          data={data}
          projectName={projectName}
          createdBy={createdBy}
        />
      }
      fileName={`${projectName.replace(/\s+/g, '_')}_oneliners.pdf`}
    />
  );
};

export default OneLinersPdfDownloadButton;
