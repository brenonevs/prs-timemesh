import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ModalContextType {
  openModals: Set<string>;
  hasOpenModals: boolean;
  registerModal: (id: string) => void;
  unregisterModal: (id: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [openModals, setOpenModals] = useState<Set<string>>(new Set());

  const registerModal = useCallback((id: string) => {
    setOpenModals(prev => new Set(prev).add(id));
  }, []);

  const unregisterModal = useCallback((id: string) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const hasOpenModals = openModals.size > 0;

  return (
    <ModalContext.Provider value={{
      openModals,
      hasOpenModals,
      registerModal,
      unregisterModal
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// Hook for individual modals to register themselves
export const useModalRegistration = (isOpen: boolean, modalId: string) => {
  const { registerModal, unregisterModal } = useModal();

  React.useEffect(() => {
    if (isOpen) {
      registerModal(modalId);
    } else {
      unregisterModal(modalId);
    }

    return () => {
      unregisterModal(modalId);
    };
  }, [isOpen, modalId, registerModal, unregisterModal]);
}; 