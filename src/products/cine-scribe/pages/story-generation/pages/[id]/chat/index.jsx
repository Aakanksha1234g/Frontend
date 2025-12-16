import React, { useState, useEffect, useRef } from 'react';
import Textarea from '@shared/ui/textarea';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import Spinner from '@shared/ui/spinner';
import StoryDetailsPanel from '../../../components/DisplayStoryDetails';
import { wordLimits } from '@products/cine-scribe/constants/StoryGenerationConstants';
import { fetchData, sendData } from '@api/apiMethods';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProductHeader from '@shared/layout/product-header';
import { SendIcon, CopyIcon } from '@shared/layout/icons';
import ChatStoryGenerationLoading from './loading';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';
import IconButtonWithTooltip from '@shared/ui/IconButtonWithTooltip';


export default function ChatHistory() {
  const queryClient = useQueryClient();
  // const [storeChatData, setStoreChatData] = useState([]);
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef(null);
  const arrowRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const id = useParams().id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { setHeaderProps } = useProductHeader();


  const handleCopyClick = async (item, id) => {
    if (!item) return;

    try {
      await navigator.clipboard.writeText(item);
      setCopiedId(id);
      // Reset after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const {
    data: storyChatData = [],
    error,
    isPending,
  } = useQuery({
    queryKey: ['storyChat', id],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/story/display_chat?story_id=${id}`,
        method: 'GET',
      });
      return response?.data?.response?.chat_messages;
    },
    enabled: !!id,
    keepPreviousData: true,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const [localMessages, setLocalMessages] = useState([]);

  const storeChatData = [...storyChatData]; // combine both

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [storeChatData]);

  // Handle clicking the arrow to scroll down
  // const handleScrollToBottom = () => {
  //     if (chatContainerRef.current) {
  //         chatContainerRef.current.scrollTo({
  //             top: chatContainerRef.current.scrollHeight,
  //             behavior: "smooth",
  //         });
  //     }

  // };

  const { mutateAsync: generateBeatsMutation, isPending: isGenerating } =
    useMutation({
      mutationKey: ['generateBeats', id],
      mutationFn: async () => {
        return await sendData({
          endpoint: '/beat_sheet_generation/create_beat_sheet',
          method: 'POST',
          body: {
            story_id: Number(id),
          },
          responseMessage: 'Beat sheet created succesfully',
        });
      },
      onSuccess: response => {
        if (response?.data?.response === 'Beat sheet created successfully') {
          navigate(`/cine-scribe/story-generation/${id}/beat-sheet`);
        }
      },
      onError: error => {
        console.error('Error generating beats:', error);
      },
      onSettled: () => {
        setLoading(false);
      },
    });

  async function handleGenerateBeats() {
 
    setLoading(true);
    setLoadingText('Building the beat sheet');
    try {
      await generateBeatsMutation();
    } catch (error) {
      console.error('Error generating beats:', error);
    }
  }
  const { data: storyStatusBarDetails = {} } = useQuery({
    queryKey: ['storyStatusBarDetails', id],
    queryFn: async () => {
      const response = await fetchData({
        endpoint: `/story/display_story_status?story_id=${id}`,
        method: 'GET',
      });
      return response.data.response;
    },
    enabled: !!id,
    keepPreviousData: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });



  const { mutateAsync: sendMessageMutation, isPending: isSending } =
    useMutation({
      mutationKey: ['sendMessage', id],
      mutationFn: async edited_text => {
        return await sendData({
          endpoint: `/story_idea_generation/edit_chat`,
          method: 'PUT',
          body: {
            story_id: Number(id, 10),
            edited_text: String(edited_text),
          },
          responseMessage: 'Story edited successfully',
        });
      },
      onSuccess: (response, edited_text) => {
        const newMessage = response?.data?.response?.story;

        if (newMessage) {
          queryClient.setQueryData(['storyChat', id], (oldData = []) => {
      
            const updatedChat = [
              ...oldData,
              { role: 'human', content: edited_text },
              { role: 'ai', content: newMessage },
            ];

       
            setLocalMessages(prevChats => [
              ...prevChats,
              { role: 'ai', content: newMessage },
            ]);
            return updatedChat;
          });
        }
        // queryClient.invalidateQueries(['storyStatusBarDetails', id]);
      },
      onError: error => {
        console.error('Error editing beats:', error);

      },
      onSettled: () => {
        setLoading(false);
      },
    });
const wordCount =
  message && message.trim() !== '' ? message.trim().split(/\s+/).length : 0;





  const isMessageTooLong = wordCount > wordLimits.chatMessage;
  async function handleSendMessage() {
 

    const trimmedMessage = message.trim();
    if (trimmedMessage === '' || isMessageTooLong) return;

    const newMessage = { role: 'human', content: trimmedMessage };
    setLocalMessages(prevChats => [...prevChats, newMessage]);

    setMessage(''); // Clear input box
    setLoading(true);
    setLoadingText('Rewriting your story');

    try {
      await sendMessageMutation(trimmedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally show error UI or toast here
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  }

  useEffect(() => {
    setHeaderProps({
      showButton: storyStatusBarDetails?.beat_sheet_status === false,
      buttonText: 'Generate Beats',
      onButtonClick: handleGenerateBeats,
      showSGStatus: true,
      storyStatusBarDetails: storyStatusBarDetails,
      showDownload: true,
      pdfData: storyChatData?.at(-1)?.content,
    });
  }, [storyStatusBarDetails, storyChatData]);

  return (
    <div className="w-full h-full flex flex-col bg-primary-gray-50">
      {loading && <Spinner text={loadingText} />}

      {isPending ? (
        <div className="mt-[10px] flex flex-1 flex-col w-full responsive-container mx-auto py-4 ">
          <ChatStoryGenerationLoading />
        </div>
      ) : error ? (
        <div className="w-full flex-1 mx-auto flex flex-col gap-10 items-center justify-center bg-primary-gray-100">
          <p className="text-red-500">Failed to load chat data.</p>
        </div>
      ) : storeChatData.length > 0 ? (
        <>
          {/* Main Body */}
          <div className="flex-grow w-full flex overflow-hidden scrollbar-gray">
            {/* Sidebar */}
            <StoryDetailsPanel
              storyList={storyStatusBarDetails}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />

            {/* Chat Area */}
            <div className="flex flex-col items-center   flex-grow h-full transition-[width] duration-300 ease-in-out">
              {/* Scrollable Messages */}
              <div
                className="flex-grow overflow-y-auto w-full  mb-2 responsive-container px-4 py-2 flex flex-col items-center"
                style={{
                  paddingBottom: '10px',
                  overflowAnchor: 'none',
                }}
              >
                <div className="mt-[10px] flex flex-col w-full">
                  {storeChatData.map((chat, index) => (
                    <div key={index}>
                      {chat.role === 'ai' ? (
                        <div className="w-full flex flex-col justify-items-start items-start">
                          <p
                            className="text-sm text-[#A3A3A3] text-justify whitespace-pre-wrap rounded-lg shadow-xxl shadow-shadow-chat-button p-6"
                            style={{
                              background: '#171717',
                              border:
                                '1px solid var(--colors-base-default-100, #27272A)',
                            }}
                          >
                            {typeof chat.content === 'object'
                              ? JSON.stringify(chat.content)
                              : chat.content}
                          </p>

                          {/* Copy Button */}
                          <div className="flex items-center gap-2 py-1 px-2 cursor-pointer transition-all duration-200 hover:opacity-90">
                            <IconButtonWithTooltip
                              iconComponent={CopyIcon}
                              iconProps={{ color: 'white', size: 20 }}
                              onClick={() =>
                                handleCopyClick(chat.content, index)
                              }
                              tooltipText={'Copy'}
                              position="bottom"
                              iconButton={false}
                            />
                            {copiedId === (chat.id || index) && (
                              <div className="text-[#fcfcfc] bg-[#171717] border border-white/30 text-xs px-2 py-1 rounded-lg cursor-pointer transition-all duration-200 hover:opacity-90">
                                Copied!
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="w-4/5 ml-auto flex flex-col pb-2 items-end">
                          <div
                            className="col-start-2 max-w-full rounded-lg"
                            style={{
                              background: '#171717',
                              border:
                                '1px solid var(--colors-base-default-100, #27272A)',
                            }}
                          >
                            <p className="text-sm text-[#e5e5e5] text-justify rounded-lg px-3 p-3 ">
                              {typeof chat.content === 'object'
                                ? JSON.stringify(chat.content)
                                : chat.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* <div className="mt-[10px] mx-auto sticky w-full responsive-container flex justify-center p-3 responsive-container gap-3">
                <Textarea
                  value={message}
                  wordLimit={wordLimits.chatMessage}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Message to Lorven AI..."
                  rows={2}

                  className="flex-grow text-sm md:text-base bg-transparent border-none outline-none text-gray-100 placeholder-gray-500"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }

                  }}

                />
                <div
                  className="flex items-center justify-center rounded-md cursor-pointer transition-all duration-200 hover:opacity-90"
                  style={{
                    width: '38px',
                    height: '38px',
                    background: 'var(--accent-accent-hover, #262626)',
                    border:
                      '1px solid var(--colors-base-default-100, #27272A)',
                  }}
                  onClick={handleSendMessage}
                >
                  <IconButtonWithTooltip
                    iconComponent={SendIcon}
                    iconProps={{ color: 'white', fill: 'white', size: 20 }}
                    tooltipText={'Send'}
                    position="top"
                    iconButton={false}
                  />


                </div>
                
              </div> */}

              <div className="sticky bottom-0 w-full responsive-container flex justify-center px-3 pb-3 pr-8">
                <div
                  className={`flex flex-col w-full rounded-2xl shadow-lg border-1 transition-all duration-200 px-4 py-2 ${
                    isMessageTooLong
                      ? 'border-[#EB5545]'
                      : ' border-default-400'
                  }`}
                  style={{
                    background: '#202020',
                  }}
                >
                  {/* Textarea */}
                  <div className="w-full relative flex flex-col">
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Want to enhance further? Ask Lorven AI..."
                      className="w-full bg-transparent   outline-none text-gray-100 text-sm md:text-base resize-none overflow-y-auto placeholder-[#666666] rounded-xl px-2 py-2"
                      rows={1}
                      style={{
                        maxHeight: '180px',
                        lineHeight: '1.5rem',
                        overflowAnchor: 'none',
                      }}
                      onInput={e => {
                        const ta = e.target;
                        const container = chatContainerRef.current;

                        // 🧠 Save scroll state BEFORE resize
                        const prevScrollTop = container
                          ? container.scrollTop
                          : 0;
                        const prevScrollHeight = container
                          ? container.scrollHeight
                          : 0;

                        // Your existing auto-resize logic
                        ta.style.height = 'auto';
                        ta.style.height = ta.scrollHeight + 'px';

                        // 🧠 Restore scroll AFTER resize
                        if (container) {
                          const newScrollHeight = container.scrollHeight;
                          const delta = newScrollHeight - prevScrollHeight;
                          requestAnimationFrame(() => {
                            container.scrollTop = prevScrollTop + delta;
                          });
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!isMessageTooLong) handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p
                      className={`text-xs ${
                        isMessageTooLong
                          ? 'text-[#EB5545]'
                          : 'text-transparent select-none'
                      }`}
                    >
                      {isMessageTooLong ? 'Word limit exceeded' : '_'}
                    </p>
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-xs ${
                          isMessageTooLong ? 'text-[#EB5545]' : 'text-gray-400'
                        }`}
                      >
                        {wordCount}/{wordLimits.chatMessage}
                      </p>
                      <div
                        className={`flex items-center justify-center rounded-md cursor-pointer transition-all duration-200 ${
                          isMessageTooLong
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:opacity-90'
                        }`}
                        style={{
                          width: '38px',
                          height: '38px',
                          background: 'var(--accent-accent-hover, #262626)',
                          border:
                            '1px solid var(--colors-base-default-100, #27272A)',
                        }}
                        onClick={() => !isMessageTooLong && handleSendMessage()}
                      >
                        <IconButtonWithTooltip
                          iconComponent={SendIcon}
                          iconProps={{
                            color: isMessageTooLong ? '#EB5545' : 'white',
                            fill: isMessageTooLong ? '#EB5545' : 'white',
                            size: 20,
                          }}
                          tooltipText={'Send'}
                          position="top"
                          iconButton={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-grow container mx-auto flex flex-col items-center justify-center">
          <p>No Story Ideas Generated</p>
        </div>
      )}
    </div>
  );
}
