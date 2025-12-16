import React from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";

const GlobalErrorPage = () => {
  const error = useRouteError();

  console.error("Global Route Error:", error);
  
  let message = "Unexpected application error.";

  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
  } else if (error?.message) {
    message = error.message;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen text-center bg-red-50 px-6 text-red-700">
      <h1 className="text-3xl font-bold mb-4">Application Error</h1>
      <p className="text-lg">{message}</p>
    </div>
  );
};

export default GlobalErrorPage;
