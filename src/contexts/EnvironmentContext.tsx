import { createContext, useContext, ReactNode } from 'react';

interface EnvironmentContextType {
  isNpxBuild: boolean;
}

// Default to false, will be replaced by actual value at build time
const isNpxBuild = import.meta.env.VITE_BUILD_FOR_NPX === 'true';

const EnvironmentContext = createContext<EnvironmentContextType>({
  isNpxBuild
});

export const useEnvironment = () => useContext(EnvironmentContext);

interface EnvironmentProviderProps {
  children: ReactNode;
}

export const EnvironmentProvider = ({ children }: EnvironmentProviderProps) => {
  return (
    <EnvironmentContext.Provider value={{ isNpxBuild }}>
      {children}
    </EnvironmentContext.Provider>
  );
}; 