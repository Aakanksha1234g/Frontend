import { Suspense } from "react";
import { ToastProvider } from "@shared/Toast/ToastContext";
import Spinner from "@shared/ui/spinner";
import { Outlet } from "react-router";

function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<Spinner />}>
        <Outlet />
      </Suspense>
    </ToastProvider>
  );
}

export default App;