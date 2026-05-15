import React, { createContext, useContext, useEffect, useState } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

interface ConnectivityContextData {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string | null;
}

const ConnectivityContext = createContext<ConnectivityContextData>(
  {} as ConnectivityContextData,
);

export const useConnectivity = () => useContext(ConnectivityContext);

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [connection, setConnection] = useState<ConnectivityContextData>({
    isConnected: null,
    isInternetReachable: null,
    type: null,
  });

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setConnection({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setConnection({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ConnectivityContext.Provider value={connection}>
      {children}
    </ConnectivityContext.Provider>
  );
};
