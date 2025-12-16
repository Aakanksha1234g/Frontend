import { useState, useEffect } from "react";
import LorvenLogo from '@assets/pitch-craft/LorvenLogo.svg?react';
import CineSketchLogo from '@assets/cine-sketch/CineSketchLogo.svg?react';
import Sun from '@assets/pitch-craft/Sun.svg?react';
import Menu from '@assets/pitch-craft/Menu.svg?react';
import Sort from '@assets/pitch-craft/Sort.svg?react';
import Add from '@assets/pitch-craft/Add.svg?react';
import ScriptUploader from "./projects-page/ScriptUploader";
// import { useApplyTemplates } from "../contexts/TemplatesContext";
import Button from "@ui/Button";

export default function NavbarComponent({ onSortChange, showSort = true}) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Date Created");
  const [sortOrder, setSortOrder] = useState("Newest First");

  // useEffect(() => {
  //   setIsNewProjectOpen(templateId !== null);
  // }, [templateId]);

  const handleSortByChange = (option) => {
    setSortBy(option);
    if (onSortChange) {
      onSortChange({ sortBy: option, sortOrder });
    }
  };

  const handleSortOrderChange = (option) => {
    setSortOrder(option);
    if (onSortChange) {
      onSortChange({ sortBy, sortOrder: option });
    }
  };

  return (
    <div className="flex flex-col bg-[#171717] rounded-2xl mx-2 max-w-screen">
      {/* New Project Modal */}
      {isNewProjectOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          onClick={() => setIsNewProjectOpen(false)}
        >
          <div
            className="relative max-w-7xl w-[95%] max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <ScriptUploader setIsScriptUploaderOpen={setIsNewProjectOpen} />
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <div className="flex items-center justify-between h-12 px-2 rounded-t-2xl">
        <div className="flex items-center">
          <LorvenLogo alt="lorven-logo" className="h-6" />
        </div>

        <div className="flex items-center gap-2">
          <button className="bg-[#262626] p-1.5 rounded-md">
            <Menu alt="menu" className="h-5 w-6" />
          </button>
          <button className="bg-[#262626] p-1 rounded-md">
            <Sun alt="sun" className="h-5" />
          </button>
          <button
            onClick={() => setAvatarOpen(!avatarOpen)}
            className="h-8 w-8 rounded-full overflow-hidden"
          >
            <img
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </button>
          {avatarOpen && (
            <div className="absolute right-2 top-12 bg-gray-800 text-white rounded-md p-2">
              <p>Profile</p>
              <p>Logout</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navbar */}
      <div className="flex items-center justify-between h-12 px-2 border-t border-[#262626] rounded-b-2xl relative">
        <div className="flex items-center gap-2">
          <CineSketchLogo alt="CineSketch-logo" className="h-8 w-24" />
        </div>

        <div className="flex items-center gap-2">
          {showSort && (
            <div className="relative">
              <Button
                onClick={() => setSortOpen(!sortOpen)}
                className="gap-2 px-2 py-2 text-white font-medium"
                variant="transparent"
                size="md"
              >
                <span>Sort</span>
                <Sort alt="sort" className="h-4" />
              </Button>

              {/* Sort Dropdown */}
              {sortOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 bg-[#262626] rounded-lg overflow-hidden z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Sort by Section */}
                  <div className="py-2">
                    <div className="px-4 py-2 text-gray-400 text-xs font-medium">
                      Sort by
                    </div>

                    <button
                      onClick={() => handleSortByChange("Alphabetical")}
                      className="w-full flex items-center gap-2 px-4 py-2 text-white text-sm hover:bg-[#333333] transition-colors"
                    >
                      <svg
                        className={`h-4 w-4 ${sortBy === "Alphabetical" ? "opacity-100" : "opacity-0"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Alphabetical</span>
                    </button>

                    <button
                      onClick={() => handleSortByChange("Date Created")}
                      className="w-full flex items-center gap-2 px-4 py-2 text-white text-sm hover:bg-[#333333] transition-colors"
                    >
                      <svg
                        className={`h-4 w-4 ${sortBy === "Date Created" ? "opacity-100" : "opacity-0"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Date Created</span>
                    </button>

                    <button
                      onClick={() => handleSortByChange("Last Viewed")}
                      className="w-full flex items-center gap-2 px-4 py-2 text-white text-sm hover:bg-[#333333] transition-colors"
                    >
                      <svg
                        className={`h-4 w-4 ${sortBy === "Last Viewed" ? "opacity-100" : "opacity-0"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Last Viewed</span>
                    </button>
                  </div>

                  {/* Order Section */}
                  <div className="py-2 border-t border-[#333333]">
                    <div className="px-4 py-2 text-gray-400 text-xs font-medium">
                      Order
                    </div>

                    <button
                      onClick={() => handleSortOrderChange("Oldest First")}
                      className="w-full flex items-center gap-2 px-4 py-2 text-white text-sm hover:bg-[#333333] transition-colors"
                    >
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${sortOrder === "Oldest First" ? "border-white" : "border-gray-500"}`}>
                        {sortOrder === "Oldest First" && (
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span>Oldest First</span>
                    </button>

                    <button
                      onClick={() => handleSortOrderChange("Newest First")}
                      className="w-full flex items-center gap-2 px-4 py-2 text-white text-sm hover:bg-[#333333] transition-colors"
                    >
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${sortOrder === "Newest First" ? "border-white" : "border-gray-500"}`}>
                        {sortOrder === "Newest First" && (
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span>Newest First</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={() => setIsNewProjectOpen(true)}
            className={"border-1 border-primary-base gap-2 mx-2"}
          >
            <Add alt="add" className="h-5" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Click outside to close sort dropdown */}
      {sortOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setSortOpen(false)}
        ></div>
      )}
    </div>
  );
}