import React, { useState, useRef, useEffect } from "react";
import Star from "@assets/pitch-craft/Star.svg?react";
import Back from "@assets/pitch-craft/Back.svg?react";
import { template } from "@products/pitch-craft/constants/templates/templates";
import { useApplyTemplates } from "@products/pitch-craft/contexts/TemplatesContext";
import Button from "@ui/Button";
import CloseIcon from '@assets/pitch-craft/CloseIcon.svg?react';

export default function Templates({ showProjects, setShowProjects }) {
  const [showButton, setShowButton] = useState(false);
  const scrollRef = useRef(null);
  const { templateId, setTemplateId, showTemplates, setShowTemplates, setIsNewProjectOpen } = useApplyTemplates();

  // Use imported templates directly
  const contents = template.map((item, i) => ({
    template_id: item.template_id,
    title: item.template_title,
    image: item.template_url,
  }));

  // Show "More Templates" button after scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      setShowButton(el.scrollLeft > 50);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [showProjects]);

  // Allow mouse wheel to scroll horizontally
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [showProjects]);

  return (
    <div
      className={`w-full ${showProjects
        ? "rounded-2xl flex justify-start gap-2"
        : "rounded-2xl p-6"
        }`}
    >
      <div className="flex justify-start items-center">
        {!showProjects && !showTemplates && (
          <div className="mb-4 flex justify-start">
            <Button
              onClick={() => setShowProjects(true)}
              className="px-4 py-2"
              variant={"transparent"}
            >
              <Back className="h-4 w-full fill-dark dark:fill-white" />
            </Button>
          </div>
        )}
        {
          !showTemplates ? (
            <div
              className={`flex items-center gap-4 m-6 transition-all duration-700 ease-in-out  ${!showProjects
                ? "flex-1 justify-center text-center"
                : "md:flex-row md:items-center md:gap-6 md:text-left"
                }`}
            >
              <Star          
                className={`w-20 h-20 transform transition-transform duration-700 ease-in-out fill-light-text dark:fill-dark-text ${showProjects ? "scale-75" : "scale-110"}`}
              />
              <div
                className={`font-extralight text-light-text dark:text-dark-text leading-tight text-left transition-all duration-700 ease-in-out ${!showProjects ? "text-2xl md:text-3xl" : "text-xl md:text-3xl"
                  }`}
              >
                Explore <br />
                <span
                  className={`font-medium transition-all duration-700 ease-in-out ${!showProjects ? "text-2xl md:text-3xl" : "text-xl md:text-3xl"
                    }`}
                >
                  Templates
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center gap-2 w-full mx-4 mb-4">
              <h1 className="font-normal leading-tight text-light-text dark:text-dark-text text-left transition-all duration-700 ease-in-out">
                Choose a Template</h1>
              <Button
                onClick={() => {
                  setIsNewProjectOpen(false);
                  setShowTemplates(false);
                }}
                className="p-2 rounded-full z-10"
              >
                <CloseIcon />
              </Button>
            </div>
          )
        }
      </div>

      {showProjects && (
        <div
          ref={scrollRef}
          className="flex flex-1 items-center gap-4 overflow-x-auto scrollbar-hide m-6"
        >
          {contents.slice(0, 6).map((content, idx) => (
            <Button
              key={idx}
              className="relative flex-shrink-0 w-60 h-36 rounded-xl overflow-hidden group"
              variant="transparent"
              onClick={() => {
                setTemplateId(content.template_id);
                console.log(templateId)
              }}
            >
              <img
                src={content.image}
                alt={content.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full px-3 py-2 dark:bg-gradient-to-t dark:from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <h4 className="text-white text-lg font-bold">
                  {content.title}
                </h4>
              </div>
            </Button>
          ))}

          {showButton && (
            <Button
              onClick={() => setShowProjects(false)}
              className="text-xs min-w-32"
              size="xl"
              variant="primary"
            >
              More Templates →
            </Button>
          )}
        </div>
      )}

      {!showProjects && (
        <div className="opacity-100 transition-all duration-700 ease-in-out">
          <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-6">
            {contents.map((content, idx) => (
              <Button
                variant={"transparent"}
                key={idx}
                className="relative w-full h-44 md:h-52 group rounded-xl overflow-hidden cursor-pointer"
                onClick={() => {
                  setTemplateId(content.template_id);
                  console.log(templateId);
                }}
              >
                <img
                  src={content.image}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full px-4 py-2 dark:bg-gradient-to-t dark:from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <h4 className="text-white text-xl font-extrabold">
                    {content.title}
                  </h4>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
