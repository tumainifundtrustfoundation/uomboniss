import React from 'react';
import { ParentPortalModal } from './portal/ParentPortalModal';

interface StudentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const StudentPortalModal: React.FC<StudentPortalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'dashboard',
}) => {
  return (
    <ParentPortalModal
      isOpen={isOpen}
      onClose={onClose}
      initialTab={initialTab}
    />
  );
};
