import React from 'react';
import { OnExitedEvent, OnCloseEvent } from './index';

export type ModalProps = {
  isOpen?: boolean;
  text: string;
  motionProps?: {
    onAnimationComplete?: (args: any) => void;
  };
  onClose?: (args: any) => void;
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  text,
  motionProps,
  onClose,
}) => {
  React.useEffect(() => {
    if (!isOpen) {
      if (onClose) {
        onClose(OnCloseEvent);
      }

      motionProps?.onAnimationComplete?.(OnExitedEvent);
    }
  }, [isOpen, motionProps, onClose]);

  if (!isOpen) {
    return null;
  }

  return <div>{text}</div>;
};

export default Modal;
