import React from 'react';
import ActiveStatusIcon from '@assets/icons/VerifiedCheck.svg';
import InActiveStatusIcon from '@assets/icons/DisabledVerifiedCheck.svg';
import { Link } from 'react-router';
// examplet status List to be sent
// const statusList = [
//   { name: "Story Ideation", activeStatus: true, redirectedPath: "/" },
//   { name: "Beat Sheet", activeStatus: false, redirectedPath: "/" },
//   { name: "One Liners", activeStatus: true, redirectedPath: "/" },
//   { name: "Script", activeStatus: true, redirectedPath: "/" },
// ];

export default function StatusBar({ statusList }) {
  return (
    <div className="statusBox">
      <div className="flex items-center justify-center flex-wrap lg:flex-row px-1 lg:px-4 gap-2 py-1 w-full rounded-lg relative">
        {statusList.map(item => (
          <React.Fragment key={item.name}>
            <Link
              style={{
                pointerEvents: item.activeStatus ? 'auto' : 'none',
                cursor: item.activeStatus ? 'pointer' : 'not-allowed',
              }}
              to={`${window.location.origin}${item.redirectedPath}`}
              className={`flex gap-1 lg:gap-2 items-center justify-center text-center flex-col flex-wrap hover:bg-primary-indigo-50 p-2 transition-all duration-300 ease-in-out  rounded-md hover:border-primary-indigo-200 border-2 border-transparent
                ${
                  window.location.pathname === item.redirectedPath
                    ? ' text-primary bg-primary-indigo-50'
                    : 'text-gray-500 hover:text-primary'
                } `}
            >
              {item.activeStatus ? (
                <img
                  src={ActiveStatusIcon}
                  alt="Active Status"
                  className="w-3  h-3 lg:w-4 lg:h-4"
                />
              ) : (
                <img
                  src={InActiveStatusIcon}
                  alt="Inactive Status"
                  className="w-4 h-4"
                />
              )}

              <span
                className={`text-[10px] lg:text-xs font-semibold transition-all duration-300 ease-in-out   `}
              >
                {item.name}
              </span>
            </Link>
            {/* {index < statusList.length - 1 && (
              <div className="h-[3px] bg-gray-300 flex-1 mx-2 relative mb-2">
                <div
                  className={`absolute inset-0  ${
                    !item.activeStatus ? " bg-primary-indigo-300" : "bg-primary"
                  } transition-all duration-300`}
                ></div>
              </div>
            )} */}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
