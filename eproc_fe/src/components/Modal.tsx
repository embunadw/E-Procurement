import { motion, AnimatePresence } from "framer-motion";
import React, { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  isModalOpen: boolean;
  longContent?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  children,
  isModalOpen,
  longContent = false,
}) => {
  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-70 z-[90] pt-10 px-5 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className={`modal-content max-w-[600px] h-fit w-full ${
              longContent ? "max-h-[95%]" : ""
            }`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
