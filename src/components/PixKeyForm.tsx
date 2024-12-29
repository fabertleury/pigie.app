import React, { useState } from 'react';
import { Key } from 'lucide-react';

interface PixKeyFormProps {
  currentKey?: string;
  onSave: (key: string) => Promise<void>;
}

export function PixKeyForm({ currentKey, onSave }: PixKeyFormProps) {
  const [pixKey, setPixKey] = useState(currentKey || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(pixKey);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={pixKey}
          onChange={(e) => setPixKey(e.target.value)}
          className="w-full bg-dark pl-10 pr-4 py-2 rounded-lg border border-gray-800 text-white"
          placeholder="Sua chave PIX"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Salvando...' : 'Salvar Chave PIX'}
      </button>
    </form>
  );
}