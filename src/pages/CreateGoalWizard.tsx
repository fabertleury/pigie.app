import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoalStore } from '../store/goalStore';
import { useAuthStore } from '../store/authStore';
import { 
  calculateTotalFromRange, 
  calculateNumbersFromTotal,
  formatCurrency,
} from '../utils/depositCalculator';
import { Info } from 'lucide-react';

const CreateGoalWizard: React.FC = () => {
  const navigate = useNavigate();
  const { createGoal } = useGoalStore();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [maxNumber, setMaxNumber] = useState(250);
  const [targetAmount, setTargetAmount] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [pixKey, setPixKey] = useState(user?.pix_key || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [calculationType, setCalculationType] = useState<'numbers' | 'amount'>('numbers');

  const totalAmount = useMemo(() => {
    // Soma de todos os números de 1 até maxNumber
    return calculateTotalFromRange(maxNumber);
  }, [maxNumber]);

  const handleNumberChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const numericValue = Number(cleanValue);
    
    if (calculationType === 'numbers') {
      // Quando o usuário define o número de depósitos
      setMaxNumber(numericValue);
    } else {
      // Quando o usuário define o valor total
      const amount = numericValue / 100;
      
      // Formata o valor para exibição
      setTargetAmount(formatCurrency(amount));
      
      if (amount > 0) {
        // Calcula o número de depósitos necessários
        const numbers = calculateNumbersFromTotal(amount);
        setMaxNumber(numbers);
      }
    }
  };

  const handlePixKeyChange = (value: string) => {
    const cleanedValue = value.replace(/\D/g, '');
    
    // Máscara de CPF
    let maskedValue = cleanedValue;
    if (maskedValue.length > 3) {
      maskedValue = `${maskedValue.slice(0, 3)}.${maskedValue.slice(3)}`;
    }
    if (maskedValue.length > 7) {
      maskedValue = `${maskedValue.slice(0, 7)}.${maskedValue.slice(7)}`;
    }
    if (maskedValue.length > 11) {
      maskedValue = `${maskedValue.slice(0, 11)}-${maskedValue.slice(11)}`;
    }
    
    setPixKey(maskedValue.slice(0, 14));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!title.trim()) {
      alert('Por favor, insira um título para a meta');
      return;
    }

    if (maxNumber <= 0) {
      alert('O número máximo deve ser maior que zero');
      return;
    }

    const cleanPixKey = pixKey.replace(/\D/g, '');
    const cpfRegex = /^\d{11}$/;
    
    if (!cleanPixKey) {
      alert('Por favor, insira uma chave PIX');
      return;
    }

    if (!cpfRegex.test(cleanPixKey)) {
      alert('Por favor, insira um CPF válido como chave PIX');
      return;
    }

    const selectedDate = new Date(startDate);
    const today = new Date();
    if (selectedDate < today) {
      alert('A data de início não pode ser anterior a hoje');
      return;
    }

    try {
      await createGoal({
        title,
        maxNumber,
        isGroup,
        pixKey: cleanPixKey,
        startDate
      });
      navigate('/goals');
    } catch (error) {
      console.error('Error creating goal:', error);
      alert(`Erro ao criar meta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-dark-card p-6 rounded-lg w-full max-w-md mx-auto">
        <h2 className="text-xl font-light text-white mb-4">Nova Meta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título da Meta */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Título da Meta</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark p-2 rounded border border-gray-800 text-white"
              placeholder="Ex: Viagem dos Sonhos"
              required
            />
          </div>

          {/* Seleção de Tipo de Cálculo */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setCalculationType('numbers')}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                calculationType === 'numbers'
                  ? 'bg-primary text-white'
                  : 'bg-dark text-gray-400'
              }`}
            >
              Por Depósitos
            </button>
            <button
              type="button"
              onClick={() => setCalculationType('amount')}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                calculationType === 'amount'
                  ? 'bg-primary text-white'
                  : 'bg-dark text-gray-400'
              }`}
            >
              Por Valor
            </button>
          </div>

          {/* Entrada de Números/Valor */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {calculationType === 'numbers' 
                ? 'Número de Depósitos' 
                : 'Valor Total Desejado'}
            </label>
            <input
              type="text"
              value={calculationType === 'numbers' ? maxNumber : targetAmount}
              onChange={(e) => handleNumberChange(e.target.value)}
              className="w-full bg-dark p-2 rounded border border-gray-800 text-white"
              placeholder={calculationType === 'numbers' 
                ? 'Ex: 250' 
                : 'Ex: 30.000'}
            />
            
            {/* Informações de Resultado */}
            {calculationType === 'numbers' && (
              <p className="text-sm text-gray-400 mt-1">
                Valor total: {formatCurrency(totalAmount)}
              </p>
            )}
            
            {calculationType === 'amount' && (
              <p className="text-sm text-gray-400 mt-1">
                Número de depósitos necessários: {maxNumber}
              </p>
            )}
          </div>

          {/* Meta em Grupo */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isGroupCheckbox"
              checked={isGroup}
              onChange={(e) => setIsGroup(e.target.checked)}
              className="hidden"
            />
            <label 
              htmlFor="isGroupCheckbox" 
              className={`
                relative inline-flex items-center cursor-pointer
                w-12 h-6 rounded-full transition-colors duration-300
                ${isGroup ? 'bg-primary' : 'bg-gray-700'}
              `}
            >
              <span 
                className={`
                  absolute left-1 top-1 w-4 h-4 rounded-full 
                  transform transition-transform duration-300
                  ${isGroup ? 'translate-x-6 bg-white' : 'translate-x-0 bg-gray-400'}
                `} 
              />
            </label>
            <span className="text-sm text-gray-400">
              Meta em Grupo
            </span>
          </div>

          {/* Data de Início */}
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center space-x-2">
              <span>Data de Início dos Depósitos</span>
              <div 
                title="Quando os participantes podem começar a depositar" 
                className="text-gray-500 cursor-help"
              >
                <Info className="h-4 w-4" />
              </div>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-dark p-2 rounded border border-gray-800 text-white"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Chave PIX */}
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center space-x-2">
              <span>Chave PIX (CPF)</span>
              <div 
                title="Use apenas números do CPF como chave PIX" 
                className="text-gray-500 cursor-help"
              >
                <Info className="h-4 w-4" />
              </div>
            </label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => handlePixKeyChange(e.target.value)}
              className="w-full bg-dark p-2 rounded border border-gray-800 text-white"
              placeholder="Digite seu CPF"
              maxLength={14}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Use apenas os 11 números do seu CPF
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded transition-colors"
            >
              Criar Meta
            </button>
            <button
              type="button"
              onClick={() => navigate('/goals')}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGoalWizard;
