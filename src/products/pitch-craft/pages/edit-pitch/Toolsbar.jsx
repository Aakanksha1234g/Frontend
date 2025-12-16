import TemplatesControls from './controls/TemplatesControls';
import DownloadControls from './controls/DownloadControls';
import TextControls from './controls/TextControls';
import ImageControls from './controls/ImageControls';
import HistoryControls from './controls/HistoryControls';
import ShapeControls from './controls/ShapeControls';
import RegenerateControl from './controls/RegenerateControl';

export default function Toolsbar() {
    return (
        <div className="bg-white dark:bg-dark-default-main border-1 border-light-accent-soft_hover dark:border-0 mt-3 rounded-full p-1">
            <TemplatesControls />
            <div className="flex justify-start items-center flex-wrap w-full gap-2">
                <HistoryControls />
                <span className='text-[#2C2C2C]'>|</span>
                <TextControls />
                <span className='text-[#2C2C2C]'>|</span>
                <ShapeControls />
                <span className='text-[#2C2C2C]'>|</span>
                <ImageControls />
                <RegenerateControl />
                <span className='text-[#2C2C2C]'>|</span>
                <DownloadControls />
            </div>
        </div>
    )
}