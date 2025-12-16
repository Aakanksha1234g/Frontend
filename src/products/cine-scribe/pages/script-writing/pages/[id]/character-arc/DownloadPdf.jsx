import React from 'react';
import { Document, Page, Text, View /*, Image*/ } from '@react-pdf/renderer';
import { styles, Watermark, FirstPage } from '@shared/pdfDownload/PdfStyle';
import PdfDownloadButton from '@shared/pdfDownload/PdfDownloadButton';

const AnalysisPdfDocument = ({
  data,
  /* graphImages, */ projectName,
  createdBy,
}) => {
  if (!data) return null;

  return (
    <Document>
      <FirstPage
        projectName={projectName}
        createdBy={createdBy}
        reportType={'Character Arc'}
      />

      {/* Graph Data Page */}
      {/* <Page size="A4" style={[styles.page, { paddingBottom: 40 }]}>
        <Watermark />

        <Text style={[styles.title, { marginBottom: 20 }]}>
          Character Arc Analysis Metrics
        </Text> */}

        {/* 
        <View>
          {graphImages ? (
            <View style={{ marginBottom: 12 }} wrap={false}>
              <Text style={styles.heading1}>
                Emotional Evolution of the Character Arc
              </Text>

              <Text style={[styles.body, { lineHeight: 1.4 }]}>
                This line chart visualizes how deeply each key emotional
                dimension is explored across the character's journey. Each point
                on the line corresponds to a moment in the arc, tracking
                emotional growth, breakdown, or stagnation.
              </Text>

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
                <Text
                  style={[
                    styles.body,
                    { fontWeight: 'semibold', marginBottom: 8 },
                  ]}
                >
                  How to interpret this chart:
                </Text>
                <View style={{ paddingLeft: 10 }}>
                  <Text style={[styles.body, { marginBottom: 4 }]}>
                    • The X-axis marks emotional beats or narrative phases
                    (e.g., motivation, flaw, climax, transformation)
                  </Text>
                  <Text style={[styles.body, { marginBottom: 4 }]}>
                    • The Y-axis (0 to 10) indicates how deeply each emotional
                    layer is portrayed
                  </Text>
                  <Text style={[styles.body, { marginBottom: 4 }]}>
                    • A smooth rising curve often shows growing emotional
                    complexity, while dips can highlight key breakdowns or
                    regressions
                  </Text>
                  <Text style={[styles.body, { marginBottom: 4 }]}>
                    • Each point's color reflects emotional intensity:
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    <Text
                      style={[
                        styles.body,
                        { color: '#4CAF50', fontWeight: 'bold' },
                      ]}
                    >
                      Green
                    </Text>
                    <Text style={styles.body}> for High, </Text>
                    <Text
                      style={[
                        styles.body,
                        { color: '#FFC107', fontWeight: 'bold' },
                      ]}
                    >
                      Orange
                    </Text>
                    <Text style={styles.body}> for Medium, </Text>
                    <Text
                      style={[
                        styles.body,
                        { color: '#F44336', fontWeight: 'bold' },
                      ]}
                    >
                      Red
                    </Text>
                    <Text style={styles.body}> for Low</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <Text style={[styles.heading1]}>No graph data available</Text>
          )}
        </View>
        */}

        {/* When graphImages are not sent */}
        {/* <View>
          <Text style={[styles.heading1]}>
            Graph visualization not included
          </Text>
        </View>
      </Page> */}

      {/* Analysis Data Page */}
      <Page size="A4" style={styles.page}>
        <Watermark />
        <Text style={[styles.title, { marginBottom: 20 }]}>
          Detailed Character Analysis
        </Text>

        {data.character_arc_analysis_data?.map(item => (
          <View key={item.arc_name} style={{ marginBottom: 25 }}>
            <Text style={[styles.heading2, { marginBottom: 12 }]}>
              {formatTitle(item.arc_name)}
            </Text>
            <View style={{ paddingLeft: 10 }}>
              <Text style={[styles.body, { marginBottom: 8 }]}>
                {item.analysis}
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

const getGraphDescription = () => {
  return {
    core_motivation:
      "This measures how clearly defined and compelling the character's fundamental drives and desires are throughout the story.",
    past_trauma:
      "This indicates how effectively past experiences and wounds shape the character's current behavior and decisions.",
    flaws:
      "This tracks how the character's weaknesses and imperfections create meaningful conflict and growth opportunities.",
    breaking_point:
      "This measures the impact of pivotal moments that challenge the character's beliefs and force critical decisions.",
    emotional_conflicts:
      "This shows the depth and complexity of the character's internal and external struggles.",
    transformation:
      "This tracks the magnitude of change in the character's personality, beliefs, or behavior throughout their journey.",
  };
};

const CharacterArcPdfDownloadButton = ({
  data,
  /* graphImages, */
  projectName,
  createdBy,
}) => (
  <PdfDownloadButton
    documentComponent={
      <AnalysisPdfDocument
        data={data}
        /* graphImages={graphImages} */
        projectName={projectName}
        createdBy={createdBy}
      />
    }
    fileName={`${projectName.split(' ').join('_')}_Character_Arc.pdf`}
  />
);

export default CharacterArcPdfDownloadButton;
