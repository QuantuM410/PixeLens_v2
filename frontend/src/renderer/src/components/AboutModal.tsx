import { X } from "lucide-react";

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-lg w-80 max-w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="font-semibold text-white">About PixeLens</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-white">PixeLens</h3>
            <p className="text-sm text-gray-400">Version 1.0.0</p>
          </div>
          <p className="text-sm text-gray-300">
            PixeLens is a UI debugging assistant designed to help developers identify and fix issues in their applications. It provides tools for accessibility checks, performance optimization, and styling consistency.
          </p>
          <p className="text-sm text-gray-400">
            Built with Electron, React, and TypeScript.
          </p>
          <p className="text-xs text-gray-500">
            © 2025 PixeLens. All rights reserved.
          </p>
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};