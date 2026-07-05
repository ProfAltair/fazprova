import React from 'react';
import { User } from 'firebase/auth';
import { Sparkles, LogIn, LogOut, Shield, Award } from 'lucide-react';
import { loginWithGoogle, logout } from '../lib/firebase';

interface HeaderProps {
  user: User | null;
  onSelectTab: (tab: 'generate' | 'my-exams' | 'adapt') => void;
  activeTab: string;
}

export default function Header({ user, onSelectTab, activeTab }: HeaderProps) {
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('generate')}>
            <div className="bg-gradient-to-tr from-cyan-500 to-indigo-600 p-2 sm:p-2.5 rounded-xl shadow-lg shadow-indigo-500/10">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center">
                CONSTRUTOR DE PROVA <span className="ml-1.5 text-xs bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md border border-indigo-500/30">AI</span>
              </h1>
              <div className="flex items-center text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium">
                <Award className="h-3 w-3 text-cyan-400 mr-1" />
                <span>Desenvolvedor: </span>
                <span className="text-cyan-400 font-semibold ml-1">Prof. Altair de Jesus</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => onSelectTab('generate')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'generate'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700/50 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Nova Prova
            </button>
            <button
              onClick={() => onSelectTab('adapt')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'adapt'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700/50 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Adaptação & Recuperação
            </button>
            <button
              onClick={() => onSelectTab('my-exams')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'my-exams'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700/50 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Minhas Provas
            </button>
          </nav>

          {/* User Auth */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs sm:text-sm font-medium text-slate-200 truncate max-w-[120px] sm:max-w-[160px]">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center">
                    <Shield className="h-2.5 w-2.5 text-emerald-500 mr-0.5" /> Nuvem Segura
                  </span>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Avatar"}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-indigo-500/30"
                  />
                ) : (
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-indigo-500/30">
                    {user.displayName?.charAt(0) || "P"}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-slate-800/80 hover:bg-red-500/10 text-slate-300 hover:text-red-400 p-2 sm:p-2.5 rounded-xl border border-slate-700/50 transition-all duration-200"
                  title="Sair da conta"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35"
              >
                <LogIn className="h-4 w-4" />
                <span>Acessar Nuvem</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 bg-slate-900/90 py-2">
        <button
          onClick={() => onSelectTab('generate')}
          className={`flex flex-col items-center space-y-0.5 text-xs font-medium transition-all duration-200 ${
            activeTab === 'generate' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">📝</span>
          <span>Nova Prova</span>
        </button>
        <button
          onClick={() => onSelectTab('adapt')}
          className={`flex flex-col items-center space-y-0.5 text-xs font-medium transition-all duration-200 ${
            activeTab === 'adapt' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">🧩</span>
          <span>Adaptação</span>
        </button>
        <button
          onClick={() => onSelectTab('my-exams')}
          className={`flex flex-col items-center space-y-0.5 text-xs font-medium transition-all duration-200 ${
            activeTab === 'my-exams' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">📁</span>
          <span>Minhas Provas</span>
        </button>
      </div>
    </header>
  );
}
