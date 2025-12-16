'use client';

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { notFoundMessages } from "@shared/constants/constants"; // adjust path as needed

export default function NotFoundRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(10);

  // Extract `type` from URL query param
  const queryType = new URLSearchParams(location.search).get("type");
  const message = notFoundMessages[queryType] || notFoundMessages["default"];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const timeoutId = setTimeout(() => {
      if (typeof message.buttonLink === "number") {
        window.history.go(message.buttonLink);
      } else {
        navigate(message.buttonLink);
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [navigate, message]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-2xl font-bold mb-2">{message.heading}</h1>
      <p className="mb-4">
        {message.description} Redirecting in {countdown} seconds.
      </p>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        onClick={() => {
          if (typeof message.buttonLink === "number") {
            window.history.go(message.buttonLink);
          } else {
            navigate(message.buttonLink);
          }
        }}
      >
        {message.buttonText}
      </button>
    </div>
  );
}
