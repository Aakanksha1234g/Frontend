import { useCommonActions } from '@products/pitch-craft/hooks/useCommonActions';

export default function CommonControl() {
    const {
      changeOpacity,
      changeColor,
      copySelection,
      pasteClipboard,
      deleteSelection,
    } = useCommonActions();

    return (
      <div className="flex items-center gap-2">
        <div className='flex flex-col items-center gap-2'>
          <label htmlFor="opacity-range">Opacity:</label>
          <input
            type="range"
            defaultValue={1}
            min="0"
            max="1"
            step="0.1"
            onChange={e => changeOpacity(e.target.value)}
          />
        </div>
        {/* <input type="color" onChange={e => changeColor(e.target.value)} /> */}
        <button onClick={copySelection}>copy</button>
        <button onClick={pasteClipboard}>paste</button>
        <button onClick={deleteSelection}>delete</button>
      </div>
    );
}