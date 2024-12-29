import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGoalStore } from '../store/goalStore';
import { GroupRanking } from '../components/GroupRanking';
import { PaymentProofList } from '../components/PaymentProofList';
import { NumberDrawer } from '../components/NumberDrawer';
import { InviteModal } from '../components/InviteModal';
import { Target, Users, Trophy, QrCode, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '../components/ui/toaster';

const GoalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const { 
    goals, 
    proofs, 
    participants,
    requestDepositNumbers,
    uploadProof,
    verifyProof,
    fetchProofs,
    fetchParticipants
  } = useGoalStore();

  const goal = goals.find(g => g.id === id);
  const isOwner = goal?.created_by === user?.id;

  useEffect(() => {
    if (id) {
      fetchProofs(id);
      fetchParticipants(id);
    } else {
      showToast({
        message: 'Meta não encontrada',
        type: 'error'
      });
      navigate('/goals');
    }
  }, [id]);

  if (!goal || !user) return null;

  const progressPercentage = goal.total_deposits 
    ? Math.min((goal.total_deposits / goal.target_amount) * 100, 100) 
    : 0;

  return (
    <div className="space-y-8 p-4">
      <button 
        onClick={() => navigate('/goals')}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Voltar para Metas</span>
      </button>

      {/* Detalhes da Meta */}
      <div className="bg-dark-card rounded-xl p-6 border border-gray-800/50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <Target className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-light">{goal.title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            {goal.is_group && (
              <div className="flex items-center space-x-2 text-gray-400">
                <Users className="h-5 w-5" />
                <span>{participants.length} participantes</span>
              </div>
            )}
            <Link 
              to={`/goals/${id}/deposit-numbers`} 
              className="p-2 hover:bg-gray-800/50 rounded-full text-gray-400 hover:text-primary transition-colors"
            >
              <QrCode className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-400">Valor da Meta</p>
            <p className="text-xl font-semibold text-white">
              {formatCurrency(goal.target_amount)}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Total Depositado</p>
            <p className="text-xl font-semibold text-primary">
              {formatCurrency(goal.total_deposits)}
            </p>
          </div>
        </div>

        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>Progresso</span>
          <span>{progressPercentage.toFixed(1)}%</span>
        </div>
      </div>

      {/* Números Disponíveis */}
      <NumberDrawer 
        hasPixKey={!!goal.pix_key || !!user.pix_key}
        maxNumber={goal.total_deposit_slots}
        completedNumbers={
          id && proofs[id] 
            ? proofs[id]
                .filter(proof => proof.verified)
                .map(proof => proof.deposit_number || 0)
                .filter(num => num > 0)
            : []
        }
        onDrawNumber={requestDepositNumbers}
        onUploadProof={uploadProof}
      />

      {/* Lista de Comprovantes */}
      <PaymentProofList 
        proofs={id && proofs[id] ? proofs[id] : []} 
        canVerify={isOwner} 
        onVerify={verifyProof} 
      />

      {/* Ranking do Grupo (se for meta em grupo) */}
      {goal.is_group && (
        <div className="bg-dark-card rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center space-x-3 mb-4">
            <Trophy className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-light">Ranking do Grupo</h2>
          </div>
          <GroupRanking 
            proofs={proofs} 
            participants={participants} 
            targetAmount={goal.target_amount} 
          />
        </div>
      )}

      {/* Modal de Convite (se for meta em grupo) */}
      {goal.is_group && isOwner && (
        <InviteModal goal={goal} />
      )}
    </div>
  );
};

export default GoalDetails;