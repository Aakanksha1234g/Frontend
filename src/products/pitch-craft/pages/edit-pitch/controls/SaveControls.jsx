import SaveIcon from "@assets/pitch-craft/SaveIcon.svg?react";
import { useSaveSlides } from "@products/pitch-craft/hooks/useSaveSlides";
import Button from "@ui/Button";
import { useEffect, useState } from "react";

export default function SaveControls() {
  const { saveSlides, isGenerating } = useSaveSlides();
  const [btnText, setBtnText] = useState("Save");
  const [hasSaved, setHasSaved] = useState(false);


  useEffect(() => {
    if (!hasSaved) return;

    if (isGenerating) {
      setBtnText("Saving...");
    } else {
      setBtnText("Saved");
      const timeout = setTimeout(() => setBtnText("Save"), 1000);
      return () => clearTimeout(timeout);
    }
  }, [isGenerating, hasSaved]);

  const handleClick = async () => {
    console.log("saving")
    setHasSaved(true);
    await saveSlides();
  };

  return (
    <Button
      onClick={() => {
        console.log("save clicked")
        handleClick();
      }}
      variant="secondary"
      className="gap-1.5"
      title={btnText}
    >
      <SaveIcon className="w-4 h-4 text-white" />
      <span className="text-xs text-light-foreground-muted dark:text-dark-foreground-muted">{btnText}</span>
    </Button>
  );
}
