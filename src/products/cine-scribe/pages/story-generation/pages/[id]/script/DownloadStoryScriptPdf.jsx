import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles, Watermark, FirstPage } from '@shared/pdfDownload/PdfStyle';
import PdfDownloadButton from '@shared/pdfDownload/PdfDownloadButton';

// PDF Document Component
const ScenesPdfDocument = ({ data, projectName, createdBy }) => {
  if (!data || data.length === 0) return null;


  return (
    <Document>
      {/* First Page */}
      <FirstPage
        projectName={projectName}
        createdBy={createdBy}
        reportType={'Scenes Generation'}
      />

      {/* Scenes Page */}
      <Page size="A4" style={[styles.page, { paddingBottom: 40 }]}>
        <Watermark />

        <Text style={[styles.title, { marginBottom: 20 }]}>
          Scene Summaries
        </Text>

        {data.map((scene, index) => (
          <View key={scene.id} style={{ marginBottom: 25 }}>
            {/* <Text style={styles.heading2}>Scene {index + 1}</Text> */}

            <Text style={styles.heading2}>
              Scene {index + 1}{' '}
              {[scene.int_ext, scene.location].filter(Boolean).join('. ')}
              {` - ${scene.shot_time}`}
            </Text>

            {scene.title && (
              <Text style={[styles.body, { marginTop: 8 }]}>{scene.title}</Text>
            )}

            <Text style={[styles.body, { marginTop: 8 }]}>{scene.text}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};

// Download Button Component
const ScenesPdfDownloadButton = ({ data, projectName, createdBy }) => {
  if (!data || data.length === 0 || !projectName) return null;

  return (
    <PdfDownloadButton
      documentComponent={
        <ScenesPdfDocument
          data={data}
          projectName={projectName}
          createdBy={createdBy}
        />
      }
      fileName={`${projectName.replace(/\s+/g, '_')}_scenes.pdf`}
    />
  );
};

export default ScenesPdfDownloadButton;
