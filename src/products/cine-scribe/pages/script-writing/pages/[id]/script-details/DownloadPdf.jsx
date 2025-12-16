import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles, Watermark, FirstPage } from '@shared/pdfDownload/PdfStyle';
import PdfDownloadButton from '@shared/pdfDownload/PdfDownloadButton';

const AnalysisPdfDocument = ({ data, projectName, createdBy }) => {
  if (!data) return null;


  // Format arrays into strings
  const formattedProtagonistFlaw = data.protagonist_flaw.join(', ');

  // Format characters_present object into a string
  const formattedCharactersPresent = Object.entries(
    data.characters_present || {}
  )
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return (
    <Document>
      <FirstPage
        projectName={projectName || ''}
        createdBy={createdBy}
        reportType={'Script Details'}
      />

      {/* Plot and Theme Page */}
      <Page size="A4" style={styles.page}>
        <Watermark />

        <Text style={[styles.heading2, { marginBottom: 20 }]}>Logline</Text>
        <View style={{ marginBottom: 25 }}>
          <Text style={styles.body}>{data.logline}</Text>
        </View>

        <Text style={[styles.heading2, { marginBottom: 20 }]}>
          Protagonist Name
        </Text>
        <View style={{ marginBottom: 25 }}>
          <Text style={styles.body}>{data.protagonist_name}</Text>
        </View>

        <Text style={[styles.heading2, { marginBottom: 20 }]}>
          Protagonist Flaw
        </Text>
        <View style={{ marginBottom: 25 }}>
          <Text style={styles.body}>{formattedProtagonistFlaw}</Text>
        </View>

        <Text style={[styles.heading2, { marginBottom: 20 }]}>
          Subconscious Idea
        </Text>
        <View style={{ marginBottom: 25 }}>
          <Text style={styles.body}>{data.subconscious_idea}</Text>
        </View>

        <Text style={[styles.heading2, { marginBottom: 20 }]}>
          Philosophical Theme
        </Text>
        <View style={{ marginBottom: 25 }}>
          <Text style={styles.body}>{data.philosophical_theme}</Text>
        </View>

        <Text style={[styles.heading2, { marginBottom: 20 }]}>
          Characters Present
        </Text>
        <View style={{ marginBottom: 25 }}>
          {Object.entries(data.characters_present || {}).map(
            ([character, description], index) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <Text
                  style={[
                    styles.body,
                    // { fontSize: 12, fontWeight: 'bold' },
                  ]}
                >
                  {character} : {description}
                </Text>
                
              </View>
            )
          )}
        </View>
      </Page>
    </Document>
  );
};

const ScriptInfoPdfDownloadButton = ({ data, projectName, createdBy }) => {

  if (!data ) return null;
 

  return (
    <PdfDownloadButton
      documentComponent={
        <AnalysisPdfDocument
          data={data}
          projectName={projectName}
          createdBy={createdBy}
        />
      }
      fileName={`${projectName.split(' ').join('_')}_Script_Details.pdf`}
    />
  );
};

export default ScriptInfoPdfDownloadButton;
