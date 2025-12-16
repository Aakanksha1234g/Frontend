import React from "react";
import { useNetworkStatus } from "@shared/hooks/useNetworkStatus.jsx";



export default function NetworkWrapper({ children }) {
  const isOnline = useNetworkStatus();

  if (!isOnline) {
    return (
       <div className="flex flex-col items-center justify-center text-center min-h-screen px-4 py-10 bg-gray-100">
  <img
    onClick={() => navigate('/home')}
    src="logo.svg"
    alt="Lorven Logo"
    className="w-40 cursor-pointer mb-6"
  />
  <h2 className="text-2xl font-semibold text-red-600 mb-2">⚠️ You're Offline</h2>
  <p className="text-gray-700 mb-4">Please check your internet connection.</p>
  <button
    onClick={() => location.reload()}
    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
  >
    Retry
  </button>
</div>

    );
  }

  return <>{children}</>;
}
