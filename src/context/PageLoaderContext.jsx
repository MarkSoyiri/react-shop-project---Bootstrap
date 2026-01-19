import { createContext, useState } from "react";

export const PageLoaderContext = createContext();

export function PageLoaderProvider({ children }) {
  const [pageLoading, setPageLoading] = useState(false);

  return (
    <PageLoaderContext.Provider value={{ pageLoading, setPageLoading }}>
      {children}
    </PageLoaderContext.Provider>
  );
}
