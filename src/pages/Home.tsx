import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { PiggyBank } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="text-center py-16 space-y-8">
      <PiggyBank className="h-12 w-12 text-primary mx-auto" />
      <div className="space-y-2">
        <h1 className="text-3xl font-light text-white">
          Metas de Economia
        </h1>
        <p className="text-gray-400">
          Alcance seus objetivos financeiros
        </p>
      </div>
      {!user ? (
        <Link
          to="/login"
          className="inline-block bg-primary/10 hover:bg-primary/20 text-primary px-6 py-2 rounded-md transition-colors"
        >
          Começar
        </Link>
      ) : (
        <Link
          to="/goals"
          className="inline-block bg-primary/10 hover:bg-primary/20 text-primary px-6 py-2 rounded-md transition-colors"
        >
          Metas
        </Link>
      )}
    </div>
  );
};

export default Home;