import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGoalStore } from '../store/goalStore';
import { PixKeyForm } from '../components/PixKeyForm';
import { supabase } from '../lib/supabase';
import { Info } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const { goals } = useGoalStore();
  const [isGoalOwner, setIsGoalOwner] = useState(false);

  useEffect(() => {
    const checkGoalOwnership = () => {
      if (user) {
        const ownerGoals = goals.filter(goal => goal.created_by === user.id);
        setIsGoalOwner(ownerGoals.length > 0);
      }
    };

    checkGoalOwnership();
  }, [user, goals]);

  const handlePixKeySave = async (pixKey: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ pix_key: pixKey })
        .eq('id', user.id);

      if (error) throw error;

      // Atualizar metadados do usuário
      await supabase.auth.updateUser({
        data: { pix_key: pixKey }
      });
    } catch (error) {
      console.error('Erro ao salvar chave PIX:', error);
      throw error;
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="bg-dark-card rounded-xl p-6 border border-gray-800/50">
        <h2 className="text-2xl font-light mb-6">Perfil</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome</label>
            <p className="text-white">{user.user_metadata?.full_name || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <p className="text-white">{user.email}</p>
          </div>
        </div>
      </div>

      {isGoalOwner ? (
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800/50 space-y-4">
          <h3 className="text-xl font-light flex items-center space-x-2">
            <Key className="h-5 w-5 text-primary" />
            <span>Chave PIX</span>
          </h3>
          <PixKeyForm 
            currentKey={user.user_metadata?.pix_key || ''} 
            onSave={handlePixKeySave} 
          />
        </div>
      ) : (
        <div className="bg-dark-card rounded-xl p-6 border border-yellow-800/50 flex items-center space-x-4 text-yellow-500">
          <Info className="h-6 w-6" />
          <p>Você precisa criar uma meta para cadastrar sua chave PIX.</p>
        </div>
      )}
    </div>
  );
};

export default Profile;