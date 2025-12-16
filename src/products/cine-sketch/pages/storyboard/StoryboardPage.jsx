import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { apiRequest } from '@shared/utils/api-client';
import jsPDF from 'jspdf';
import DownloadIcon from '@assets/pitch-craft/DownloadIcon.svg?react';
import SlideshowIcon from '@assets/pitch-craft/SlideshowIcon.svg?react';
import CameraIcon from '@assets/cine-sketch/CameraIcon';
import Loading from '@shared/ui/Loading';
import ShotCard from './ShotCard';
import PreviewModal from './PreviewModal';

/**
 * StoryboardPage
 *
 * Displays the storyboard view for a sketch, including scenes and their associated shots.
 * Users can toggle between card and grid views, select scenes, regenerate shots, and preview them.
 */
export default function StoryboardPage() {
  /** The currently selected scene number */
  const [activeScene, setActiveScene] = useState(1);

  /** All shots for the selected scene */
  const [shots, setShots] = useState([]);

  /** Indicates if shot data is currently loading */
  const [loading, setLoading] = useState(false);

  /** Total number of scenes available in the sketch */
  const [totalScenes, setTotalScenes] = useState(0);

  /** Controls the visibility of the previsualization modal */
  const [showPreview, setShowPreview] = useState(false);

  /** Index of the shot being shown in preview mode */
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  /** Loading state for PDF generation */
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const { sketch_id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabsRef = useRef(null);

  /**
   * On initial mount, read the scene number from the URL query string
   * and update local state if valid.
   */
  useEffect(() => {
    const sceneFromUrl = searchParams.get('scene');
    if (sceneFromUrl) {
      const sceneNumber = parseInt(sceneFromUrl);
      if (!isNaN(sceneNumber) && sceneNumber > 0) {
        setActiveScene(sceneNumber);
      }
    }
  }, [searchParams]);

  /**
   * Updates both internal state and URL query param when the scene changes.
   * @param {number} newScene - The new scene number to activate.
   */
  const handleSceneChange = newScene => {
    setActiveScene(newScene);
    navigate(`?scene=${newScene}`, { replace: true });
  };

  /**
   * Automatically advances the preview index every 2 seconds when preview is active.
   */
  useEffect(() => {
    if (!showPreview) return;

    const interval = setInterval(() => {
      setCurrentPreviewIndex(prev => (prev + 1) % shots.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [showPreview, shots.length]);

  /**
   * Loads all shots for the currently active scene when it changes.
   * Uses an abort controller to cancel previous requests.
   */
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadShots = async () => {
      setLoading(true);
      try {
        const res = await apiRequest({
          endpoint: '/get_all_shots',
          method: 'GET',
          params: { sketch_id, scene_sequence_no: activeScene },
          signal: controller.signal,
        });

        if (!isMounted) return;

        setShots(res.response);
        setTotalScenes(res.total_scenes);
      } catch (err) {
        if (!isMounted) return;
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadShots();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [activeScene, sketch_id]);

  /**
   * Keeps the selected scene tab in view when scrolling horizontally.
   */
  useEffect(() => {
    const tab = tabsRef.current?.querySelector('.active-tab');
    tab?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
  }, [activeScene]);

  /**
   * Regenerates a shot based on the given updates and refreshes the shot list.
   * @param {string} shotId - ID of the shot to regenerate.
   * @param {Object} updates - Updated prompt or other shot parameters.
   */
  const handleShotUpdate = async (shotId, updates) => {
    try {
      await apiRequest({
        endpoint: '/regenerate_shot',
        method: 'POST',
        body: {
          shot_id: shotId,
          shot_visual_prompt: updates.shot_visual_prompt,
          shot_parameters: { camera_angle: 'establishing' },
        },
      });

      const refreshed = await apiRequest({
        endpoint: '/get_all_shots',
        method: 'GET',
        params: { sketch_id, scene_sequence_no: activeScene },
      });

      setShots(refreshed.response);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  /**
   * Converts an image URL to base64 format for PDF embedding
   * @param {string} url - The image URL
   * @returns {Promise<string>} Base64 encoded image
   */
  const getImageAsBase64 = url => {
    return `data:image/png;base64,${url}`;
  };

  /**
   * Generates and downloads a PDF for the current scene
   */

  const generateScenePDF = async () => {
    if (!shots.length) return;

    setGeneratingPDF(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - 2 * margin;

      const sceneTitle = shots[0]?.scene_title || `Scene ${activeScene}`;

      // Layout constants
      const TITLE_Y = 24;
      const SUBTITLE_Y = 45;
      const CONTENT_START_Y = 65;
      const IMAGE_X = margin + 5;
      const IMAGE_WIDTH = 70;
      const IMAGE_HEIGHT = 40;
      const SPACING = 8;
      const TEXT_START_X = IMAGE_X + IMAGE_WIDTH + SPACING;
      const TEXT_PADDING = 4;
      const TEXT_WIDTH = pageWidth - TEXT_START_X - margin - TEXT_PADDING - 3;
      const DIVIDER_X = TEXT_START_X - SPACING / 2;
      const lineHeight = 4;
      const metadataHeight = 6;
      const padding = 10;

      // Setup page function (title only on first page)
      const setupPage = (isFirstPage = false) => {
        if (isFirstPage) {
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(`SCENE - ${activeScene}`, pageWidth / 2, TITLE_Y, {
            align: 'center',
          });

          pdf.setFontSize(14);
          pdf.text(sceneTitle.toUpperCase(), pageWidth / 2, SUBTITLE_Y, {
            align: 'center',
          });

          return CONTENT_START_Y;
        } else {
          return margin;
        }
      };

      let currentPage = 1;
      let yPosition = setupPage(true); // First page setup

      for (let i = 0; i < shots.length; i++) {
        const shot = shots[i];
        const description = shot.shot_description;
        console.log(description.length);

        // Calculate text lines and shot box height
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const lines = pdf.splitTextToSize(description, TEXT_WIDTH);
        console.log(lines);
        const estimatedTextHeight = lines.length * lineHeight;
        console.log(lines.length, lineHeight);
        const shotBoxHeight =
          Math.max(IMAGE_HEIGHT, estimatedTextHeight + metadataHeight) +
          padding;
        console.log(IMAGE_HEIGHT, estimatedTextHeight, metadataHeight, padding);

        // Page break if necessary
        if (yPosition + shotBoxHeight > pageHeight - margin) {
          pdf.addPage();
          currentPage++;
          yPosition = setupPage(false); // No title on new page
        }

        // Draw main box
        pdf.setDrawColor(0, 0, 0);
        pdf.setFillColor(255, 255, 255);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setLineWidth(0.5);
        pdf.rect(margin, yPosition - 5, contentWidth, shotBoxHeight);

        // Draw image or placeholder
        try {
          if (shot.shot_image) {
            const base64Image = await getImageAsBase64(shot.shot_image);
            pdf.addImage(
              base64Image,
              'JPEG',
              IMAGE_X,
              yPosition,
              IMAGE_WIDTH,
              IMAGE_HEIGHT
            );
          } else {
            pdf.setFillColor(240, 240, 240);
            pdf.rect(IMAGE_X, yPosition, IMAGE_WIDTH, IMAGE_HEIGHT, 'F');
            pdf.setFontSize(10);
            pdf.setTextColor(128, 128, 128);
            pdf.text(
              'No Image',
              IMAGE_X + IMAGE_WIDTH / 2,
              yPosition + IMAGE_HEIGHT / 2,
              { align: 'center' }
            );
          }
        } catch (error) {
          console.warn('Image error:', error);
          pdf.setFillColor(240, 240, 240);
          pdf.rect(IMAGE_X, yPosition, IMAGE_WIDTH, IMAGE_HEIGHT, 'F');
          pdf.setFontSize(10);
          pdf.setTextColor(128, 128, 128);
          pdf.text(
            'Image Error',
            IMAGE_X + IMAGE_WIDTH / 2,
            yPosition + IMAGE_HEIGHT / 2,
            { align: 'center' }
          );
        }

        // Divider line
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.line(
          DIVIDER_X,
          yPosition - 5,
          DIVIDER_X,
          yPosition - 5 + shotBoxHeight
        );

        // Draw description text (with fitting)
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        //const shotBoxHeight = 36;
        const availableTextHeight =
          shotBoxHeight - metadataHeight - 2 * TEXT_PADDING;
        const maxLines = Math.floor(availableTextHeight / lineHeight);
        const linesToRender = lines.slice(0, maxLines);

        let textY = yPosition + TEXT_PADDING;
        linesToRender.forEach(line => {
          pdf.text(line, TEXT_START_X + TEXT_PADDING, textY);
          textY += lineHeight;
        });

        // Draw metadata
        if (shot.camera_angle || shot.shot_type || shot.duration) {
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);

          const metadata = [];
          if (shot.camera_angle) metadata.push(`Camera: ${shot.camera_angle}`);
          if (shot.shot_type) metadata.push(`Type: ${shot.shot_type}`);
          if (shot.duration) metadata.push(`Duration: ${shot.duration}s`);

          pdf.text(
            metadata.join(' | '),
            TEXT_START_X + TEXT_PADDING,
            yPosition + shotBoxHeight - 4
          );
        }

        yPosition += shotBoxHeight;
      }

      // // Footer on all pages
      // const totalPages = pdf.internal.getNumberOfPages();
      // for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      //   pdf.setPage(pageNum);
      //   pdf.setFontSize(8);
      //   pdf.setTextColor(128, 128, 128);
      //   pdf.text(
      //     `Scene ${activeScene} - Page ${pageNum} of ${totalPages}`,
      //     pageWidth / 2,
      //     pageHeight - 10,
      //     { align: 'center' }
      //   );
      // }

      // Download PDF
      const fileName = `Scene_${activeScene}_${sceneTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-[##0A0A0A]">
      {/* Header */}
      <div className="sticky top-0 z-40 px-4">
        <div className="bg-[#171717] rounded-xl px-1.5 py-1 text-[#2C2C2C] flex justify-between items-center w-full">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center border-1 border-white/10 rounded-xl px-2 py-1">
              <input
                type="number"
                step="1"
                min="1"
                max={totalScenes}
                placeholder={activeScene}
                className="min-w-10 max-w-12 rounded-md bg-[#171717] text-[#A3A3A3] text-[14px] placeholder:text-gray-400 focus:outline-none"
                value={activeScene}
                onChange={e => handleSceneChange(Number(e.target.value))}
                onKeyDown={e => {
                  // Prevent 'e', 'E', '+', '-'
                  if (['e', 'E', '+', '-'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onPaste={e => {
                  // Prevent pasting non-numeric values
                  const pastedData = e.clipboardData.getData('text');
                  if (
                    !/^\d*\.?\d*$/.test(pastedData) ||
                    parseFloat(pastedData) > 20
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <h1 className="text-md font-bold text-[#E5E5E5] w-lg truncate">
              {shots[0]?.scene_title?.charAt(0).toUpperCase() +
                shots[0]?.scene_title?.slice(1) || 'Storyboard'}
            </h1>
          </div>
          <div className="flex items-center rounded-xl bg-[#262626] px-1">
            {/* PDF Download Button */}
            <button
              onClick={() => setShowPreview(true)}
              className="px-2 py-2 rounded flex items-center justify-center gap-2 cursor-pointer"
            >
              <SlideshowIcon className="w-4 h-4 text-white" />
              <span className="text-xs text-[#737373]">Show Reel</span>
            </button>
            <span className="text-[#383838] mx-1">|</span>
            <button
              onClick={generateScenePDF}
              disabled={generatingPDF || loading || shots.length === 0}
              className="px-2 py-2 rounded flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <DownloadIcon className="w-4 h-4 text-white" />
              <span className="text-xs text-[#737373]">Download</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 py-8">
        {/* Controls */}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loading />
          </div>
        ) : shots.length > 0 ? (
          <div className="space-y-6">
            {shots.map((shot, idx) => (
              <ShotCard
                key={shot.shot_id}
                shot={shot}
                shotNumber={idx + 1}
                onUpdate={handleShotUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <CameraIcon />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No shots found
            </h3>
            <p className="text-gray-500">
              There are no shots available for this scene.
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          shots={shots}
          currentIndex={currentPreviewIndex}
          setCurrentIndex={setCurrentPreviewIndex}
          onClose={() => {
            setShowPreview(false);
            setCurrentPreviewIndex(0);
          }}
        />
      )}
    </div>
  );
}
