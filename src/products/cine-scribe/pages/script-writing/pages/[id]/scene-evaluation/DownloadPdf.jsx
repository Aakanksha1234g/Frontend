import React, { useMemo } from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles, Watermark, FirstPage } from '@shared/pdfDownload/PdfStyle';
import PdfDownloadButton from '@shared/pdfDownload/PdfDownloadButton';

const SCENES_PER_PAGE = 5;

const AnalysisPdfDocument = React.memo(({ data, projectName, createdBy }) => {
  if (!data?.scene_summaries) return null;

  const chunkScenes = (scenes, chunkSize) => {
    return scenes.reduce((acc, scene, index) => {
      const chunkIndex = Math.floor(index / chunkSize);
      if (!acc[chunkIndex]) acc[chunkIndex] = [];
      acc[chunkIndex].push(scene);
      return acc;
    }, []);
  };

  const chunkedScenes = useMemo(
    () => chunkScenes(data.scene_summaries, SCENES_PER_PAGE),
    [data.scene_summaries]
  );

  return (
    <Document>
      <FirstPage
        projectName={projectName || 'Untitled'}
        createdBy={createdBy || 'Unknown'}
        reportType={'Scene-Wise Analysis'}
      />
      {chunkedScenes.map((scenesChunk, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <Watermark />
          {scenesChunk.map((scene, index) => (
            <SceneComponent
              key={scene?.scene_data_id || index}
              scene={scene}
              index={index}
              totalScenes={data.scene_summaries.length}
            />
          ))}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Total Duration: {data?.total_scene_duration || 'N/A'}
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
});

// Download Button Component
const SceneEvaluationPdfDownloadButton = ({ data, projectName, createdBy }) => {
  if (!data) return null;

  const memoizedDocument = useMemo(
    () => (
      <AnalysisPdfDocument
        data={data}
        projectName={projectName}
        createdBy={createdBy}
      />
    ),
    [data, projectName, createdBy]
  );

  return (
    <PdfDownloadButton
      documentComponent={memoizedDocument}
      fileName={`${projectName?.replace(/ /g, '_')}_Scene_Wise_Analysis.pdf`}
    />
  );
};

export default SceneEvaluationPdfDownloadButton;

// Memoized Scene Component to optimize rendering
const SceneComponent = React.memo(({ scene, index }) => {
  if (!scene) return null;

  return (
    <View key={scene.scene_data_id || index} style={styles.section}>
      <Text style={styles.heading1}>
        Scene {scene.scene_sequence_no || 'N/A'}:{' '}
        {scene.scene_title || 'Untitled'}
      </Text>
      <Text style={styles.subtitle}>
        Location: {scene.scene_location || 'Not specified'} | Duration:{' '}
        {scene.scene_duration || 'Unknown'}
      </Text>

      {scene?.scene_generated_data?.one_liner && (
        <>
          <Text style={styles.heading2}>One-liner</Text>
          <Text style={styles.body}>
            {scene.scene_generated_data.one_liner}
          </Text>
        </>
      )}

      {scene?.scene_generated_data?.scene_summary && (
        <>
          <Text style={styles.heading2}>Scene Summary</Text>
          <Text style={styles.body}>
            {scene.scene_generated_data.scene_summary}
          </Text>
        </>
      )}

      {scene?.scene_generated_data?.relevance_to_story_idea && (
        <>
          <Text style={styles.heading2}>Relevance to Story Idea</Text>
          <Text style={styles.body}>
            {scene.scene_generated_data.relevance_to_story_idea}
          </Text>
        </>
      )}

      {scene?.scene_generated_data?.scene_type && (
        <>
          <Text style={styles.heading2}>Scene Type</Text>
          <Text style={styles.body}>
            Scene Type: {scene.scene_generated_data.scene_type}
          </Text>
        </>
      )}

      {scene?.scene_generated_data?.suggestions && (
        <>
          <Text style={styles.heading2}>Suggestions</Text>
          <Text style={styles.body}>
            {scene.scene_generated_data.suggestions}
          </Text>
        </>
      )}

      {scene?.scene_generated_data?.scene_duration_analysis && (
        <View style={styles.section}>
          <Text style={styles.heading2}>Scene Duration Analysis</Text>
          {scene.scene_generated_data.scene_duration_analysis.map((shot, i) => (
            <View key={i} style={styles.characterBox}>
              <Text style={[styles.characterName, { fontWeight: 'bold' }]}>
                Shot {i + 1}
              </Text>
              <Text style={styles.body}>
                Description: {shot.shot_description}
              </Text>
              <Text style={styles.body}>Duration: {shot.shot_duration}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});
