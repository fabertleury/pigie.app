import React, { useState } from 'react';
import { Dice6, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../utils/depositCalculator';
import { PaymentProofUpload } from './PaymentProofUpload';
import QRCode from 'react-qr-code';
import { useToast } from './ui/toaster';

interface NumberDrawerProps {
  hasPixKey: boolean;
  maxNumber: number;
  completedNumbers?: number[];
  onDrawNumber: () => Promise<number>;
  onUploadProof: (file: File) => Promise<void>;
  pixKey: string;
  targetAmount: number;
}

export function NumberDrawer({ 
  hasPixKey, 
  maxNumber, 
  completedNumbers = [],
  onDrawNumber,
  onUploadProof,
  pixKey,
  targetAmount
}: NumberDrawerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnNumber, setDrawnNumber] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const { showToast } = useToast();

  const handleDraw = async () => {
    console.log('Iniciando sorteio', { 
      hasPixKey, 
      availableNumbers: maxNumber - completedNumbers.length, 
      maxNumber,
      completedNumbers
    });

    if (maxNumber - completedNumbers.length === 0) {
      console.error('Sem números disponíveis');
      alert('Não há mais números disponíveis para esta meta');
      return;
    }

    setIsDrawing(true);
    
    try {
      // Simular animação de sorteio
      const spinDuration = 2000; // 2 segundos
      const spinSteps = 20;
      const stepInterval = spinDuration / spinSteps;

      // Chamar função para sortear número
      const number = await onDrawNumber();
      
      // Atualizar estado
      setDrawnNumber(number);
      setHistory(prev => [...prev, number]);
      setIsDrawing(false);
    } catch (error) {
      console.error('Erro ao sortear número:', error);
      alert('Erro ao sortear número. Tente novamente.');
      setIsDrawing(false);
    }
  };

  const handleCopyNumber = () => {
    if (drawnNumber !== null) {
      navigator.clipboard.writeText(drawnNumber.toString()).then(() => {
        showToast({
          message: 'Número copiado com sucesso!',
          type: 'success'
        });
      });
    }
  };

  const generatePixQRCode = () => {
    if (!drawnNumber) return null;

    // Gerar QR Code para PIX
    const pixPayload = `00020126360014BR.GOV.BCB.PIX0114${pixKey}5204000053039865406${targetAmount.toFixed(2)}5802BR5925Financeiro6007CIDADE62070503***6304`;
    
    return (
      <div className="flex flex-col items-center space-y-4 mt-4">
        <div className="bg-white p-4 rounded-lg">
          <QRCode 
            value={pixPayload} 
            size={200}
          />
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleCopyNumber}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Copy className="h-5 w-5" />
            <span>Copiar Número</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-dark-card rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sortear Número</h2>
        <span className="text-gray-400">
          {completedNumbers.length} / {maxNumber} números
        </span>
      </div>

      {drawnNumber === null ? (
        <button 
          onClick={handleDraw}
          disabled={isDrawing || maxNumber - completedNumbers.length === 0}
          className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors ${
            isDrawing || maxNumber - completedNumbers.length === 0
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
        >
          {isDrawing ? (
            <Dice6 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Dice6 className="h-6 w-6" />
              <span>Sortear Número</span>
            </>
          )}
        </button>
      ) : (
        <div className="text-center space-y-4">
          <div className="bg-primary/10 rounded-xl p-6">
            <p className="text-2xl font-bold text-primary">{drawnNumber}</p>
            <p className="text-gray-400 mt-2">Número sorteado</p>
          </div>
          
          {generatePixQRCode()}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Histórico</h3>
          <div className="flex space-x-2">
            {history.map((num, index) => (
              <span 
                key={index} 
                className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm"
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

      <PaymentProofUpload 
        drawnNumber={drawnNumber} 
        onUploadProof={onUploadProof} 
      />
    </div>
  );
}