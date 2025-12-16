import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles, Watermark, FirstPage } from '@shared/pdfDownload/PdfStyle';
import PdfDownloadButton from '@shared/pdfDownload/PdfDownloadButton';

const AnalysisPdfDocument = ({
  data,
  projectName,
  createdBy,
  criticismLevel,
}) => {
  if (!data) return null;

  return (
    <Document>
      <FirstPage
        projectName={projectName}
        createdBy={createdBy}
        reportType={`Final Report`}
      />

      {/* Plot and Theme Page */}
      <Page size="A4" style={styles.page}>
        <Watermark />

        {Object.entries(data).map(([subKey, subValue], subIndex) => (
          <>
            <Text style={[styles.heading2, { marginBottom: 20 }]}>
              {subKey.replace(/_/g, ' ')}{' '}
            </Text>
            <View style={{ marginBottom: 25 }}>
              <Text style={styles.body}>{subValue}</Text>
            </View>
          </>
        ))}
      </Page>
    </Document>
  );
};

const FinalAnalysisPdfDownloadButton = ({
  data,
  projectName,
  createdBy,
  criticismLevel,
}) => {
  if (!data) return null;

  return (
    <PdfDownloadButton
      documentComponent={
        <AnalysisPdfDocument
          data={data}
          projectName={projectName}
          createdBy={createdBy}
          criticismLevel={criticismLevel}
        />
      }
      fileName={`${projectName.split(' ').join('_')}_Final_Report.pdf`}
    />
  );
};

export default FinalAnalysisPdfDownloadButton;
