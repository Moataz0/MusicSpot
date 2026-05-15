import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextData {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const { colors } = useTheme();
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-100));

  const showToast = useCallback(({ message, type = 'info', duration = 3000 }: ToastOptions) => {
    setToast({ message, type, duration });
    
    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 50, // Position from top
        useNativeDriver: true,
        bounciness: 10,
      })
    ]).start();

    // Animate out
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setToast(null);
      });
    }, duration);
  }, [fadeAnim, translateY]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'info': return 'information-circle';
      default: return 'information-circle';
    }
  };

  const getIconColor = (type: ToastType) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'info': return colors.primary;
      default: return colors.primary;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          className="absolute top-0 left-5 right-5 p-4 rounded-xl flex-row items-center border z-[9999] shadow-lg bg-surface border-border"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY }],
            shadowColor: '#000',
            elevation: 10,
          }}
        >
          <Ionicons name={getIcon(toast.type || 'info') as any} size={24} color={getIconColor(toast.type || 'info')} />
          <Text className="text-base ml-3 flex-1 font-semibold text-txt">{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};
