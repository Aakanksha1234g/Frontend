import { useSlideActions } from '@products/pitch-craft/hooks/useSlideActions';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';
import { useEffect, useState, useMemo } from 'react';
import { fabric } from 'fabric';
import Up from '@assets/icons/up.svg?react';
import Delete from '@assets/icons/TrashBin.svg?react';
import Button from '@ui/Button';
import PopoverModal from '@ui/PopoverModal';

export default function SlideControls() {
  const [showCastEditor, setShowCastEditor] = useState(false);
  const { addCastSlide, deleteSlide, switchSlide } = useSlideActions();
  const [collapsed, setCollapsed] = useState(false);
  const { slides, setSlides, currentSlide, canvas, canvasDimensions } = useCanvas();
  const [thumbnails, setThumbnails] = useState([]);
  const [openSections, setOpenSections] = useState({});
  const [savedCasts, setSavedCasts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(false);

  useEffect(() => {
    const casts = slides
      .filter(slide => slide.slide_type === 'cast')
    // .flatMap(slide => slide.castData);
    setSavedCasts(casts);
    console.log(savedCasts)
  }, [slides]);


  // GROUP slides by type (memoized)
  const groupedSlides = useMemo(() => {
    return slides.reduce((acc, slide, idx) => {
      // console.log(slide)
      const type = slide.slide_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push({ slide, idx });
      return acc;
    }, {});
  }, [slides]);

  // Initialize openSections for accordion (open by default)
  useEffect(() => {
    const init = {};
    Object.keys(groupedSlides).forEach(type => {
      init[type] = true;
    });
    setOpenSections(init);
  }, [groupedSlides]);

  // Toggle accordion sections
  const toggleSection = (type) => {
    setOpenSections(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // THUMBNAIL generation with proper sizing
  useEffect(() => {
    if (!canvas || slides.length === 0) return;

    const generateThumbnails = async () => {
      const CANVAS_WIDTH = 1344;
      const CANVAS_HEIGHT = 768;

      // Thumbnail dimensions
      const containerWidth = Math.min(window.innerWidth * 0.18, 200);
      const THUMB_WIDTH = containerWidth - 16;
      const THUMB_HEIGHT = Math.round(THUMB_WIDTH / (16 / 9));

      const newThumbnails = await Promise.all(
        slides.map(async (slide, index) => {
          try {
            if (!slide?.state) return null;

            let json;
            try { json = JSON.parse(slide.state); } catch { return null; }
            if (!json?.objects?.length) return null;

            // Offscreen canvas at original slide size
            const offscreenEl = document.createElement('canvas');
            offscreenEl.width = CANVAS_WIDTH;
            offscreenEl.height = CANVAS_HEIGHT;

            const offscreenCanvas = new fabric.StaticCanvas(offscreenEl, {
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              preserveObjectStacking: true,
            });

            // Load JSON
            await new Promise(resolve => {
              offscreenCanvas.loadFromJSON(json, () => {
                offscreenCanvas.renderAll();
                setTimeout(resolve, 50);
              });
            });

            // Thumbnail canvas
            const thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = THUMB_WIDTH;
            thumbCanvas.height = THUMB_HEIGHT;
            const ctx = thumbCanvas.getContext('2d');
            if (!ctx) {
              offscreenCanvas.dispose();
              return null;
            }

            // Draw the original canvas into thumbnail canvas
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = () => {
                ctx.clearRect(0, 0, THUMB_WIDTH, THUMB_HEIGHT);
                ctx.drawImage(
                  img,
                  0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, // source
                  0, 0, THUMB_WIDTH, THUMB_HEIGHT    // destination
                );
                resolve();
              };
              img.onerror = reject;
              img.src = offscreenCanvas.toDataURL({ format: 'png', multiplier: 1 }); // NO scaling here
            });

            offscreenCanvas.dispose();
            return thumbCanvas.toDataURL('image/png', 0.8);

          } catch (err) {
            console.error(`Thumbnail generation error for slide ${index}:`, err);
            return null;
          }
        })
      );

      setThumbnails(newThumbnails);
    };

    generateThumbnails();
  }, [slides, canvas]);


  const handleAddCastPage = () => {
    const lastSlideIndex = slides.length ? slides[slides.length - 1].slide_id : 0;
    addCastSlide(lastSlideIndex + 1);
  };

  return (
    <div
      className={`relative h-full dark:bg-dark-default-main bg-light-default-main transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${collapsed ? 'w-[70px]' : 'w-[200px]'
        }`}
    >
      {/* Collapse Toggle Button */}
      {/* <button
        className="absolute top-4 right-0 bg-[#1a1a1a] hover:bg-[#222] rounded-md p-1 border border-[#333] transition-all flex items-center justify-center z-10"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <img
          src={Up}
          alt="Toggle sidebar"
          className={`w-4 h-4 z-20 cursor-pointer transform transition-transform duration-300 ${collapsed ? 'rotate-[90deg]' : 'rotate-[-90deg]'
            }`}
        />
      </button> */}

      {/* COLLAPSED VIEW */}
      {collapsed ? (
        <div className="flex-1 flex flex-col items-center justify-start pb-4 overflow-y-auto gap-2">
          {Object.entries(groupedSlides).map(([type, slideArr]) => (
            <div key={type} className="mb-2 flex flex-col gap-2">
              <div
                onClick={() => toggleSection(type)}
                className="px-2 py-1 border-b border-[#333] font-semibold text-xs text-[#c9c9c9] cursor-pointer flex justify-between items-center hover:bg-[#1a1a1a] rounded transition-colors"
              >
                <span>{type.toUpperCase().replace(/_/g, ' ')}</span>
                <img
                  src={openSections[type] ? Up : Down}
                  className="w-3 h-3"
                  alt={openSections[type] ? 'Collapse' : 'Expand'}
                />
              </div>

              {openSections[type] && (
                <div className="flex flex-col gap-2">
                  {slideArr.map(({ slide, idx }) => (
                    <div
                      key={slide.slide_id || idx}
                      className={`relative group border rounded-lg overflow-hidden cursor-pointer transition-all ${currentSlide === idx
                        ? 'border-blue-500'
                        : 'border-[#333] hover:border-[#555]'
                        }`}
                      onClick={() => switchSlide(idx)}
                    >
                      <div className="w-full aspect-[16/9] bg-[#1a1a1a] flex items-center justify-center relative rounded-lg overflow-hidden">
                        {thumbnails[idx] ? (
                          <img
                            src={thumbnails[idx]}
                            alt={`Slide ${idx + 1}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="absolute inset-0 rounded-lg" />
                        )}
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                          {idx + 1}
                        </div>

                        {/* Delete button INSIDE the group */}
                        <div className="absolute top-1 right-1 gap-1 group-hover:flex">
                          <Button
                            className="p-1 hover:bg-red-600 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSlide(slide.slide_id);
                            }}
                            title="Delete slide"
                          >
                            <Delete className="w-3 h-3 fill-black dark:fill-white" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Add New Slide */}
          <button
            onClick={handleAddCastPage}
            className="mt-auto mb-2 w-10 h-10 bg-[#1c1c1c] hover:bg-[#333] text-white text-lg rounded-md flex items-center justify-center transition-all"
            title="Add Cast & Crew"
          >
            +
          </button>
        </div>
      ) : (
        <>
          <div className={`flex-1 p-3 overflow-y-auto ${localStorage.getItem("theme") === "dark" ? "scrollbar-black": "scrollbar-custom"} space-y-3`}>
            {/* Accordion Rendering */}
            {Object.entries(groupedSlides).filter(([type]) => type && type !== 'undefined').map(([type, slideArr]) => (
              <div key={type} className="mb-2 flex flex-col gap-2">
                <div
                  onClick={() => toggleSection(type)}
                  className="px-2 py-1 border-b dark:border-[#333] font-semibold text-xs dark:text-[#c9c9c9] text-black cursor-pointer flex justify-between items-center hover:dark:bg-[#1a1a1a] transition-colors"
                >
                  <span>{type.toUpperCase().replace(/_/g, ' ') === "MAIN".toUpperCase().replace(/_/g, ' ') ? "SYNOPSIS" : type.toUpperCase().replace(/_/g, ' ')}</span>
                  {
                     openSections[type] ? <Up className="w-3 h-3 text-black dark:text-white" /> : <Up className="w-3 h-3 text-black dark:text-white rotate-180" />
                  
                  }
                </div>

                {openSections[type] && (
                  <div className="flex flex-col gap-2">
                    {slideArr.map(({ slide, idx }) => (
                      <div
                        key={slide.slide_id || idx}
                        className={`relative group border rounded-lg overflow-hidden cursor-pointer transition-all ${currentSlide === idx
                          ? 'border-blue-500'
                          : 'border-[#333] hover:border-[#555]'
                          }`}
                        onClick={() => switchSlide(idx)}
                      >
                        <div className="w-full aspect-[16/9] dark:bg-[#1a1a1a] flex items-center justify-center relative rounded-lg overflow-hidden">
                          {thumbnails[idx] ? (
                            <img
                              src={thumbnails[idx]}
                              alt={`Slide ${idx + 1}`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="absolute inset-0 rounded-lg" />
                          )}
                          <div className="absolute bottom-1 right-1 text-white text-xs px-1 py-0.5 rounded">
                            {idx + 1}
                          </div>
                          <div className="absolute top-1 right-1 gap-1 ">
                            <Button
                              className="p-1 cursor-pointer bg-black/50 rounded-full"
                              onClick={() => {
                                setDeleteId(idx);
                                setIsOpen(true);
                              }}
                              title="Delete slide"
                            >
                              <Delete className="w-3 h-3 text-white" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Add Slide Button */}
            <button
              type="button"
              className="rounded-lg border-2 border-[#555] border-dashed w-full aspect-[16/9] dark:bg-black bg-white hover:dark:bg-black hover:bg-white hover:border-[#888] text-[#777] dark:hover:text-[#fff] hover:text-[#888] flex flex-col justify-center items-center cursor-pointer transition-all"
              onClick={handleAddCastPage}
            >
              <span className="text-2xl">+</span>
              <span className="text-xs mt-1">Add Cast & Crew</span>
            </button>
            <PopoverModal
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              message="Are you sure you want to delete this slide?"
              proceedMsg="Delete"
              cancelMsg="Cancel"
              proceedAction={() => {
                deleteSlide(deleteId);
                setDeleteId(null);
              }}
            />

          </div>
        </>
      )}
    </div>
  );
}