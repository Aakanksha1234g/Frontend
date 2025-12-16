import React, { useState } from 'react';

// Plus Icon Component
const PlusIcon = ({ color = 'currentColor', size = 24, strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line
      x1="12"
      y1="5"
      x2="12"
      y2="19"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <line
      x1="5"
      y1="12"
      x2="19"
      y2="12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

// Minus Icon Component
const MinusIcon = ({ color = 'currentColor', size = 24, strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line
      x1="5"
      y1="12"
      x2="19"
      y2="12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);

const AccordionItem = ({ open, onClick, title, children }) => (
  <div className="border-b border-[#232323]">
    <button
      className="flex items-center justify-between w-full py-6"
      onClick={onClick}
      aria-expanded={open}
    >
      <span className="text-lg font-medium">{title}</span>
      <span>{open ? <MinusIcon /> : <PlusIcon />}</span>
    </button>
    {open && <div className="px-2 text-sm pb-4">{children}</div>}
  </div>
);

const Accordion = ({ items }) => {
  const [openIndexes, setOpenIndexes] = useState(new Set());

  const toggle = index => {
    setOpenIndexes(prev => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.clear(); // Single open. Remove this line for multiple open.
        updated.add(index);
      }
      return updated;
    });
  };

  return (
    <div className="p-2 flex flex-col bg-[#121212] rounded-xl">
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          open={openIndexes.has(i)}
          onClick={() => toggle(i)}
          title={item.title}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;
