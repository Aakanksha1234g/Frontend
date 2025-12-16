import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '../../../../../shared/ui/card';
import Copy from '@assets/icons/Copy.svg';
import edit from '@assets/icons/PenNewSquare.svg';
import Textarea from '@shared/ui/textarea';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';
import { wordLimits } from '@products/cine-scribe/constants/StoryGenerationConstants';

export function Box({
  item,
  type,
  title,
  location,
  int_ext,
  shot_time,
  setEditList,
  index,
  highlightedIndices = [],
  editMessage,
}) {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [message, setMessage] = useState(editMessage || '');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setMessage(editMessage || '');
  }, [editMessage, isInputVisible]);

  useEffect(() => {
    if (isInputVisible && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isInputVisible]);

  const handleCopyClick = e => {
    e.stopPropagation(); // Prevents triggering card click
    if (!item) return;
    navigator.clipboard
      .writeText(item)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };

  const handleEditClick = e => {
    e.stopPropagation(); // Prevents triggering card click
    setIsInputVisible(!isInputVisible);
  };

  const handleSaveMessage = () => {
    if (message.trim() === '') return;
    setEditList(prev => ({ ...prev, [index]: message }));
    setIsInputVisible(false);
    setMessage('');
  };

  const handleCancel = e => {
    e.stopPropagation(); // Prevents triggering card click
    setIsInputVisible(false);
    setMessage('');
  };
  return (
    <div className="w-full flex flex-col">
      <Card
        onClick={() =>
          (message === '' || message === editMessage) &&
          setIsInputVisible(!isInputVisible)
        }
        className={`group border-none cursor-pointer relative overflow-hidden transition-all duration-500 ease-in-out shadow-2xl shadow-shadow-chat-button rounded-2xl min-h-fit 
    ${highlightedIndices.includes(index) ? 'bg-primary-indigo-100' : ''}
  `}
      >
        <CardContent className="px-6 pt-6 relative">
          {title ? (
            <div className="mb-2">
              <CardTitle className="text-xl font-bold">Scene {index}</CardTitle>

              <CardDescription className="mt-2 uppercase text-sm font-semibold tracking-wide">
                {int_ext}. {location} – {shot_time}
              </CardDescription>

              <CardDescription className="mt-2 text-sm whitespace-pre-line text-justify">
                {title}

                {'\n' + item}
              </CardDescription>
            </div>
          ) : (
            <div>
              <CardTitle className="text-lg">
                {type} {index}
              </CardTitle>
              <CardDescription className="mt-2 text-justify text-sm">
                {item}
              </CardDescription>
            </div>
          )}

          {isInputVisible && (
            <div className="mt-4 relative" onClick={e => e.stopPropagation()}>
              <Textarea
                ref={textareaRef}
                wordLimit={wordLimits.editBox}
                placeholder="Write your message here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                wordCountPosition="top-right"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    // optionally allow Shift+Enter for newline
                    e.preventDefault();
                    if (
                      message.trim().split(/\s+/).length <= wordLimits.editBox
                    ) {
                      handleSaveMessage();
                    }
                  }
                }}
              />
            </div>
          )}
          <div
            className={`w-full flex items-center ${
              isInputVisible ? 'justify-between' : 'justify-end'
            } mt-1`}
          >
            <p
              className={`text-sm text-gray-400 ${
                isInputVisible ? 'flex' : 'hidden'
              } `}
            >
              * Press Enter to save, Shift+Enter for newline
            </p>
            <div className="flex items-center gap-2">
              <div className={`  gap-2 ${isInputVisible ? 'flex' : 'hidden'} `}>
                <button className="button-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button
                  className={`button-primary  `}
                  disabled={message.split(' ').length > wordLimits.editBox}
                  onClick={() => {
                    if (message.split(' ').length > wordLimits.editBox) {
                      return;
                    }
                    handleSaveMessage();
                  }}
                >
                  Save
                </button>
              </div>
              <div
                className={` ${
                  !isInputVisible ? 'flex self-end' : 'hidden'
                }  items-center  gap-2`}
              >
                <IconButtonWithTooltip
                  imageUrl={Copy}
                  altText="Copy"
                  tooltipText="Copy"
                  iconButton={false}
                  onClick={handleCopyClick}
                />

                {copied && (
                  <div className="text-black text-xs px-2 py-1 rounded-lg ">
                    Copied!
                  </div>
                )}
                <IconButtonWithTooltip
                  imageUrl={edit}
                  altText="Edit"
                  tooltipText="Edit"
                  iconButton={false}
                  onClick={handleEditClick}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
