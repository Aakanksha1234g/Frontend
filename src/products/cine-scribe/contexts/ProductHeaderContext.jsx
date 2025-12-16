import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { useLocation } from 'react-router';

const ProductHeaderContext = createContext({
  setHeaderProps: () => {},
  headerProps: {},
});

export function useProductHeader() {
  return useContext(ProductHeaderContext);
}

export function ProductHeaderProvider({ children }) {
  const location = useLocation();

  const defaultHeaderProps = {
    showSearch: false,
    showFilter: false,
    showSGFilter: false,
    showSort: false,
    showButton: false,
    showSGStatus: false,
    showSWStatus: false,
  };

  const [headerProps, setHeaderProps] = useState(defaultHeaderProps);

  // Stable setter
  const setHeader = useCallback(
    props => setHeaderProps(props || defaultHeaderProps),
    []
  );

  // Reset header when navigating to /cine-scribe
  useEffect(() => {
    if (location.pathname === '/cine-scribe') {
      setHeaderProps(defaultHeaderProps);
    }
  }, [location.pathname]);

  return (
    <ProductHeaderContext.Provider
      value={{ headerProps, setHeaderProps: setHeader }}
    >
      {children}
    </ProductHeaderContext.Provider>
  );
}
