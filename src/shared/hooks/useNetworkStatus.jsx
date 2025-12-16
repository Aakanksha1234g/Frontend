import { useState } from "react";

export const useNetworkStatus = () => {
  const [isOnline] = useState(navigator.onLine);
  return isOnline;
};
