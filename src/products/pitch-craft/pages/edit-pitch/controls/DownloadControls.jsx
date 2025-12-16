import DownloadIcon from "@assets/pitch-craft/DownloadIcon.svg?react";
import SlideshowIcon from "@assets/pitch-craft/SlideshowIcon.svg?react";
import DownIcon from "@assets/pitch-craft/DownIcon.svg?react";
import { useDownloads } from "@products/pitch-craft/hooks";
import Dropdown from "@ui/Dropdown";
import DropdownItem from "@ui/DropdownItem";
import SaveControls from "./SaveControls";
import Button from "@ui/Button";

export default function DownloadControls() {
  const {
    isOpen,
    setIsOpen,
    showSlideshow,
    slideImages,
    slideshowRef,
    slideshowIndex,
    startSlideshow,
    navigateToSlide,
    closeSlideshow,
    downloadJSON,
    downloadPDF,
    downloadPPTX,
    downloadDOCX,
    downloadImages,
    loadTemplate,
    isGenerating,
  } = useDownloads();

  const handleFileLoad = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await loadTemplate(file);
    e.target.value = null;
  };

  return (
    <div className="flex items-center rounded-full bg-secondary-base">
      {/* Slideshow Button */}
      <Button
        onClick={startSlideshow}
        disabled={isGenerating.current}
        variant="secondary"
        className="justify-center gap-1.5 rounded-l-full"
        title="Slideshow"
      >
        <SlideshowIcon className="w-4 h-4 text-white" />
        <span className="text-xs text-light-foreground-muted dark:text-dark-foreground-muted">Slideshow</span>
      </Button>

      <span className="text-[#383838] mx-1">|</span>
      <SaveControls />
      <span className="text-[#383838] mx-1">|</span>

      {/* Download Dropdown */}
      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        trigger={
          <Button
            onClick={() => setIsOpen((prev) => !prev)}
            variant="secondary"
            disabled={isGenerating.current}
            className="justify-center rounded-r-full"
            title="Download"
          >
            <div className="flex items-center gap-1.5">
              <DownloadIcon className="w-4 h-4 text-white" />
              <span className="text-xs text-light-foreground-muted dark:text-dark-foreground-muted">Download</span>
            </div>
            <DownIcon className="w-3 h-3 ml-1 text-white" />
          </Button>
        }
      >
        {/* Hidden input for template loading */}
        <input
          type="file"
          accept=".json"
          id="templateLoader"
          onChange={handleFileLoad}
          style={{ display: "none" }}
        />

        {/* <DropdownItem
          onClick={() => document.getElementById("templateLoader").click()}
          disabled={isGenerating.current}
        >
          Load Template
        </DropdownItem> */}
        {/* <DropdownItem
          onClick={() => {
            downloadJSON();
            setIsOpen(false);
          }}
          disabled={isGenerating.current}
        >
          Template
        </DropdownItem> */}
        {/* <DropdownItem
          onClick={() => {
            downloadImages();
            setIsOpen(false);
          }}
          disabled={isGenerating.current}
        >
          Images
        </DropdownItem> */}
        <DropdownItem
          onClick={() => {
            downloadPDF();
            setIsOpen(false);
          }}
          disabled={isGenerating.current}
        >
          PDF
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            downloadPPTX();
            setIsOpen(false);
          }}
          disabled={isGenerating.current}
        >
          PPTX
        </DropdownItem>
        {/* <DropdownItem
          onClick={() => {
            downloadDOCX();
            setIsOpen(false);
          }}
          disabled={isGenerating.current}
        >
          DOCX
        </DropdownItem> */}
      </Dropdown>

      {/* Slideshow Overlay */}
      {showSlideshow && (
        <div
          className="fixed inset-0 bg-black flex items-center justify-center z-[9999]"
          ref={slideshowRef}
        >
          {slideImages[slideshowIndex] ? (
            <img
              src={slideImages[slideshowIndex]}
              alt={`Slide ${slideshowIndex + 1}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <p className="text-white">Loading...</p>
          )}

          {/* Navigation controls */}
          <Button
            variant="transparent"
            className="absolute left-4 text-white text-2xl bg-black/30 hover:bg-black/50 w-12 h-12 rounded-full flex items-center justify-center"
            onClick={() =>
              navigateToSlide(
                (slideshowIndex - 1 + slideImages.length) % slideImages.length
              )
            }
          >
            {"<"}
          </Button>
          <Button
            variant="transparent"
            className="absolute right-4 text-white text-2xl bg-black/30 hover:bg-black/50 w-12 h-12 rounded-full flex items-center justify-center"
            onClick={() =>
              navigateToSlide((slideshowIndex + 1) % slideImages.length)
            }
          >
            {">"}
          </Button>

          {/* Slide counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm">
            {slideshowIndex + 1} / {slideImages.length}
          </div>

          {/* Close button */}
          {/* <Button
            variant="transparent"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded"
            onClick={closeSlideshow}
          >
            ✕
          </Button> */}
        </div>
      )}
    </div>
  );
}
