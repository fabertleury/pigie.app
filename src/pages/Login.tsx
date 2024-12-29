import React, { useState } from 'react';
import { LoginForm } from '../components/LoginForm';
import { SignUpForm } from '../components/SignUpForm';
import { CircuitBoard, Sparkles, Code2, Terminal, Cpu, Wifi } from 'lucide-react';

const FloatingIcons = () => {
  const icons = [
    { Icon: Code2, delay: '0s', duration: '15s' },
    { Icon: Terminal, delay: '2s', duration: '20s' },
    { Icon: Cpu, delay: '4s', duration: '18s' },
    { Icon: Wifi, delay: '6s', duration: '16s' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map(({ Icon, delay, duration }, index) => (
        <div
          key={index}
          className="absolute text-primary/20"
          style={{
            animation: `float ${duration} infinite linear`,
            animationDelay: delay,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          <Icon className="w-8 h-8" />
        </div>
      ))}
    </div>
  );
};

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-[80vh] relative flex items-center justify-center overflow-hidden">
      {/* Background grid with glow effect */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-1">
          {Array.from({ length: 144 }).map((_, i) => (
            <div
              key={i}
              className="bg-primary/5 rounded-sm"
              style={{
                animation: `pulse 4s infinite`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating tech icons */}
      <FloatingIcons />

      {/* Main container */}
      <div className="relative w-full max-w-md mx-4">
        {/* Glowing border effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-xl blur-lg opacity-30 animate-border-glow" />

        <div className="relative bg-dark-card/90 backdrop-blur-xl p-8 rounded-lg border border-gray-800/50 shadow-2xl">
          {/* Decorative header */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 rounded-full blur-lg animate-pulse" />
              <CircuitBoard className="relative w-12 h-12 text-primary animate-float" />
              <Sparkles className="absolute -right-4 -top-2 w-4 h-4 text-yellow-500 animate-bounce" />
            </div>
          </div>

          <div className="pt-4 relative">
            <h2 className="text-center text-3xl font-light text-white mb-2 animate-fade-in">
              {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h2>
            <p className="text-center text-gray-400 text-sm mb-8 animate-fade-in-delay">
              {isLogin ? 'Continue sua jornada financeira' : 'Comece sua jornada financeira'}
            </p>

            <div className="space-y-6">
              {isLogin ? <LoginForm /> : <SignUpForm />}
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-dark-card text-gray-400">ou</span>
                </div>
              </div>

              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full text-center text-sm text-primary hover:text-primary-dark transition-all hover:scale-105"
              >
                {isLogin ? 'Criar uma nova conta' : 'Já tenho uma conta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;