import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Home, Target, User } from 'lucide-react';
import { InvitationNotification } from './InvitationNotification';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuthStore();

  return (
    <div className="min-h-screen bg-dark text-gray-100">
      <nav className="bg-dark border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between h-14">
            <div className="flex space-x-4">
              <Link to="/" className="flex items-center text-gray-400 hover:text-primary">
                <Home className="h-4 w-4" />
              </Link>
              <Link to="/goals" className="flex items-center text-gray-400 hover:text-primary">
                <Target className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex space-x-4 items-center">
              {user ? (
                <>
                  <InvitationNotification />
                  <Link to="/profile" className="flex items-center text-gray-400 hover:text-primary">
                    <User className="h-4 w-4" />
                  </Link>
                  <button onClick={() => signOut()} className="text-gray-400 hover:text-primary">
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-gray-400 hover:text-primary">
                  Entrar
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}