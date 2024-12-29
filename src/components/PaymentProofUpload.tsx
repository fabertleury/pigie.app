import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { formatCurrency } from '../utils/depositCalculator';

interface PaymentProofUploadProps {
  drawnNumber?: number | null;
  onUpload: (file: File) => Promise<void>;
}

export function PaymentProofUpload({ drawnNumber, onUpload }: PaymentProofUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-dark-card p-4 rounded-lg border border-gray-800/50 space-y-4">
      {drawnNumber && drawnNumber > 0 ? (
        <div className="text-sm text-gray-400">
          Anexar comprovante para o valor {formatCurrency(drawnNumber)}
        </div>
      ) : null}

      <div className="relative">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="proof-upload"
        />
        <label
          htmlFor="proof-upload"
          className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-800 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
        >
          <Upload className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-400">
            {selectedFile ? selectedFile.name : 'Selecionar comprovante'}
          </span>
        </label>
        {selectedFile && (
          <button
            onClick={() => setSelectedFile(null)}
            className="absolute top-2 right-2 p-1 hover:bg-gray-800/50 rounded-full"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
        >
          {isUploading ? 'Enviando...' : 'Enviar Comprovante'}
        </button>
      )}
    </div>
  );
}