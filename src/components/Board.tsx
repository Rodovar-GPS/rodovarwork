import React, { useState } from 'react';
import { BoardColumn, TaskCard, User, Sector } from '../types';
import { 
  Plus, Search, Filter, ShieldAlert, ArrowLeftRight, 
  MapPin, UserCheck, CreditCard, ChevronRight, ChevronLeft, 
  Settings2, Activity, Calendar, Tag
} from 'lucide-react';

interface BoardProps {
  columns: BoardColumn[];
  cards: TaskCard[];
  currentUser: User;
  onUpdateCards: (newCards: TaskCard[]) => void;
  onUpdateColumns: (newCols: BoardColumn[]) => void;
  onOpenCardDetails: (card: TaskCard) => void;
}

export default function Board({ 
  columns, 
  cards, 
  currentUser, 
  onUpdateCards, 
  onUpdateColumns, 
  onOpenCardDetails 
}: BoardProps) {
  
  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<Sector | 'Qualquer'>('Qualquer');
  
  // Inline card creation state
  const [addingToColumnId, setAddingToColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardCode, setNewCardCode] = useState('');
  const [newCardPriority, setNewCardPriority] = useState<'Baixa' | 'Média' | 'Alta'>('Média');

  // New column creation state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  // Handle addition of new card
  const handleCreateCardSubmit = (e: React.FormEvent, colId: string) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    // Use typed custom RDV code or format nicely
    let cardCode = newCardCode.trim().toUpperCase();
    if (!cardCode || cardCode === 'RDV-') {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const sectorPrefix = currentUser.sector === 'Comercial' ? 'C' : 
                           currentUser.sector === 'Expedição' ? 'E' : 'G';
      cardCode = `RDV-${sectorPrefix}${randomSuffix}`;
    }

    const newCard: TaskCard = {
      id: 'card-' + Date.now(),
      code: cardCode,
      title: newCardTitle.trim(),
      description: 'Carga cadastrada recentemente pelo funcionário. Clique nela para abrir e complementar todas as informações do Rodovar Monitora.',
      columnId: colId,
      sector: currentUser.sector === 'Geral' ? 'Comercial' : currentUser.sector,
      priority: newCardPriority,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 4 days from now
      value: 0,
      freteEmpresa: 0,
      freteMotorista: 0,
      checklist: [],
      comments: [],
      activity: [
        {
          id: 'log-' + Date.now(),
          action: `criou esta mercadoria de código RDV ${cardCode} no quadro`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          userName: currentUser.name,
          userSector: currentUser.sector
        }
      ]
    };

    onUpdateCards([newCard, ...cards]);
    setNewCardTitle('');
    setNewCardCode('');
    setAddingToColumnId(null);
  };

  // Move cargo to different column
  const moveCard = (cardId: string, direction: 'forward' | 'backward') => {
    const cardToMove = cards.find(c => c.id === cardId);
    if (!cardToMove) return;

    const currentColIndex = columns.findIndex(col => col.id === cardToMove.columnId);
    let targetColIndex = direction === 'forward' ? currentColIndex + 1 : currentColIndex - 1;

    if (targetColIndex >= 0 && targetColIndex < columns.length) {
      const targetCol = columns[targetColIndex];
      const updatedCards = cards.map(c => {
        if (c.id === cardId) {
          // Log movement
          const logId = 'log-' + Date.now();
          const newLog = {
            id: logId,
            action: `moveu a carga de "${columns[currentColIndex].title}" para "${targetCol.title}"`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            userName: currentUser.name,
            userSector: currentUser.sector
          };
          return {
            ...c,
            columnId: targetCol.id,
            activity: [newLog, ...c.activity]
          };
        }
        return c;
      });
      onUpdateCards(updatedCards);
    }
  };

  // Create customized column
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;

    const newCol: BoardColumn = {
      id: 'col-' + Date.now(),
      title: newColumnName.trim(),
      accentColor: 'border-l-4 border-amber-400'
    };

    onUpdateColumns([...columns, newCol]);
    setNewColumnName('');
    setIsAddingColumn(false);
  };

  // Filter cards list based on query
  const filteredCards = cards.filter(card => {
    // Sector separation
    const matchesSector = selectedSectorFilter === 'Qualquer' || card.sector === selectedSectorFilter;
    
    // Text search matching titles, codes, motoristas, origin or destination
    const checkString = (str?: string) => str?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = !searchTerm || 
      checkString(card.title) || 
      checkString(card.code) || 
      checkString(card.driverName) || 
      checkString(card.driverPlate) || 
      checkString(card.origin) || 
      checkString(card.destination) ||
      checkString(card.priority) || 
      checkString(card.sector);

    return matchesSector && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Barra de Filtros e Busca de Cargas */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Direita: Busca Texto */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4 text-amber-400" />
          </div>
          <input
            id="board-search-input"
            type="text"
            placeholder="Pesquise por Código, Motorista, Placa, Placas, rota ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
          />
        </div>

        {/* Esquerda: Filtros por Setor */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs text-zinc-400 flex items-center space-x-1 font-mono font-bold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Filtro Setor:</span>
          </div>

          <button
            id="filter-all-btn"
            onClick={() => setSelectedSectorFilter('Qualquer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              selectedSectorFilter === 'Qualquer'
                ? 'bg-amber-400 text-zinc-950 shadow'
                : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            📋 Todos ({cards.length})
          </button>

          <button
            id="filter-comercial-btn"
            onClick={() => setSelectedSectorFilter('Comercial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              selectedSectorFilter === 'Comercial'
                ? 'bg-amber-400 text-zinc-pres950 font-bold text-zinc-950 shadow'
                : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-amber-400/40'
            }`}
          >
            💼 Comercial ({cards.filter(c => c.sector === 'Comercial').length})
          </button>

          <button
            id="filter-expedicao-btn"
            onClick={() => setSelectedSectorFilter('Expedição')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              selectedSectorFilter === 'Expedição'
                ? 'bg-amber-400 text-zinc-950 font-bold shadow'
                : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-amber-400/40'
            }`}
          >
            🚛 Expedição ({cards.filter(c => c.sector === 'Expedição').length})
          </button>
        </div>

      </div>

      {/* QUADRO TRELLO: Layout Horizontal scrollável */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start select-none">
        
        {columns.map((column) => {
          const colCards = filteredCards.filter(card => card.columnId === column.id);

          return (
            <div 
              key={column.id} 
              id={`column-${column.id}`}
              className="bg-zinc-900 border border-zinc-800/80 rounded-2xl w-110 sm:w-[410px] shrink-0 shadow-lg flex flex-col max-h-[85vh]"
            >
              
              {/* Header de Coluna */}
              <div className={`p-4 bg-zinc-950/80 rounded-t-2xl border-b border-zinc-800 flex items-center justify-between ${column.accentColor}`}>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-extrabold text-neutral-100 font-mono tracking-tight uppercase">
                    {column.title}
                  </h3>
                  <span className="text-[10px] font-bold font-mono bg-zinc-800/90 text-amber-400 px-2 py-0.5 rounded-full">
                    {colCards.length}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  RDV
                </div>
              </div>

              {/* Lista Scrollável de Cargas */}
              <div className="p-3 overflow-y-auto space-y-3 min-h-[50px] scrollbar-thin">
                {colCards.map((card, cardIndex) => {
                  const completedCount = card.checklist.filter(i => i.completed).length;
                  const totalChecklist = card.checklist.length;

                  return (
                    <div
                      key={card.id}
                      id={`card-item-${card.id}`}
                      onClick={() => onOpenCardDetails(card)}
                      className="p-3.5 bg-zinc-950 border border-zinc-800 hover:border-amber-450 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-150 relative group select-none text-left"
                    >
                      {/* Borda Esquerda de Destaque por Setor */}
                      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${
                        card.sector === 'Comercial' ? 'bg-amber-400' :
                        card.sector === 'Expedição' ? 'bg-sky-400' : 'bg-zinc-500'
                      }`}></div>

                      {/* Header de Carga: Codigo, Priority */}
                      <div className="flex items-center justify-between mb-2 pl-1.5">
                        <span className="text-[10px] uppercase font-mono font-bold text-amber-400">
                          {card.code}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full uppercase leading-none ${
                            card.priority === 'Alta' ? 'bg-red-950 text-red-400 border border-red-900/40' :
                            card.priority === 'Média' ? 'bg-zinc-900 text-amber-400 border border-zinc-800' :
                            'bg-zinc-900 text-zinc-400 border border-zinc-800'
                          }`}>
                            {card.priority}
                          </span>
                        </div>
                      </div>

                      {/* Título */}
                      <h4 className="text-xs font-bold text-zinc-100 hover:text-amber-400 transition-colors pl-1.5 line-clamp-2 leading-snug">
                        {card.title}
                      </h4>

                      {/* Origem e Destino do Frete */}
                      {(card.origin || card.destination) && (
                        <div className="mt-2.5 bg-zinc-900/60 p-2 rounded-lg text-[10px] text-zinc-400 flex flex-col gap-1.5 pl-2">
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                            <span className="truncate">De: <strong>{card.origin || 'Não informado'}</strong></span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">Para: <strong>{card.destination || 'Não informado'}</strong></span>
                          </div>
                        </div>
                      )}

                      {/* Info Motorista */}
                      {card.driverName && (
                        <div className="mt-2 text-[10px] text-zinc-400 flex items-center gap-1 bg-zinc-900/40 p-1.5 pl-2 rounded-lg">
                          <UserCheck className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">Motorista: <strong className="text-zinc-200">{card.driverName}</strong></span>
                        </div>
                      )}

                      {/* Footer: Valor do Frete, Comentários, Checklist Info */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-900 flex items-center justify-between text-[11px] font-mono text-zinc-500 pl-1">
                        <div className="flex items-center space-x-2">
                          {totalChecklist > 0 && (
                            <span className={`flex items-center space-x-1 text-[10px] ${completedCount === totalChecklist ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                              <span>☑</span>
                              <span>{completedCount}/{totalChecklist}</span>
                            </span>
                          )}
                          {card.comments.length > 0 && (
                            <span className="flex items-center space-x-1 text-[10px] text-zinc-400">
                              <span>💬</span>
                              <span>{card.comments.length}</span>
                            </span>
                          )}
                        </div>
                        
                        <div className="text-white font-bold font-mono text-xs">
                          R$ {card.value.toLocaleString('pt-BR')}
                        </div>
                      </div>

                      {/* Barra de Ação de Movimentação Rápida em tempo real */}
                      <div className="mt-3 flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`move-backward-${card.id}`}
                          onClick={() => moveCard(card.id, 'backward')}
                          disabled={cardIndex === 0 && column.id === columns[0].id}
                          className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded transition"
                          title="Voltar Coluna"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <span className="text-[9px] font-mono uppercase text-amber-400 tracking-widest font-bold">Mover Etapa</span>
                        
                        <button
                          id={`move-forward-${card.id}`}
                          onClick={() => moveCard(card.id, 'forward')}
                          disabled={column.id === columns[columns.length - 1].id}
                          className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded transition"
                          title="Avançar Coluna"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}

                {colCards.length === 0 && (
                  <div className="text-center p-6 text-xs text-zinc-600 border border-dashed border-zinc-800 rounded-xl my-4">
                    Nenhuma carga ativa nesta etapa.
                  </div>
                )}
              </div>

              {/* Botão de Adicionar Carga na coluna */}
              <div className="p-3 bg-zinc-950/20 border-t border-zinc-800/60 rounded-b-2xl">
                {addingToColumnId === column.id ? (
                  <form onSubmit={(e) => handleCreateCardSubmit(e, column.id)} className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label htmlFor={`new-card-code-input-${column.id}`} className="sr-only">Código RDV</label>
                        <input
                          id={`new-card-code-input-${column.id}`}
                          type="text"
                          placeholder="RDV-102"
                          value={newCardCode}
                          onChange={(e) => setNewCardCode(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg p-2 text-xs text-amber-400 font-mono font-bold uppercase focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor={`new-card-title-input-${column.id}`} className="sr-only">Título da Carga</label>
                        <input
                          id={`new-card-title-input-${column.id}`}
                          type="text"
                          placeholder="Título da mercadoria..."
                          value={newCardTitle}
                          onChange={(e) => setNewCardTitle(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <button
                          id="btn-priority-b"
                          type="button"
                          onClick={() => setNewCardPriority('Baixa')}
                          className={`px-2 py-0.5 text-[9px] rounded uppercase font-bold font-mono transition ${newCardPriority === 'Baixa' ? 'bg-zinc-800 text-white border border-zinc-650' : 'bg-transparent text-zinc-500'}`}
                        >
                          Baixa
                        </button>
                        <button
                          id="btn-priority-m"
                          type="button"
                          onClick={() => setNewCardPriority('Média')}
                          className={`px-2 py-0.5 text-[9px] rounded uppercase font-bold font-mono transition ${newCardPriority === 'Média' ? 'bg-amber-400 text-zinc-950' : 'bg-transparent text-zinc-500'}`}
                        >
                          Média
                        </button>
                        <button
                          id="btn-priority-a"
                          type="button"
                          onClick={() => setNewCardPriority('Alta')}
                          className={`px-2 py-0.5 text-[9px] rounded uppercase font-bold font-mono transition ${newCardPriority === 'Alta' ? 'bg-red-500 text-white' : 'bg-transparent text-zinc-500'}`}
                        >
                          Alta
                        </button>
                      </div>
 
                      <div className="flex space-x-1">
                        <button
                          id="cancel-add-card-btn"
                          type="button"
                          onClick={() => setAddingToColumnId(null)}
                          className="px-2 py-1 bg-zinc-800 text-zinc-300 text-[10px] rounded hover:bg-zinc-700 font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          id="submit-add-card-btn"
                          type="submit"
                          className="px-2.5 py-1 bg-amber-400 text-zinc-950 text-[10px] rounded font-extrabold hover:bg-amber-500"
                        >
                          Inserir
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button
                    id={`add-card-trigger-${column.id}`}
                    onClick={() => {
                      setAddingToColumnId(column.id);
                      setNewCardPriority('Média');
                      setNewCardCode('RDV-');
                    }}
                    className="w-full text-left py-2 px-3 text-zinc-400 hover:text-white hover:bg-zinc-850 rounded-xl text-xs transition flex items-center justify-center space-x-1 border border-transparent hover:border-zinc-800"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Adicionar nova carga</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}

        {/* Adicionar Nova Coluna */}
        <div className="w-80 shrink-0">
          {isAddingColumn ? (
            <form onSubmit={handleAddColumn} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-3 shadow-lg">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">Nova Etapa Logística</h4>
              <input
                id="new-column-title-input"
                type="text"
                placeholder="Ex: Aguardando Vistoria..."
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-750/80 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                autoFocus
                required
              />
              <div className="flex justify-end gap-2 text-[11px]">
                <button
                  id="cancel-add-col-btn"
                  type="button"
                  onClick={() => setIsAddingColumn(false)}
                  className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded hover:text-white font-semibold"
                >
                  Cancelar
                </button>
                <button
                  id="submit-add-col-btn"
                  type="submit"
                  className="px-3.5 py-1 bg-amber-400 text-zinc-950 rounded font-black hover:bg-amber-500"
                >
                  Criar Etapa
                </button>
              </div>
            </form>
          ) : (
            <button
              id="add-column-trigger"
              onClick={() => setIsAddingColumn(true)}
              className="w-full py-4 px-4 bg-zinc-950/45 hover:bg-zinc-900 border border-dashed border-zinc-800 rounded-2xl text-xs text-zinc-500 hover:text-amber-404 hover:text-amber-400 hover:border-amber-400/40 transition flex items-center justify-center space-x-2 text-center"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Adicionar nova etapa (coluna)</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
