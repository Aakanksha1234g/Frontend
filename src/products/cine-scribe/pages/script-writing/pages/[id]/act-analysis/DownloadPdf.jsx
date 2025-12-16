import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles, Watermark, FirstPage } from '@shared/pdfDownload/PdfStyle';
import PdfDownloadButton from '@shared/pdfDownload/PdfDownloadButton';

const AnalysisPdfDocument = ({ data, projectName, createdBy }) => {
  if (!data) return null;

  return (
    <Document>
      {/* First Page */}
      <FirstPage
        projectName={projectName}
        createdBy={createdBy}
        reportType={'Act Analysis'}
      />

      {/* One Page per Act */}
      {data.act_wise_analysis_data?.map((act, index) => (
        <Page key={index} size="A4" style={styles.page}>
          <Watermark />

          <Text style={[styles.title, { marginBottom: 20 }]}>
            {act.act_name}
          </Text>

          <View style={{ paddingLeft: 10 }}>
            <Text style={[styles.body, { marginBottom: 8 }]}>
              <Text style={styles.heading3}>Act Description:</Text>{' '}
              {act.analysis.act_description}
            </Text>
            <Text style={[styles.body, { marginBottom: 8 }]}>
              <Text style={styles.heading3}>Act Definition Alignment:</Text>{' '}
              {act.analysis.act_definition_alignment}
            </Text>
            <Text style={[styles.body, { marginBottom: 8 }]}>
              <Text style={styles.heading3}>
                Philosophical Theme Alignment:
              </Text>{' '}
              {act.analysis.philosophical_theme_alignment}
            </Text>
            <Text style={[styles.body, { marginBottom: 8 }]}>
              <Text style={styles.heading3}>Protagonist Flaw Alignment:</Text>{' '}
              {act.analysis.protagonist_flaw_alignment}
            </Text>
            <Text style={[styles.body, { marginBottom: 8 }]}>
              <Text style={styles.heading3}>Subconscious Idea Alignment:</Text>{' '}
              {act.analysis.subconscious_idea_alignment}
            </Text>
            <Text style={[styles.body, { marginBottom: 8 }]}>
              <Text style={styles.heading3}>Suggestions:</Text>{' '}
              {act.analysis.suggestions}
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};

const AnalysisPdfDownloadButton = ({ data, projectName, createdBy }) => {
  if (!data) return null;

  return (
    <PdfDownloadButton
      documentComponent={
        <AnalysisPdfDocument
          data={data}
          projectName={projectName}
          createdBy={createdBy}
        />
      }
      fileName={`${projectName.split(' ').join('_')}_Act_Analysis.pdf`}
    />
  );
};

export default AnalysisPdfDownloadButton;
