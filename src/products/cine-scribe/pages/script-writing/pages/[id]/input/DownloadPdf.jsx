import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  PDFDownloadLink,
} from '@react-pdf/renderer';
import download from '@assets/icons/DownloadMinimalistic.svg';
import { styles, Watermark, FirstPage } from '@shared/pdfDownload/PdfStyle';
import {
  sceneIntExtOptionList,
  sceneShotTimeOptionList,
} from '../../../../../../components/script-writing/evaluation/constant';
import IconButtonWithTooltip from '@shared/iconButton';

const ScriptPdfFormat = ({ data, projectName, createdBy }) => {
  if (!data) return null;

  const validateSceneData = scene => {
    const requiredKeys = [
      'scene_sequence_no',
      'scene_interior_exterior',
      'scene_location',
      'scene_shot_time',
      'scene_summary',
    ];
    const missingKeys = requiredKeys.filter(key => !(key in scene));

    if (missingKeys.length > 0) {
      console.error(
        `Scene data is missing required keys: ${missingKeys.join(', ')}`,
        scene
      );
      return false;
    }
    return true;
  };

  return (
    <Document>
      <FirstPage
        projectName={projectName}
        createdBy={createdBy}
        reportType={''}
      />

      {/* Add Script Breakdown Page */}
      <Page size="A4" style={styles.page}>
        <Watermark />

        {data.scene_summaries
          ?.filter(scene => scene.scene_sequence_no !== -1)
          ?.sort((a, b) => a.scene_sequence_no - b.scene_sequence_no)
          ?.map((scene, index) => {
            if (!validateSceneData(scene)) return null;

            return (
              <View key={index} style={{ marginBottom: 25 }}>
                <Text style={styles.heading2}>
                  Scene {scene.scene_sequence_no}
                </Text>
                <Text style={styles.body}>
                  {[
                    sceneIntExtOptionList.find(
                      option => option.id == scene.scene_interior_exterior
                    )?.value || scene.scene_interior_exterior,
                    scene?.scene_location,
                  ]
                    .filter(Boolean)
                    .join('. ')}
                  {scene.scene_shot_time &&
                    ` - ${
                      sceneShotTimeOptionList.find(
                        option => option.id == scene.scene_shot_time
                      )?.value || scene.scene_shot_time
                    }`}
                </Text>
                {scene.scene_title && (
                  <Text style={[styles.body, { marginTop: 8 }]}>
                    [ {scene.scene_title} ]
                  </Text>
                )}
                <Text style={[styles.body, { marginTop: 8 }]}>
                  {scene.scene_summary}
                </Text>
              </View>
            );
          })}
      </Page>
    </Document>
  );
};

const ScriptPdfDownloadButton = ({ data, projectName, createdBy }) => {
  if (!data) return null;

  return (
    <PDFDownloadLink
      document={
        <ScriptPdfFormat
          data={data}
          projectName={projectName}
          createdBy={createdBy}
        />
      }
      fileName={`${projectName}_report.pdf`}
    >
      {({ blob, url, loading, error }) =>
        loading ? (
          <button disabled className="button-secondary">
            Generating PDF...
          </button>
        ) : error ? (
          <button className="button-error" disabled>
            Error generating PDF!
          </button>
        ) : (
          <IconButtonWithTooltip
            imageUrl={download}
            altText="Download PDF"
            tooltipText="Download PDF"
            className="iconButton"
            position="bottom"
          />
        )
      }
    </PDFDownloadLink>
  );
};

export default ScriptPdfDownloadButton;
