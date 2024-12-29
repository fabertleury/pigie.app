import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice5 } from 'lucide-react';

interface NumberRouletteProps {
  maxNumber: number;
  onNumberDrawn?: (number: number) => void;
}

export const NumberRoulette: React.FC<NumberRouletteProps> = ({ 
  maxNumber, 
  onNumberDrawn 
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [drawnNumber, setDrawnNumber] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const spinDice = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // Simular animação de sorteio
    const spinDuration = 2000; // 2 segundos
    const spinSteps = 20;
    const stepInterval = spinDuration / spinSteps;
    
    let currentStep = 0;
    const spinInterval = setInterval(() => {
      // Gerar número aleatório a cada passo
      const randomNum = Math.floor(Math.random() * maxNumber) + 1;
      setDrawnNumber(randomNum);
      
      currentStep++;
      
      if (currentStep >= spinSteps) {
        clearInterval(spinInterval);
        
        // Número final sorteado
        const finalNumber = Math.floor(Math.random() * maxNumber) + 1;
        setDrawnNumber(finalNumber);
        setHistory(prev => [finalNumber, ...prev].slice(0, 10)); // Manter histórico de 10 números
        
        if (onNumberDrawn) {
          onNumberDrawn(finalNumber);
        }
        
        setTimeout(() => {
          setIsSpinning(false);
        }, 1000);
      }
    }, stepInterval);
  };

  return (
    <div className="bg-dark-card rounded-xl p-6 border border-gray-800/50 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light text-white">Sorteio de Número de Depósito</h2>
        <button 
          onClick={spinDice}
          disabled={isSpinning}
          className={`
            p-2 rounded-full transition-all duration-300
            ${isSpinning 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary-dark text-white'}
          `}
        >
          <Dice5 className="h-6 w-6" />
        </button>
      </div>

      <div className="flex items-center justify-center h-24">
        <AnimatePresence>
          {drawnNumber !== null && (
            <motion.div
              key="number"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
              className="text-6xl font-bold text-primary"
            >
              {drawnNumber}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-medium text-white mb-2">Histórico de Números</h3>
        <div className="grid grid-cols-5 gap-2">
          {history.map((num, index) => (
            <motion.div
              key={`${num}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="
                bg-gray-800 rounded-lg p-2 text-center 
                text-sm font-semibold text-white
                hover:bg-gray-700 transition-colors
              "
            >
              {num}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
