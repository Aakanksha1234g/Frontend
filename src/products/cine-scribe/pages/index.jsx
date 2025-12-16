import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import Button from '@shared/ui/button';
import { modules } from '../constants/ProductConstants';
import { PlusIcon, SubtractIcon, BackgroundSvg } from '@shared/layout/icons';
import CineScribe from '@assets/icons/CineScribe_White.svg';
import { useProductHeader } from '@products/cine-scribe/contexts/ProductHeaderContext';

// --- Reusable Responsive Hook ---
function useResponsiveSize(
  breakpoint = 1920,
  defaultSizeObj = {},
  largeSizeObj = {}
) {
  const defaultSize = useMemo(() => defaultSizeObj, []);
  const largeSize = useMemo(() => largeSizeObj, []);
  const [size, setSize] = useState(defaultSize);
  const { setHeaderProps } = useProductHeader();

  useEffect(() => {
    const handleResize = () => {
      const newSize = window.innerWidth >= breakpoint ? largeSize : defaultSize;
      setSize(prev => {
        // Only update if changed
        if (JSON.stringify(prev) !== JSON.stringify(newSize)) return newSize;
        return prev;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint, defaultSize, largeSize]);

  return size;
}






// --- Coming Soon Section ---
const ComingSoonSection = React.memo(() => {
  const { WIDTH, HEIGHT } = useResponsiveSize(
    1920,
    { WIDTH: 511, HEIGHT: 516 },
    { WIDTH: 554, HEIGHT: 695 }
  );

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
      <div className="flex flex-col items-start justify-between p-16">
        <div className="flex flex-col gap-6">
          <h6 className="text-sm text-[#747373]">STAY TUNED</h6>
          <h3 className="text-4xl font-medium">
            Be the first to know when we launch Lorven AI 2.0
          </h3>
          <p className="text-lg text-[#747373]">
            Sign up to receive exclusive updates, sneak peeks, and be the first
            to access our launch.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="mt-4 rounded-full hover:bg-white/70 text-black bg-[#E2E2E2]">
            Get started
          </Button>
          <Button className="mt-4 rounded-full hover:bg-[#E2E2E2]/20 text-[#E2E2E2] bg-[#1C1C1C]">
            Learn more
          </Button>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <BackgroundSvg
          WIDTH={WIDTH}
          HEIGHT={HEIGHT}
          BACKGROUND_COLOR="#1c1c1c"
        />
      </div>
    </section>
  );
});

// --- Bento Grid ---
const BentoGrid = () => {
  const { HEIGHT } = useResponsiveSize(
    1440, // medium breakpoint
    { HEIGHT: 131 }, // default (mobile/small)
    window.innerWidth >= 1920
      ? { HEIGHT: 298 } // large
      : { HEIGHT: 188 } // medium
  );

  const [hoveredIndex, setHoveredIndex] = useState(0);
  const navigate = useNavigate();
  const buttonSize = HEIGHT > 135 ? 'lg' : 'md';

  const handleHover = useCallback(index => setHoveredIndex(index), []);
  const handleClick = useCallback(
    index => {
      if (index === 0) navigate('/cine-scribe/story-generation');
      else if (index === 1) navigate('/cine-scribe/script-writing');
    },
    [navigate]
  );

  return (
    <section className="w-full grid grid-cols-12 gap-3 lg:gap-6 p-4 lg:p-6 transition-all duration-500">
      {modules.map((module, index) => {
        const isHovered = hoveredIndex === index;
        const reverse = index === 1; // reverse layout for second module

        return (
          <div
            key={index}
            onMouseEnter={() => handleHover(index)}
            onMouseLeave={() => handleHover(0)}
            className={`relative bg-[#121212] rounded-2xl flex flex-col  transition-all duration-700 ease-in-out p-4 sm:p-6 lg:p-6 gap-4 sm:gap-6 lg:gap-6 ${
              isHovered ? 'col-span-7' : 'col-span-5'
            }`}
          >
            <div
              className={`flex flex-col items-start justify-center`}
            >
              <h2 className="text-[18px] lg:text-2xl font-semibold mb-2">
                {module.title}
              </h2>
              <p className="text-sm opacity-90">{module.definition}</p>
              <Button
                size={buttonSize}
                className="mt-4 rounded-full hover:bg-white/70 cursor-pointer text-black bg-[#E2E2E2]"
                onClick={() => handleClick(index)}
              >
                {index === 0 ? 'Generate Story' : 'Analyze Your Script'}
              </Button>
            </div>
            {/* <div className={`flex justify-center items-center `}>
              <BackgroundSvg HEIGHT={HEIGHT} BACKGROUND_COLOR="#1c1c1c" />
            </div> */}
          </div>
        );
      })}
    </section>
  );
};



// --- Accordion ---
const AccordionItem = React.memo(({ open, onClick, title, children }) => (
  <div className="border-b border-[#232323]">
    <button
      className="flex items-center justify-between w-full py-4"
      onClick={onClick}
      aria-expanded={open}
    >
      <span className="text-lg  font-semibold text-white text-left">
        {title}
      </span>
      <span>
        {open ? <SubtractIcon color="#7F7F7F" /> : <PlusIcon color="#7F7F7F" />}
      </span>
    </button>
    {open && (
      <div className="px-2 pb-5 text-sm text-justify leading-tight text-[#A3A3A3] transition-all duration-300 ease-in-out">
        {children}
      </div>
    )}
  </div>
));


const Accordion = React.memo(({ items }) => {
  const [openIndex, setOpenIndex] = useState(-1);
  const toggle = useCallback(
    index => setOpenIndex(prev => (prev === index ? -1 : index)),
    []
  );
  return (
    <div className="p-2 flex flex-col bg-[#121212]  lg:rounded-xl">
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          open={openIndex === i}
          onClick={() => toggle(i)}
          title={item.title}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
});

// --- Dashboard ---
export default function Dashboard() {
  const items1 = useMemo(
    () => [
      {
        title: 'Do I need to be an experienced writer to use CineScribe?',
        content:
          'Not at all. CineScribe was built for everyone — from first-time storytellers to screenwriters. The AI guides you step-by-step, helping you brainstorm, polish, and level-up your story like a creative teammate who never runs out of ideas.',
      },
      {
        title: ' How does CineScribe handle my data and privacy?',
        content:
          'CineScribe runs entirely on secure, private servers — your data never leaves the system. All story generation and analysis happen within your environment, ensuring complete privacy and control. You don’t need to connect to any external AI service; everything stays safely on your server.',
      },
      {
        title: 'Can I generate a complete script using CineScribe?',
        content:
          'Absolutely. Start with your logline, characters, beats, and scene oneliners, and CineScribe builds a condensed draft with scene synopses. You can edit any beat or scene through simple prompts — and we’ll validate if the change fits your story’s flow.',
      },
    ],
    []
  );

   const items2 = useMemo(
     () => [
       {
         title: 'Why is this analysis valuable for writers and creators?',
         content:
           'It sharpens creative discussions. Instead of debating what went wrong, your team can focus on what to improve. The analysis gives direction clear data and story logic that turn creative debates into productive, story-elevating decisions.',
       },
       {
         title: 'What insights does CineScribe give about my script?',
         content:
           'As AI-powered story analyst, It breaks down your script’s act structure, pacing, beats, character arcs, and thematic flow, giving you a clear sense of what’s working — and what’s not hitting hard enough. The analysis turns instinct into data, helping you make creative choices with confidence.',
       },
       {
         title: 'Can I analyse my script from a scene level?',
         content:
           'Every scene gets its moment under the spotlight. CineScribe summarizes each one into a quick oneliner, identifies its type and its relevance to the whole narrative, estimates runtime duration, and calculates your total script runtime. It’s like getting a full storyboard-level clarity ',
       },
     ],
     []
   );

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0A0A0A] py-10">
      <div
        className="flex flex-1 gap-10 flex-col items-center justify-center  responsive-container
    mx-auto"
      >
        <section className="flex flex-col items-center justify-center ">
          <img src={"./product_logo/cine scribe.jpg"} alt="Cine Scribe Logo" className="h-[56px] w-[100px]" />
          <h4 className="text-4xl font-medium text-center lg:mt-[36px]">
            A Paradigm Shift in Productivity Tools
          </h4>
          <p className="text-center text-lg text-[#747373] mt-1">
            Maintain a detailed and easily accessible record of all team
            interactions with our comprehensive conversation history.
          </p>
        </section>

        <BentoGrid />
        {/* <ComingSoonSection /> */}

        <section className="w-full flex flex-col gap-4 lg:gap-14">
          <div className="flex flex-col gap-3">
            <h3 className="font-medium md:text-[18px] lg:text-4xl">Your Questions. Answered.</h3>
            <p className="font-extralight text-sm">
              Contact us if you have any other questions.
            </p>
          </div>
          <div className="grid gap-0 lg:gap-2 s1 lg:grid-cols-2 sm:grid-cols-1">
            <Accordion items={items1} />
            <Accordion items={items2} />
          </div>
        </section>
      </div>
    </div>
  );
}
