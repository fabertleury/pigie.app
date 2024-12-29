import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

interface NumberTableProps {
  numbers: number[];
  onCopyNumber?: (number: number) => void;
}

export const NumberTable: React.FC<NumberTableProps> = ({ 
  numbers, 
  onCopyNumber 
}) => {
  const [copiedNumber, setCopiedNumber] = useState<number | null>(null);

  console.log('Números na tabela:', { 
    numbers, 
    hasNumbers: numbers.length > 0 
  });

  const handleCopyNumber = (number: number) => {
    // Copiar número para área de transferência
    navigator.clipboard.writeText(number.toString());
    
    // Mostrar feedback visual
    setCopiedNumber(number);
    
    // Chamar callback opcional
    if (onCopyNumber) {
      onCopyNumber(number);
    }

    // Resetar estado de copiado após 2 segundos
    setTimeout(() => {
      setCopiedNumber(null);
    }, 2000);
  };

  if (numbers.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        Não há números disponíveis para esta meta.
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-xl p-6 border border-gray-800/50 space-y-4">
      <h2 className="text-xl font-light text-white">Números Disponíveis</h2>
      
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {numbers.map((number, index) => (
          <motion.div
            key={number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <button
              onClick={() => handleCopyNumber(number)}
              className={`
                w-full py-2 rounded-lg text-center font-medium transition-all duration-300
                ${copiedNumber === number 
                  ? 'bg-green-500 text-white' 
                  : 'bg-dark-card border border-gray-800 text-white hover:bg-gray-800'
                }
              `}
            >
              {copiedNumber === number ? (
                <div className="flex items-center justify-center space-x-2">
                  <Check className="h-5 w-5" />
                  <span>Copiado</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Copy className="h-5 w-5" />
                  <span>{number}</span>
                </div>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
