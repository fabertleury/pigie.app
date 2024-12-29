import React from 'react';
import { FileText, Check, X } from 'lucide-react';
import { formatCurrency } from '../utils/depositCalculator';
import type { PaymentProof } from '../types';

interface PaymentProofListProps {
  proofs: PaymentProof[] | Record<string, PaymentProof[]>;
  canVerify?: boolean;
  onVerify?: (proofId: string, verified: boolean) => Promise<void>;
}

export function PaymentProofList({ proofs, canVerify, onVerify }: PaymentProofListProps) {
  const handleVerify = async (proofId: string, verified: boolean) => {
    if (onVerify) {
      await onVerify(proofId, verified);
    }
  };

  // Normalizar proofs para um array
  const proofsList = Array.isArray(proofs) 
    ? proofs 
    : Object.values(proofs).flat();

  if (!proofsList || proofsList.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        Nenhum comprovante encontrado
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Comprovantes</h3>
      <div className="space-y-2">
        {proofsList.map((proof) => (
          <div
            key={proof.id}
            className="bg-dark-card p-4 rounded-lg border border-gray-800/50 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm text-white">
                  Número {proof.deposit_number} - {formatCurrency(proof.deposit_number || 0)}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(proof.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {proof.verified === null || proof.verified === undefined ? (
                canVerify && (
                  <>
                    <button
                      onClick={() => handleVerify(proof.id, true)}
                      className="p-1 hover:bg-green-500/10 rounded-full text-green-500"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleVerify(proof.id, false)}
                      className="p-1 hover:bg-red-500/10 rounded-full text-red-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </>
                )
              ) : (
                <div className={`text-xs ${proof.verified ? 'text-green-500' : 'text-red-500'}`}>
                  {proof.verified ? 'Verificado' : 'Rejeitado'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}