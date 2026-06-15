import React, { useState, useEffect } from 'react';
import { User, BoardColumn, TaskCard, Sector } from './types';
import { MOCK_USERS, DEFAULT_COLUMNS, INITIAL_CARDS } from './data/mockData';
import Login from './components/Login';
import Board from './components/Board';
import CardModal from './components/CardModal';
import { 
  Truck, LogOut, RefreshCw, BarChart3, UserCheck, 
  HelpCircle, Sparkles, Building2, Layers
} from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [cards, setCards] = useState<TaskCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<TaskCard | null>(null);
  
  // Dynamic staff list state
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [deletedMockUserIds, setDeletedMockUserIds] = useState<string[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Active mock users filtering
  const activeMockUsers = MOCK_USERS.filter(u => !deletedMockUserIds.includes(u.id));

  // Registration Form fields state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('123456');
  const [newUserSector, setNewUserSector] = useState<Sector>('Comercial');
  const [newUserRole, setNewUserRole] = useState('Gestor Comercial');

  // Dashboard toggle and status information
  const [showHelpBanner, setShowHelpBanner] = useState(true);

  // Load state from localStorage on init and establish Firestore real-time listeners
  useEffect(() => {
    const savedDeletedMockIds = localStorage.getItem('rodovar_deleted_mock_user_ids');
    if (savedDeletedMockIds) {
      try {
        setDeletedMockUserIds(JSON.parse(savedDeletedMockIds));
      } catch (e) {}
    }

    const savedUser = localStorage.getItem('rodovar_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (
          parsed.name?.toLowerCase().includes('paulo') || 
          parsed.name?.toLowerCase().includes('pinheiro') ||
          parsed.email?.toLowerCase().includes('paulo') ||
          parsed.sector === 'Financeiro'
        ) {
          localStorage.removeItem('rodovar_user');
          setCurrentUser(null);
        } else {
          setCurrentUser(parsed);
        }
      } catch (e) {
        // Safe fallback
      }
    }

    const savedColumns = localStorage.getItem('rodovar_columns');
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns));
      } catch (e) {
        setColumns(DEFAULT_COLUMNS);
      }
    } else {
      setColumns(DEFAULT_COLUMNS);
    }

    // A: Real-time Listener for cards in Google Cloud Firestore (seeding if empty)
    const unsubscribeCards = onSnapshot(collection(db, 'cards'), (snapshot) => {
      const fetchedCards: TaskCard[] = [];
      snapshot.forEach((docSnap) => {
        fetchedCards.push(docSnap.data() as TaskCard);
      });

      if (fetchedCards.length === 0) {
        // First boot seeding
        INITIAL_CARDS.forEach(async (card) => {
          try {
            await setDoc(doc(db, 'cards', card.id), card);
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `cards/${card.id}`);
          }
        });
        setCards(INITIAL_CARDS);
        localStorage.setItem('rodovar_cards', JSON.stringify(INITIAL_CARDS));
      } else {
        const filtered = fetchedCards
          .filter(c => 
            !c.driverName?.toLowerCase().includes('paulo') &&
            !c.driverName?.toLowerCase().includes('pinheiro') &&
            !c.title?.toLowerCase().includes('paulo') &&
            !c.title?.toLowerCase().includes('pinheiro') &&
            !c.description?.toLowerCase().includes('paulo') &&
            !c.description?.toLowerCase().includes('pinheiro')
          )
          .map(c => ({
            ...c,
            sector: (c.sector as any) === 'Financeiro' ? 'Comercial' as Sector : c.sector,
            comments: c.comments?.map(cmt => ({
              ...cmt,
              userSector: (cmt.userSector as any) === 'Financeiro' ? 'Comercial' as Sector : cmt.userSector
            })) || [],
            activity: c.activity?.map(act => ({
              ...act,
              userSector: (act.userSector as any) === 'Financeiro' ? 'Comercial' as Sector : act.userSector
            })) || []
          }));
        setCards(filtered);
        localStorage.setItem('rodovar_cards', JSON.stringify(filtered));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'cards');
    });

    // B: Real-time Listener for registered users in Firestore
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedUsers: any[] = [];
      snapshot.forEach((docSnap) => {
        fetchedUsers.push(docSnap.data());
      });

      const filtered = fetchedUsers
        .filter(u => 
          !u.name?.toLowerCase().includes('paulo') &&
          !u.name?.toLowerCase().includes('pinheiro') &&
          !u.email?.toLowerCase().includes('paulo')
        )
        .map(u => ({
          ...u,
          sector: u.sector === 'Financeiro' ? 'Comercial' : u.sector
        }));
      setRegisteredUsers(filtered);
      localStorage.setItem('rodovar_users', JSON.stringify(filtered));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => {
      unsubscribeCards();
      unsubscribeUsers();
    };
  }, []);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('rodovar_user', JSON.stringify(user));
    
    // Add login system audit activity on first load to cards in Firestore
    const logId = 'log-login-' + Date.now();
    const updatedCards = cards.map(c => {
      return {
        ...c,
        activity: [
          {
            id: logId,
            action: `conectou-se ao sistema de rastreamento de cargas`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            userName: user.name,
            userSector: user.sector
          },
          ...c.activity
        ]
      };
    });

    // Write updated activities back to Firestore
    updatedCards.forEach(async (c) => {
      try {
        await setDoc(doc(db, 'cards', c.id), c);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `cards/${c.id}`);
      }
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rodovar_user');
  };

  const handleUpdateCards = async (newCards: TaskCard[]) => {
    // Single / multi document check for efficient write proxying
    newCards.forEach(async (newCard) => {
      const oldCard = cards.find(c => c.id === newCard.id);
      if (!oldCard || JSON.stringify(oldCard) !== JSON.stringify(newCard)) {
        try {
          await setDoc(doc(db, 'cards', newCard.id), newCard);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `cards/${newCard.id}`);
        }
      }
    });

    // Set preview in modal if active
    if (selectedCard) {
      const updatedSelected = newCards.find(c => c.id === selectedCard.id);
      if (updatedSelected) {
        setSelectedCard(updatedSelected);
      }
    }
  };

  const handleUpdateColumns = (newCols: BoardColumn[]) => {
    setColumns(newCols);
    localStorage.setItem('rodovar_columns', JSON.stringify(newCols));
  };

  const handleCardSave = async (updatedCard: TaskCard) => {
    try {
      await setDoc(doc(db, 'cards', updatedCard.id), updatedCard);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `cards/${updatedCard.id}`);
    }
  };

  const handleCardDelete = async (cardId: string) => {
    try {
      await deleteDoc(doc(db, 'cards', cardId));
      setSelectedCard(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `cards/${cardId}`);
    }
  };

  // Register a new employee by master admin
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    // Email duplication check
    const allUsers = [...activeMockUsers, ...registeredUsers];
    if (allUsers.some(u => u.email.toLowerCase() === newUserEmail.trim().toLowerCase())) {
      alert('Este e-mail já está sendo utilizado por outro funcionário.');
      return;
    }

    // Build initials for avatar
    const initials = newUserName.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    // Choose dynamic color
    const bgColors = [
      'bg-amber-400 text-zinc-950 font-semibold',
      'bg-amber-500 text-zinc-950 font-semibold',
      'bg-stone-800 text-amber-400 border border-amber-400',
      'bg-rose-500 text-white',
      'bg-indigo-600 text-white',
      'bg-emerald-600 text-white'
    ];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];

    const newUser = {
      id: 'usr-custom-' + Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      sector: newUserSector,
      avatarColor: randomBg,
      avatarText: initials || 'RD',
      passwordHash: newUserPassword || '123456',
      role: newUserRole.trim() || 'Colaborador'
    };

    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
      // Reset fields
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('123456');
      alert(`Funcionário ${newUser.name} cadastrado com sucesso no perfil ${newUser.sector}!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${newUser.id}`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Deseja realmente excluir este funcionário e seu perfil do sistema?')) {
      if (id.startsWith('usr-custom-')) {
        try {
          await deleteDoc(doc(db, 'users', id));
          alert('Funcionário excluído do cadastro da empresa com sucesso.');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${id}`);
        }
      } else {
        const updatedDeletedIds = [...deletedMockUserIds, id];
        setDeletedMockUserIds(updatedDeletedIds);
        localStorage.setItem('rodovar_deleted_mock_user_ids', JSON.stringify(updatedDeletedIds));
        
        // If the logged in user deleted their own account (though they are master), log out
        if (currentUser && currentUser.id === id) {
          handleLogout();
        }
        alert('Funcionário excluído do cadastro da empresa com sucesso.');
      }
    }
  };

  // Switch demo account instantly inside system
  const handleSectorQuickSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetUserId = e.target.value;
    const allAvailableUsers = [...activeMockUsers, ...registeredUsers];
    const matched = allAvailableUsers.find(u => u.id === targetUserId);
    if (matched) {
      const user = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        sector: matched.sector,
        avatarColor: matched.avatarColor,
        avatarText: matched.avatarText
      };
      setCurrentUser(user);
      localStorage.setItem('rodovar_user', JSON.stringify(user));
    }
  };

  // Reset workspace state back to fresh mock template
  const handleResetWorkspace = async () => {
    if (confirm('Deseja resetar todas as cargas modificadas para o modelo padrão da Rodovar?')) {
      try {
        // Clear all cards in Firestore
        const snapshot = await getDocs(collection(db, 'cards'));
        snapshot.forEach(async (docSnap) => {
          await deleteDoc(doc(db, 'cards', docSnap.id));
        });

        // Insert fresh standard cards
        INITIAL_CARDS.forEach(async (card) => {
          await setDoc(doc(db, 'cards', card.id), card);
        });

        setColumns(DEFAULT_COLUMNS);
        localStorage.setItem('rodovar_columns', JSON.stringify(DEFAULT_COLUMNS));
        alert('Quadro de cargas redefinido com sucesso!');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'cards');
      }
    }
  };


  // Render Login page if not authenticated
  if (!currentUser) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white font-sans flex flex-col selection:bg-amber-400 selection:text-zinc-950">
      
      {/* HEADER PRINCIPAL: Cores Amarelo, Branco e Preto */}
      <header className="bg-zinc-900 border-b border-amber-400 p-4 sticky top-0 z-30 shadow-md">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 px-2 sm:px-4">
          
          {/* Logo e Slogan Rodovar */}
          <div className="flex items-center space-x-3">
            <div className="bg-amber-400 p-2 rounded-lg text-zinc-950 flex items-center justify-center">
              <Truck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <img 
                  id="header-logo"
                  src="https://rodovar.com.br/wp-content/uploads/2026/02/logo.png" 
                  alt="Logo RODOVAR" 
                  className="h-8 object-contain max-w-40"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fail gracefully
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-lg font-black tracking-wider text-amber-400 font-mono">RODOVAR</span>
              </div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest leading-none font-semibold">
                Sua carga em primeiro lugar
              </div>
            </div>
          </div>

          {/* User Profile Box & Logout Actions */}
          <div className="flex items-center space-x-4">
            
            {/* User Badge */}
            <div className="flex items-center space-x-2 text-right">
              <div>
                <div className="text-xs font-bold text-zinc-100 flex items-center justify-end gap-1">
                  <span>{currentUser.name}</span>
                  <span className="px-1.5 py-0.5 text-[9px] bg-zinc-800 text-amber-400 border border-zinc-700 rounded font-mono uppercase font-bold">
                    {currentUser.sector}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono tracking-wider">{currentUser.email}</div>
              </div>
              <div className={`w-8 h-8 rounded-full ${currentUser.avatarColor} font-extrabold flex items-center justify-center text-xs shadow`}>
                {currentUser.avatarText}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center space-x-2 border-l border-zinc-800 pl-3">
              <button
                id="reset-state-header-btn"
                onClick={handleResetWorkspace}
                title="Redefinir cargas padrão da Rodovar"
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {(currentUser?.id === 'usr-master' || currentUser?.email === 'master@rodovar.com.br') && (
                <button
                  id="toggle-admin-header-btn"
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  title="Gestão de Funcionários e Perfis"
                  className={`p-2 rounded-lg transition ${showAdminPanel ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-400 sm:text-zinc-400" />
                </button>
              )}

              <button
                id="logout-header-btn"
                onClick={handleLogout}
                title="Sair do workspace"
                className="p-2 hover:bg-red-950 hover:text-red-400 rounded-lg text-zinc-400 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* BANNER DE INSTRUÇÕES DE DEMO */}
      {showHelpBanner && (
        <div className="bg-amber-400 text-zinc-950 px-4 py-2 text-xs flex justify-between items-center font-semibold">
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 sm:px-4">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-zinc-900 animate-spin" />
              <span>
                <strong>Workspace RODOVAR!</strong> Você está conectado no setor <strong className="underline">{currentUser.sector}</strong>. Cargas, logs de auditoria e faturamento são atualizados e sincronizados automaticamente.
              </span>
            </span>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-zinc-900 text-amber-400 rounded text-[10px] font-mono">2026-06-13 UTC</span>
              <button 
                id="close-help-banner-btn"
                onClick={() => setShowHelpBanner(false)}
                className="underline hover:text-zinc-800 font-bold ml-2 shrink-0"
              >
                Entendi, fechar ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL: Trello Board e Widgets */}
      <main className="flex-1 w-full max-w-none p-4 lg:p-6 space-y-6">
        
        {/* PAINEL ADMINISTRATIVO MASTER: Gestão de Funcionários e Perfis */}
        {showAdminPanel && (currentUser?.id === 'usr-master' || currentUser?.email === 'master@rodovar.com.br') && (
          <div className="bg-zinc-900 border-2 border-amber-400 p-6 rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-400 p-2 rounded-lg text-zinc-950 font-black">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase text-amber-400 font-mono tracking-wider">
                    Painel de Administração RODOVAR
                  </h3>
                  <p className="text-xs text-zinc-400">Cadastre novos funcionários, configure perfis de acesso personalizados e audite colaboradores em tempo real.</p>
                </div>
              </div>
              <button 
                id="close-admin-panel"
                onClick={() => setShowAdminPanel(false)}
                className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded-lg text-zinc-400 transition"
              >
                Esconder Painel ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Formulário de Cadastro (Left Column) */}
              <form onSubmit={handleAddUser} className="lg:col-span-5 space-y-4 bg-zinc-950/50 p-5 rounded-xl border border-zinc-800">
                <h4 className="text-xs font-bold text-neutral-100 uppercase font-mono tracking-wide mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  <span>Registrar Novo Funcionário</span>
                </h4>

                <div>
                  <label htmlFor="reg-name" className="block text-[11px] text-zinc-400 mb-1">Nome Completo</label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Ex: Mariane Silva"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-[11px] text-zinc-400 mb-1">E-mail de Trabalho</label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Ex: mariane@rodovar.com.br"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-sector" className="block text-[11px] text-zinc-400 mb-1">Setor</label>
                    <select
                      id="reg-sector"
                      value={newUserSector}
                      onChange={(e) => setNewUserSector(e.target.value as Sector)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Comercial">Comercial</option>
                      <option value="Expedição">Expedição</option>
                      <option value="Geral">Geral (Tudo)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="reg-pass" className="block text-[11px] text-zinc-400 mb-1">Senha Provisória</label>
                    <input
                      id="reg-pass"
                      type="text"
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Padrão: 123456"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-role" className="block text-[11px] text-zinc-400 mb-1">Perfil do Cargo (Ocupação)</label>
                  <input
                    id="reg-role"
                    type="text"
                    required
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    placeholder="Ex: Assistente de Faturamento, Comercial Sênior"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  id="btn-register-user-submit"
                  type="submit"
                  className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-extrabold uppercase rounded text-[11px] font-mono tracking-wider transition-colors shadow-md cursor-pointer"
                >
                  Confirmar Cadastro RODOVAR
                </button>
              </form>

              {/* Lista de Registrados (Right Column) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-100 uppercase font-mono tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    <span>Lista de Funcionários Ativos ({registeredUsers.length + activeMockUsers.length})</span>
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-mono">Simulador / LocalStorage</span>
                </div>

                <div className="bg-zinc-950/30 rounded-xl border border-zinc-850 p-2 max-h-[345px] overflow-y-auto space-y-2 divider-zinc">
                  {/* Mock accounts list (ReadOnly placeholders) */}
                  <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-600 px-3 pt-2 font-bold select-none">
                    Contas Padrão do Sistema:
                  </div>
                  {activeMockUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-lg border border-zinc-900 hover:border-amber-400/20 transition-colors">
                      <div className="flex items-center space-x-3 w-4/5">
                        <div className={`w-8 h-8 rounded-full ${user.avatarColor} font-black text-xs flex items-center justify-center shrink-0`}>
                          {user.avatarText}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-zinc-200 truncate">{user.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono font-semibold flex items-center gap-1 truncate">
                            <span>{user.role}</span>
                            <span>•</span>
                            <span className="text-zinc-400">{user.sector}</span>
                          </div>
                        </div>
                      </div>
                      {user.id === 'usr-master' ? (
                        <span className="px-2 py-0.5 text-[9px] bg-zinc-800 text-zinc-400 rounded font-mono uppercase font-bold text-right shrink-0">
                          Protegido
                        </span>
                      ) : (
                        <button
                          id={`delete-user-${user.id}`}
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 hover:bg-red-950 text-zinc-500 hover:text-red-400 rounded transition shrink-0"
                          title="Excluir funcionário (Cadastro padrão)"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Registered Custom employees list */}
                  <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-600 px-3 pt-3 font-bold select-none">
                    Funcionários Registrados de Forma Dinâmica:
                  </div>
                  {registeredUsers.length === 0 ? (
                    <div className="text-center p-6 text-xs text-zinc-650 italic">
                      Nenhum funcionário cadastrado sob demanda ainda. Use o formulário à esquerda.
                    </div>
                  ) : (
                    registeredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 hover:border-amber-400/30 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full ${user.avatarColor} font-black text-xs flex items-center justify-center shrink-0 shadow`}>
                            {user.avatarText}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              <span className="px-1 py-0.1 select-none text-[8px] bg-amber-400/10 text-amber-400 rounded tracking-widest font-mono uppercase">Novo</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                              <span>{user.role}</span>
                              <span>•</span>
                              <span className="text-amber-400">{user.sector}</span>
                              <span>•</span>
                              <span className="text-zinc-500 font-semibold">{user.email}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          id={`delete-user-${user.id}`}
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 hover:bg-red-950 text-zinc-500 hover:text-red-400 rounded transition shrink-0"
                          title="Excluir funcionário"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}

                </div>
              </div>

            </div>
          </div>
        )}

        {/* Quadro Trello Central */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl relative">
          
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-mono font-black uppercase text-white tracking-wide">
                Quadro Integrado de Controle de Cargas
              </h2>
            </div>
            <div className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
              <span>Sincronização Ativa</span>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            </div>
          </div>

          <Board 
            columns={columns}
            cards={cards}
            currentUser={currentUser}
            onUpdateCards={handleUpdateCards}
            onUpdateColumns={handleUpdateColumns}
            onOpenCardDetails={setSelectedCard}
          />
        </div>

      </main>

      {/* RODAPÉ BRANCO/AMARELO/PRETO */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-6 px-4 text-zinc-500 text-center text-xs mt-12 font-mono">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 px-2 sm:px-4">
          <div className="flex items-center space-x-2">
            <img 
              id="footer-logo-pic"
              src="https://rodovar.com.br/wp-content/uploads/2026/02/logo.png" 
              alt="Logo Rodovar" 
              className="h-5 opacity-40 grayscale"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span>RODOVAR Logística Inteligente S/A © 2026</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-zinc-650 hover:text-amber-400 transition cursor-help">Termos de Uso</span>
          </div>
        </div>
      </footer>

      {/* MODAL TRELLO DE DETALHES DE CARGA */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onSave={handleCardSave}
          onDelete={handleCardDelete}
          currentUser={currentUser}
        />
      )}

    </div>
  );
}
