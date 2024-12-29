import React from 'react';

interface DepositGridProps {
  totalDeposits: number;
  completedNumbers: number[];
}

export function DepositGrid({ totalDeposits, completedNumbers }: DepositGridProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {Array.from({ length: totalDeposits }).map((_, index) => {
        const number = index + 1;
        const isCompleted = completedNumbers.includes(number);
        
        return (
          <div
            key={number}
            className={`
              aspect-square rounded-lg flex items-center justify-center text-sm
              ${isCompleted 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-dark-card border border-gray-800/50 text-gray-400'}
            `}
          >
            {number}
          </div>
        );
      })}
    </div>
  );
}