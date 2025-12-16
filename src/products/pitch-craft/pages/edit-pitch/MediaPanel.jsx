import ShapeControls from "./controls/ShapeControls";
import ImageControls from "./controls/ImageControls";

export default function MediaPanel() {
    return (
        <div className="p-4">
            <div className="flex flex-col items-start justify-center">
                <h1 className="text-sm font-bold text-[#999999]">Shapes</h1>
                <ShapeControls />
            </div>
            <div className="flex flex-col items-start justify-center mt-4">
                <h1 className="text-sm font-bold text-[#999999]">Images</h1>
                <ImageControls />
            </div>
        </div>
    );
}