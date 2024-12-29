import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, Loader } from 'lucide-react';

export function SignUpForm() {
  const [email, setEmail] = useState('fabert_@hotmail.com');
  const [password, setPassword] = useState('123456789');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signUp } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signUp(email, password);
      navigate('/goals');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
      console.error('Erro no cadastro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm animate-shake">
          {error}
        </div>
      )}
      
      <div className="relative group">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
        <input
          id="signup-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-dark pl-10 pr-4 py-2 rounded-lg border border-gray-800 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          placeholder="Seu email"
        />
      </div>

      <div className="relative group">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
        <input
          id="signup-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-dark pl-10 pr-4 py-2 rounded-lg border border-gray-800 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          placeholder="Sua senha"
          minLength={6}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            <span>Criando conta...</span>
          </>
        ) : (
          <span>Criar conta</span>
        )}
      </button>
    </form>
  );
}