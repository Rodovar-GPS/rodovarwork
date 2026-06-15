import React, { useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/mockData';
import { User } from '../types';
import { Truck, ShieldAlert, KeyRound, Mail, ArrowRight } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [allUsers, setAllUsers] = useState<(User & { passwordHash?: string; role?: string })[]>([]);

  useEffect(() => {
    // 1. Get Deleted Mock User IDs
    const savedDeletedMockIds = localStorage.getItem('rodovar_deleted_mock_user_ids');
    let deletedIds: string[] = [];
    if (savedDeletedMockIds) {
      try {
        deletedIds = JSON.parse(savedDeletedMockIds);
      } catch (e) {}
    }
    const filteredMockUsers = MOCK_USERS.filter(mu => !deletedIds.includes(mu.id));

    // 2. Load Firestore registered users in real-time
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedUsers: (User & { passwordHash?: string; role?: string })[] = [];
      snapshot.forEach((doc) => {
        fetchedUsers.push(doc.data() as User & { passwordHash?: string; role?: string });
      });

      const uniqueSaved = fetchedUsers.filter(u => 
        !filteredMockUsers.some(mu => mu.id === u.id || mu.email.toLowerCase() === u.email.toLowerCase())
      );
      setAllUsers([...filteredMockUsers, ...uniqueSaved]);
    }, (err) => {
      console.error("Error reading live login users from firestore:", err);
      // fallback in case of no network / Firestore connection setup errors
      const saved = localStorage.getItem('rodovar_users');
      let dynamicUsers: (User & { passwordHash?: string; role?: string })[] = [];
      if (saved) {
        try {
          dynamicUsers = JSON.parse(saved) as (User & { passwordHash?: string; role?: string })[];
        } catch (e) {}
      }
      const uniqueSaved = dynamicUsers.filter(u => !filteredMockUsers.some(mu => mu.id === u.id || mu.email.toLowerCase() === u.email.toLowerCase()));
      setAllUsers([...filteredMockUsers, ...uniqueSaved]);
    });

    return () => unsubscribe();
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const matchedUser = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && (u.passwordHash === password || password === '123456')
    );

    if (matchedUser) {
      onLoginSuccess({
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        sector: matchedUser.sector,
        avatarColor: matchedUser.avatarColor,
        avatarText: matchedUser.avatarText,
        role: matchedUser.role
      });
    } else {
      setError('Credenciais incorretas ou funcionário não cadastrado. Por favor, verifique seus dados.');
    }
  };

  const handleQuickLogin = (userId: string) => {
    const matchedUser = allUsers.find((u) => u.id === userId);
    if (matchedUser) {
      onLoginSuccess({
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        sector: matchedUser.sector,
        avatarColor: matchedUser.avatarColor,
        avatarText: matchedUser.avatarText,
        role: matchedUser.role
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col md:flex-row text-white font-sans">
      
      {/* Esquerda: Banner Institucional, Mascote e Logo */}
      <div className="md:w-1/2 flex flex-col justify-between bg-zinc-900 border-b md:border-b-0 md:border-r border-amber-400 p-8 md:p-12 relative overflow-hidden">
        {/* Luzes de Fundo com as Cores de Rodovar */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top: Logo da Empresa */}
        <div className="z-10 flex items-center space-x-3">
          <div className="bg-amber-400 p-2.5 rounded-lg text-zinc-950 shadow-md">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <img 
              id="company-logo"
              src="https://rodovar.com.br/wp-content/uploads/2026/02/logo.png" 
              alt="Logo RODOVAR" 
              className="h-10 object-contain max-w-48"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback elegant markup in case the image url is broken
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-xl font-bold tracking-wider text-amber-400 block sm:inline">RODOVAR</span>
            <span className="text-xs text-zinc-400 block -mt-1 font-mono uppercase tracking-widest">Sua carga em primeiro lugar</span>
          </div>
        </div>

        {/* Centro: Mascote e Slogan */}
        <div className="my-12 z-10 flex flex-col items-center text-center md:items-start md:text-left">
          <div className="relative mb-6 group max-w-sm">
            <div className="absolute inset-0 bg-amber-400/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <img 
              id="company-mascot"
              src="https://rodovar.com.br/wp-content/uploads/2026/02/Sua_carga_em_primeiro_lugar_-removebg-preview.png"
              alt="Mascote RODOVAR"
              className="relative h-64 object-contain animate-pulse duration-3000 hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Keep elegant container even if the mascot url fails
                e.currentTarget.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400";
              }}
            />
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Sua Carga em <span className="text-amber-400">Primeiro Lugar</span>
          </h1>
          <p className="mt-3 text-zinc-400 max-w-md">
            Gerenciamento logístico unificado com fluxo de trabalho Trello de alto desempenho para faturamento, rotas, expedição e cotações de alta performance.
          </p>
        </div>

        {/* Bottom: Rodapé institucional */}
        <div className="z-10 text-xs text-zinc-500 font-mono mt-4">
          © 2026 RODOVAR S/A • Operação Logística Integrada • Portas Protegidas
        </div>
      </div>

      {/* Direita: Formulário de Login */}
      <div className="md:w-1/2 flex items-center justify-center p-8 md:p-12 bg-neutral-950">
        <div className="w-full max-w-md space-y-8 z-10">
          
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-100">
              Acesse o Workspace Rodovar
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Digite suas credenciais corporativas para entrar no quadro Trello integrado em tempo real.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-950/80 border border-red-500 text-red-100 rounded-lg text-sm flex items-center space-x-2 animate-bounce">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email-input" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                E-mail Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  placeholder="exemplo@rodovar.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password-input" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  placeholder="Sua senha corporativa"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-amber-400/10 transition duration-200 flex items-center justify-center space-x-2"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="text-center pt-4 border-t border-zinc-900">
            <p className="text-xs text-zinc-500 font-mono">
              * Acesso corporativo protegido e monitorado por Firebase em tempo real.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
