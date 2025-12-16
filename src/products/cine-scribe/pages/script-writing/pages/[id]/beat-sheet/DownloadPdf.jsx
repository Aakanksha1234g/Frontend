import React from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { styles, Watermark, FirstPage } from '@shared/pdfDownload/PdfStyle';
import PdfDownloadButton from '@shared/pdfDownload/PdfDownloadButton';

const BeatSheetPdfDocument = ({
  data,
  graphImages,
  projectName,
  createdBy,
}) => {

 if (!data || !Array.isArray(data) || data.length === 0) {
   return (
     <Document>
       <Page size="A4" style={styles.page}>
         <Watermark />
         <Text>No beat sheet data available.</Text>
       </Page>
     </Document>
   );
 }

 

  return (
    <Document>
      <FirstPage
        projectName={projectName}
        createdBy={createdBy}
        reportType={'Beat Sheet'}
      />

      {/* Graph Data Page */}
      {/* <Page size="A4" style={[styles.page, { paddingBottom: 40 }]}>
        <Watermark />

        <Text style={[styles.title, { marginBottom: 20 }]}>
          Beat Sheet Engagement Overview
        </Text> */}

        {/* Commented graph image rendering section */}
        {/*
        {graphImages ? (
          <>
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.heading1}>Beat Sheet Engagement Graph</Text>
              <Text style={[styles.body, { lineHeight: 1.4 }]}>
                Each point reflects a key moment in the story. The flow below
                represents how the audience emotionally connects through the
                film’s journey — not just the plot.
              </Text>
            </View>

            <View
              style={{
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Image
                src={graphImages}
                style={{
                  width: '90%',
                  height: 'auto',
                  maxHeight: '300pt',
                  objectFit: 'contain',
                }}
                wrap={false}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.heading1}>Reading the Flow</Text>
              <View style={{ paddingLeft: 10 }}>
                <Text style={[styles.body, { marginBottom: 4 }]}>
                  • Rising Graph line indicates emotional tension or audience thrill.
                </Text>
                <Text style={[styles.body, { marginBottom: 4 }]}>
                  • A falling graph line indicates a narrative transition or breathing room.
                </Text>
                <Text style={[styles.body, { marginBottom: 4 }]}>
                  • Each beat is a high-impact narrative event.
                </Text>
              </View>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.heading1}>Engagement Zones</Text>
              <View style={{ paddingLeft: 10 }}>
                <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                  <Text
                    style={[
                      styles.body,
                      { color: '#4CAF50', fontWeight: 'bold', width: 60 },
                    ]}
                  >
                    High
                  </Text>
                  <Text style={styles.body}>
                    – Climactic moments, major reveals, or intense action
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                  <Text
                    style={[
                      styles.body,
                      { color: '#FFC107', fontWeight: 'bold', width: 60 },
                    ]}
                  >
                    Medium
                  </Text>
                  <Text style={styles.body}>
                    – Character development, plot progression, or setup
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                  <Text
                    style={[
                      styles.body,
                      { color: '#F44336', fontWeight: 'bold', width: 60 },
                    ]}
                  >
                    Low
                  </Text>
                  <Text style={styles.body}>
                    – Exposition, transitions, or breathing moments
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <Text style={[styles.heading1]}>No graph data available</Text>
        )}
        */}

        {/* Render simple text when graph image is skipped */}
        {/* <Text style={[styles.heading1]}>Graph visualization skipped</Text>
      </Page> */}

      {/* Analysis Data Page */}
      <Page size="A4" style={styles.page}>
        <Watermark />
        <Text style={[styles.title, { marginBottom: 20 }]}>
          Detailed Beat Sheet Analysis
        </Text>

        {data?.map((item, index) => (
          <View key={index} style={{ marginBottom: 25 }}>
            <Text style={[styles.heading2, { marginBottom: 12 }]}>
              {formatTitle(item.label)}
            </Text>
            <View style={{ paddingLeft: 10 }}>
              <Text style={[styles.body, { marginBottom: 8 }]}>
                {item.reason}
              </Text>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
};

// Helper functions
const formatTitle = str =>
  typeof str === 'string'
    ? str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    : 'Untitled';


const BeatsPdfDownloadButton = ({
  data,
  graphImages,
  projectName,
  createdBy,
}) => (
  <PdfDownloadButton
    documentComponent={
      <BeatSheetPdfDocument
        data={data}
        graphImages={graphImages}
        projectName={projectName}
        createdBy={createdBy}
      />
    }
    fileName={`${projectName.replace(/\s+/g, '_')}_beat_sheet.pdf`}
  />
);

export default BeatsPdfDownloadButton;
