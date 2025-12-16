import { useCallback } from 'react';
import { fabric } from 'fabric';
import { useCanvas } from '@products/pitch-craft/contexts/CanvasContext';
import FontFaceObserver from 'fontfaceobserver';

export function useTextActions() {
  const { canvas } = useCanvas();

  // Helper to ensure only text/textbox selected
  const getActiveTextObject = () => {
    if (!canvas) return null;
    const activeObj = canvas.getActiveObject();
    if (
      activeObj &&
      (activeObj.type === 'textbox' || activeObj.type === 'text')
    ) {
      return activeObj;
    }
    return null;
  };

  const addText = () => {
    if (!canvas) return;

    const textbox = new fabric.Textbox('Your text here', {
      left: 100,
      top: 100,
      width: 200,
      height: 80,
      fontSize: 30,
      fontFamily: 'Arial',
      fill: '#ffffff',
      editable: true,
      lockScalingY: true, // prevent height scaling
      // optional: visually limit text area
      clipTo: function (ctx) {
        ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
      },
    });

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();

    // Automatically enter editing mode
    textbox.enterEditing();
    textbox.selectAll(); // Selects the text for immediate typing

    // Optional: focus the hidden textarea (important for Chrome/Safari)
    setTimeout(() => {
      if (textbox.hiddenTextarea) {
        textbox.hiddenTextarea.focus();
      }
    }, 10);
  };
  const updateTextProperties = useCallback(
    properties => {
      const textObj = getActiveTextObject();
      if (!textObj) return;
      textObj.set(properties);
      canvas.renderAll();
    },
    [canvas]
  );

  const getTextProperties = useCallback(() => {
    const textObj = getActiveTextObject();
    if (!textObj) return null;

    return {
      fontSize: textObj.fontSize,
      fontFamily: textObj.fontFamily,
      fill: textObj.fill,
      fontWeight: textObj.fontWeight,
      fontStyle: textObj.fontStyle,
      textAlign: textObj.textAlign,
      underline: textObj.underline,
      linethrough: textObj.linethrough,
      lineHeight: textObj.lineHeight,
      charSpacing: textObj.charSpacing,
      originY: textObj.originY,
    };
  }, [canvas]);

  const changeTextColor = useCallback(
    color => {
      const textObj = getActiveTextObject();
      if (!textObj) return;
      textObj.set('fill', color);
      canvas.renderAll();
    },
    [canvas]
  );

  const changeTextFontSize = useCallback(
    fontSize => {
      const textObj = getActiveTextObject();
      if (!textObj) return;
      textObj.set('fontSize', fontSize);
      canvas.renderAll();
    },
    [canvas]
  );

  const changeTextFontFamily = useCallback(
    fontFamily => {
      const textObj = getActiveTextObject();
      if (!textObj) return;

      // System fonts that don't need loading
      const systemFonts = [
        'Arial',
        'Helvetica',
        'Times New Roman',
        'Verdana',
        'Tahoma',
        'Calibri',
        'Georgia',
        'Garamond',
        'Courier New',
      ];

      // If it's a system font, apply directly
      if (systemFonts.includes(fontFamily)) {
        textObj.set('fontFamily', fontFamily);
        canvas.requestRenderAll();
        return;
      }

      // For Google Fonts, load first then apply
      const font = new FontFaceObserver(fontFamily);
      font
        .load()
        .then(() => {
          textObj.set('fontFamily', fontFamily);
          canvas.requestRenderAll();
        })
        .catch(() => {
          console.warn(`Font ${fontFamily} failed to load.`);
          // Apply anyway in case the font is available
          textObj.set('fontFamily', fontFamily);
          canvas.requestRenderAll();
        });
    },
    [canvas]
  );

  const setLineHeight = useCallback(
    lineHeight => {
      const textObj = getActiveTextObject();
      if (!textObj) return;
      textObj.set('lineHeight', lineHeight);
      canvas.renderAll();
    },
    [canvas]
  );

  const setLetterSpacing = useCallback(
    letterSpacing => {
      const textObj = getActiveTextObject();
      if (!textObj) return;
      textObj.set('charSpacing', letterSpacing);
      canvas.renderAll();
    },
    [canvas]
  );

  const setUnderline = useCallback(
    underline => {
      const textObj = getActiveTextObject();
      if (!textObj) return;
      textObj.set('underline', underline);
      canvas.renderAll();
    },
    [canvas]
  );

  const setStrikeThrough = useCallback(
    strikeThrough => {
      const textObj = getActiveTextObject();
      if (!textObj) return;
      textObj.set('linethrough', strikeThrough);
      canvas.renderAll();
    },
    [canvas]
  );

  // Paragraph/text alignment
  const setTextAlign = useCallback(
    align => {
      const textObj = getActiveTextObject();
      if (!textObj) return;
      textObj.set('textAlign', align); // left, center, right, justify
      canvas.renderAll();
    },
    [canvas]
  );

  // Vertical alignment (simulate paragraph align using originY)
  const setParagraphAlign = useCallback(
    align => {
      const textObj = getActiveTextObject();
      if (!textObj) return;

      let originY = 'top';
      if (align === 'center') originY = 'center';
      if (align === 'bottom') originY = 'bottom';

      textObj.set('originY', originY);
      canvas.renderAll();
    },
    [canvas]
  );

  const setBold = useCallback(
    isBold => {
      const textObj = getActiveTextObject();
      if (!textObj) return;
      textObj.set('fontWeight', isBold ? 'bold' : 'normal');
      canvas.renderAll();
    },
    [canvas]
  );

  // Italic
  const setItalic = useCallback(
    isItalic => {
      const textObj = getActiveTextObject();
      if (!textObj) return;
      textObj.set('fontStyle', isItalic ? 'italic' : 'normal');
      canvas.renderAll();
    },
    [canvas]
  );

  return {
    addText,
    updateTextProperties,
    getTextProperties,
    changeTextColor,
    changeTextFontSize,
    changeTextFontFamily,
    lineHeight: setLineHeight,
    letterSpacing: setLetterSpacing,
    setUnderline,
    setStrikeThrough,
    setTextAlign,
    setParagraphAlign,
    setBold,
    setItalic,
  };
}
