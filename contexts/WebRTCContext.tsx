import React, { createContext, useContext, useState } from 'react';

interface WebRTCContextType {
  isCallModalVisible: boolean;
  callerInfo: {
    name: string;
    id: string;
  } | null;
  showCallModal: (name: string, id: string) => void;
  hideCallModal: () => void;
}

const WebRTCContext = createContext<WebRTCContextType | null>(null);

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCallModalVisible, setIsCallModalVisible] = useState(false);
  const [callerInfo, setCallerInfo] = useState<{ name: string; id: string } | null>(null);

  const showCallModal = (name: string, id: string) => {
    console.log('showCallModal', name, id);
    setCallerInfo({ name, id });
    setIsCallModalVisible(true);
  };

  const hideCallModal = () => {
    setIsCallModalVisible(false);
    setCallerInfo(null);
  };

  return (
    <WebRTCContext.Provider
      value={{
        isCallModalVisible,
        callerInfo,
        showCallModal,
        hideCallModal,
      }}>
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  return context;
}; 