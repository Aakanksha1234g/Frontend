import { Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const date = new Date();

const datePart = date.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const timePart = date.toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    position: 'relative',
    paddingBottom: 50,
  },

  /* Centered Watermark */
  watermarkContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },

  /* Typography */
  title: {
    fontSize: 26,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'semibold',
    color: 'gray',
    marginBottom: 10,
  },

  heading1: {
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 10,
  },

  heading2: {
    fontSize: 14,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 8,
  },

  heading3: {
    fontSize: 12,
    marginBottom: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },

  body: {
    fontSize: 11,
    lineHeight: 1.5,
    textAlign: 'justify',
  },

  /* Additional Utility Styles */
  centeredText: {
    textAlign: 'center',
    marginBottom: 10,
  },

  section: {
    marginBottom: 15,
  },
  firstPage: {
    flexDirection: 'column',
    justifyContent: 'space-between', // Ensure top & bottom sections are spaced evenly
    alignItems: 'center',
    height: '100%',
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 40,
    paddingBottom: 10,
    fontSize: 12,
    position: 'relative',
  },

  topFirstPage: {
    flex: 1, // Make it take equal space as the footer section
    justifyContent: 'center', // Center content within this section
    textAlign: 'center',
    alignSelf: 'stretch',
  },

  bottomRightFirstPage: {
    flex: 0.5, // Reduce space taken
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    alignSelf: 'stretch',
    paddingRight: 10,
    marginBottom: 100, // Move it slightly up
  },

  centeredWatermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },

  centeredWatermarkImage: {
    width: 300,
    height: 54,
    position: 'absolute',
    top: '50%',
    left: '30%',
    transform: 'translate(-50%, -50%)',
    opacity: 0.2,
  },

  bottomRightContainer: {
    position: 'absolute',
    bottom: 10, // safe padding
    right: 30,
    alignItems: 'flex-end',
    zIndex: 1,
  },

  smallWatermarkImage: {
    width: 100,
    height: 14.6,
  },

  poweredByText: {
    fontSize: 10,
    color: 'gray',
    marginTop: 4,
  },
});

export const FirstPage = ({ projectName, reportType, createdBy }) => (
  <Page size="A4" style={styles.firstPage}>
    <Watermark />
    {/* Main Content - Centered */}
    <View style={styles.topFirstPage}>
      <Text style={[styles.title, { marginBottom: 10 }]}>{projectName}</Text>
      <Text style={[styles.subtitle, { marginBottom: 20 }]}>{reportType}</Text>
      <Text style={styles.heading1}>Author: {createdBy}</Text>
    </View>
    {/* Footer - Bottom Right */}
    <View style={styles.bottomRightFirstPage}>
      <Text style={styles.body}>Created by LORVEN AI Studio</Text>
      <Text style={styles.body}>
        Generated on {datePart} at {timePart}
      </Text>
    </View>
  </Page>
);

export const Watermark = () => (
  <>
    {/* Centered Large Watermark */}
    <View style={styles.centeredWatermarkContainer} fixed>
      <Image src="/logo.png" style={styles.centeredWatermarkImage} />
    </View>

    {/* Bottom Right "Powered by" Section */}
    <View style={styles.bottomRightContainer} fixed>
      <Image src="/logo.png" style={styles.smallWatermarkImage} />
      <Image
        src="/powered-by-text.png"
        style={{ width: '100%', height: 'auto', maxHeight: 14 }}
      />
    </View>
  </>
);
