import React from 'react';
import { formatCurrency } from '../utils/depositCalculator';

interface GoalCalculatorProps {
  maxNumber: number;
  totalAmount: number;
  onMaxNumberChange: (value: number) => void;
}

export function GoalCalculator({ maxNumber, totalAmount, onMaxNumberChange }: GoalCalculatorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Quantidade de Números
        </label>
        <input
          type="number"
          value={maxNumber}
          onChange={(e) => onMaxNumberChange(Number(e.target.value))}
          className="w-full bg-dark p-2 rounded border border-gray-800 text-white"
          min="1"
          max="1000"
        />
        <p className="text-sm text-gray-400 mt-1">
          Total a ser arrecadado: {formatCurrency(totalAmount)}
        </p>
      </div>

      <div className="bg-dark/50 p-3 rounded-lg space-y-2">
        <div className="text-sm text-gray-400">Como funciona:</div>
        <div className="text-sm text-white">
          • Serão sorteados números de 1 até {maxNumber}
        </div>
        <div className="text-sm text-white">
          • O valor do depósito será igual ao número sorteado
        </div>
        <div className="text-sm text-white">
          • Ex: Número 5 = R$ 5,00 de depósito
        </div>
        <div className="text-sm text-primary">
          Total final: {formatCurrency(totalAmount)}
        </div>
      </div>
    </div>
  );
}