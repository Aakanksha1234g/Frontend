import { useState } from "react";
import searchIcon from "@assets/icons/SearchIcon.svg";


export default function FilterControls({
  query,
  onQueryChange,
  pageSize,
  onPageSizeChange,
  filter,
  onFilterChange,
  filtersList = [],
  perPageList = [],
}) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search Toggle + Input */}
      <div className="relative flex items-center gap-2">
        {showSearch && (
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search..."
              className="px-2 py-1 border rounded-md text-sm"
            />
            {query && (
              <button
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="absolute right-[10px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                &#10005;
              </button>
            )}
          </div>
        )}
        <button
          onClick={() => setShowSearch(prev => !prev)}
          className="iconButton"
          aria-label="Toggle Search"
        >
          <img src={searchIcon} alt="search" className="w-5 h-5" />
        </button>
      </div>

      {/* Per Page Selector */}
      {perPageList.length > 0 && (
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 rounded-md border text-sm"
        >
          {perPageList.map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
      )}

      {/* Filter Selector */}
      {filtersList.length > 0 && (
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-2 py-1 rounded-md border text-sm"
        >
          {filtersList.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
