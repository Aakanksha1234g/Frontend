// DocxDownloadButton.jsx → FINAL, NEVER FAILS
import React, { useState } from 'react';
import { Packer } from 'docx';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';
import errorIcon from '@assets/icons/error.svg';

const DocxDownloadButton = ({ docCreator, fileName = 'document.docx' }) => {
  const [status, setStatus] = useState('idle'); // idle | generating | error

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus('generating');

    try {
      // Small delay so the spinner appears
      await new Promise((r) => setTimeout(r, 100));

      // ← THIS IS THE ONLY IMPORTANT LINE
      // docCreator can be sync OR async → we handle both safely
      const doc = await docCreator();

      // Safety – if someone accidentally returns nothing
      if (!doc || typeof doc !== 'object') {
        throw new Error('Document generator returned nothing');
      }

      const blob = await Packer.toBlob(doc);

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setStatus('idle');
    } catch (err) {
      console.error('DOCX generation failed:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {status === 'generating' && (
        <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      )}

      {status === 'error' && (
        <IconButtonWithTooltip
          imageUrl={errorIcon}
          altText="Error"
          tooltipText="Failed to generate DOCX"
          position="bottom"
        />
      )}

      <p onClick={handleDownload} className="cursor-pointer text-sm hover:underline">
        Docx
      </p>
    </div>
  );
};

export default DocxDownloadButton;