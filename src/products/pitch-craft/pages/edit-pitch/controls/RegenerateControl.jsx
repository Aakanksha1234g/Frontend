import { useCanvas } from "@products/pitch-craft/contexts/CanvasContext";
import Button from "@ui/Button";

export default function RegenerateControl() {
    const { showRegenerate, setShowRegenerate, slides, currentSlide } = useCanvas();

    const isCastSlide = slides[currentSlide]?.slide_type === 'cast';

    return (
        <Button
            onClick={() => !isCastSlide && setShowRegenerate(!showRegenerate)}
            variant="secondary"
            className={`justify-center px-2.5 py-1.5 ${isCastSlide ? 'cursor-not-allowed' : ''}`}
            title={isCastSlide ? "Not available for Cast & Crew" : "Regenerate"}
            disabled={isCastSlide}
        >
            <span className={`text-sm text-center font-bold ${isCastSlide ? 'text-[#404040]' : 'text-light-foreground-muted dark:text-dark-foreground-muted'}`}>AI</span>
        </Button>
    )
}