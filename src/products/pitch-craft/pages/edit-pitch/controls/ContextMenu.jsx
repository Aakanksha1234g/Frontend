import React, { useEffect, useRef, useState } from 'react';

const ContextMenu = ({
  x,
  y,
  onClose,
  hasSelection,
  canGroupItems,
  canUngroupItems,
  actions,
}) => {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ left: x, top: y });

  const {
    copySelection,
    pasteClipboard,
    deleteSelection,
    groupSelection,
    ungroupSelection,
    bringForward,
    bringToFront,
    sendBackward,
    sendToBack,
  } = actions;

  const menuItems = [
    { label: 'Cut', shortcut: 'Ctrl+X', action: () => { copySelection?.(); deleteSelection?.(); }, disabled: !hasSelection },
    { label: 'Copy', shortcut: 'Ctrl+C', action: copySelection, disabled: !hasSelection },
    { label: 'Paste', shortcut: 'Ctrl+V', action: pasteClipboard, disabled: false },
    { label: 'Delete', shortcut: 'Del', action: deleteSelection, disabled: !hasSelection, separator: true },
    { label: 'Group', shortcut: 'Ctrl+G', action: groupSelection, disabled: !canGroupItems },
    { label: 'Ungroup', shortcut: 'Ctrl+Shift+G', action: ungroupSelection, disabled: !canUngroupItems, separator: true },
    { label: 'Bring Forward', shortcut: 'Ctrl+]', action: bringForward, disabled: !hasSelection },
    { label: 'Bring to Front', shortcut: 'Ctrl+Shift+]', action: bringToFront, disabled: !hasSelection },
    { label: 'Send Backward', shortcut: 'Ctrl+[', action: sendBackward, disabled: !hasSelection },
    { label: 'Send to Back', shortcut: 'Ctrl+Shift+[', action: sendToBack, disabled: !hasSelection },
  ];

  useEffect(() => {
    const adjustPosition = () => {
      const menuEl = menuRef.current;
      if (!menuEl) return;

      const { innerHeight, innerWidth } = window;
      const rect = menuEl.getBoundingClientRect();

      let newTop = y;
      let newLeft = x;

      // --- Vertical positioning ---
      if (y + rect.height > innerHeight) {
        // Not enough space below → try placing above
        if (y - rect.height > 0) {
          newTop = y - rect.height;
        } else {
          // Even above is too tight → place as high as possible but keep visible
          newTop = Math.max(0, innerHeight - rect.height - 5);
        }
      }

      // --- Horizontal positioning ---
      if (x + rect.width > innerWidth) {
        // Not enough space to the right → try left side
        if (x - rect.width > 0) {
          newLeft = x - rect.width;
        } else {
          // Even left is too tight → bring it slightly inside
          newLeft = Math.max(0, innerWidth - rect.width - 5);
        }
      }

      // Safety clamp (in case near edges)
      newTop = Math.max(0, Math.min(newTop, innerHeight - rect.height));
      newLeft = Math.max(0, Math.min(newLeft, innerWidth - rect.width));

      setPosition({ top: newTop, left: newLeft });
    };

    adjustPosition();
    // Rerun when dimensions or click position change
    window.addEventListener('resize', adjustPosition);
    return () => window.removeEventListener('resize', adjustPosition);
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-md py-1 z-50 min-w-48"
      style={{ left: position.left, top: position.top }}
    >
      {menuItems.map((item, index) => (
        <React.Fragment key={index}>
          <div
            className={`px-3 py-2 text-sm cursor-pointer flex justify-between items-center hover:bg-gray-100 ${
              item.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'
            }`}
            onClick={() => {
              if (!item.disabled && item.action) {
                item.action();
                onClose();
              }
            }}
          >
            <span>{item.label}</span>
            <span className="text-xs text-gray-500 ml-4">{item.shortcut}</span>
          </div>
          {item.separator && <hr className="border-gray-200 my-1" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ContextMenu;
