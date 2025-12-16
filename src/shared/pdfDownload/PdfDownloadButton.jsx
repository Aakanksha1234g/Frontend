import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import Button from '@shared/ui/button';
import errorIcon from '@assets/icons/error.svg';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';
import { DownloadIcon } from '@shared/layout/icons';

const PdfDownloadButton = ({ documentComponent, fileName }) => {
  const [status, setStatus] = useState('idle'); // idle, generating, error

  const handleDownload = async e => {
    e.preventDefault();
    e.stopPropagation();
    setStatus('generating');

    try {
      // Let UI update before heavy PDF generation
      await new Promise(r => setTimeout(r, 50));

      const blob = await pdf(documentComponent).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus('idle');
    } catch (error) {
      console.error('PDF generation failed:', error);
      setStatus('error');

      // Auto-reset after few seconds
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center">
        {status === 'generating' && (
          <div className="iconButton flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="20"
                fill="none"
                stroke="white"
                strokeWidth="4"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 22 22"
                  to="360 22 22"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        )}
        {status === 'error' && (
          <IconButtonWithTooltip
            imageUrl={errorIcon}
            altText="Error"
            tooltipText="Error generating DOCX"
            className="iconButton"
            position="bottom"
          />
        )}
        <p onClick={handleDownload} className="cursor-pointer text-sm">
          Pdf{' '}
        </p>
      </div>
    </>
  );
};

export default PdfDownloadButton;
