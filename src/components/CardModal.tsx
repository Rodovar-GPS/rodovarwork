import React, { useState } from 'react';
import { TaskCard, ChecklistItem, Comment, Sector } from '../types';
import { User } from '../types';
import { 
  X, AlignLeft, Calendar, UserCheck, DollarSign, 
  MapPin, AlertTriangle, CheckSquare, MessageSquare, 
  Trash2, Plus, Clock, Tag 
} from 'lucide-react';

interface CardModalProps {
  card: TaskCard;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: TaskCard) => void;
  onDelete: (cardId: string) => void;
  currentUser: User;
}

export default function CardModal({ card, isOpen, onClose, onSave, onDelete, currentUser }: CardModalProps) {
  const [title, setTitle] = useState(card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState(card.priority || 'Média');
  const [sector, setSector] = useState<Sector>(card.sector || 'Comercial');
  const [value, setValue] = useState(card.value || 0);
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  
  const [driverName, setDriverName] = useState(card.driverName || '');
  const [driverPlate, setDriverPlate] = useState(card.driverPlate || '');
  const [origin, setOrigin] = useState(card.origin || '');
  const [destination, setDestination] = useState(card.destination || '');

  // Rodovar Monitora expanded fields
  const [distance, setDistance] = useState(card.distance || '');
  const [driverPhone, setDriverPhone] = useState(card.driverPhone || '');
  const [driverRating, setDriverRating] = useState(card.driverRating || 'Nenhum');
  const [clientName, setClientName] = useState(card.clientName || '');
  const [clientPhone, setClientPhone] = useState(card.clientPhone || '');
  const [clientRating, setClientRating] = useState(card.clientRating || 'Nenhum');
  const [sellerName, setSellerName] = useState(card.sellerName || '');
  const [freteEmpresa, setFreteEmpresa] = useState(card.freteEmpresa || card.value || 0);
  const [freteMotorista, setFreteMotorista] = useState(card.freteMotorista || 0);

  // Comments and Checklists
  const [newCheckItem, setNewCheckItem] = useState('');
  const [newComment, setNewComment] = useState('');

  if (!isOpen) return null;

  // Save general modifications & log activity
  const handleFieldChange = (updatedFields: Partial<TaskCard>) => {
    const updatedCard: TaskCard = {
      ...card,
      ...updatedFields,
    };
    onSave(updatedCard);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build activity log
    const logId = 'log-' + Date.now();
    const newLog = {
      id: logId,
      action: `atualizou os dados gerais da carga de código ${card.code}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userName: currentUser.name,
      userSector: currentUser.sector,
    };

    const updatedCard: TaskCard = {
      ...card,
      title,
      description,
      priority,
      sector,
      value: Number(freteEmpresa), // Sync overall value with Frete Empresa
      dueDate,
      driverName,
      driverPlate,
      origin,
      destination,
      distance,
      driverPhone,
      driverRating,
      clientName,
      clientPhone,
      clientRating,
      sellerName,
      freteEmpresa: Number(freteEmpresa),
      freteMotorista: Number(freteMotorista),
      activity: [newLog, ...card.activity]
    };
    onSave(updatedCard);
    onClose();
  };

  // Checklist Actions
  const toggleCheckItem = (itemId: string) => {
    const updatedChecklist = card.checklist.map((item) => {
      if (item.id === itemId) {
        const nextState = !item.completed;
        // Log action
        const logId = 'log-' + Date.now();
        const actionText = nextState ? `marcou o item "${item.text}" como Concluído` : `desmarcou o item "${item.text}"`;
        const newLog = {
          id: logId,
          action: actionText,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          userName: currentUser.name,
          userSector: currentUser.sector
        };
        card.activity = [newLog, ...card.activity];
        return { ...item, completed: nextState };
      }
      return item;
    });

    handleFieldChange({ checklist: updatedChecklist });
  };

  const addCheckItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;

    const newItem: ChecklistItem = {
      id: 'chk-' + Date.now(),
      text: newCheckItem.trim(),
      completed: false
    };

    // Log action
    const logId = 'log-' + Date.now();
    const newLog = {
      id: logId,
      action: `adicionou tarefa no checklist: "${newItem.text}"`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userName: currentUser.name,
      userSector: currentUser.sector
    };

    handleFieldChange({
      checklist: [...card.checklist, newItem],
      activity: [newLog, ...card.activity]
    });
    setNewCheckItem('');
  };

  const removeCheckItem = (itemId: string) => {
    const itemToRemove = card.checklist.find(i => i.id === itemId);
    const updatedChecklist = card.checklist.filter(item => item.id !== itemId);
    
    // Log action
    const logId = 'log-' + Date.now();
    const newLog = {
      id: logId,
      action: `removeu tarefa do checklist: "${itemToRemove?.text || ''}"`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userName: currentUser.name,
      userSector: currentUser.sector
    };

    handleFieldChange({
      checklist: updatedChecklist,
      activity: [newLog, ...card.activity]
    });
  };

  // Comment Actions
  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentId = 'cmt-' + Date.now();
    const newCmt: Comment = {
      id: commentId,
      userId: currentUser.id,
      userName: currentUser.name,
      userSector: currentUser.sector,
      text: newComment.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    // Log action
    const logId = 'log-' + Date.now();
    const newLog = {
      id: logId,
      action: `comentou: "${newCmt.text.substring(0, 40)}${newCmt.text.length > 40 ? '...' : ''}"`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userName: currentUser.name,
      userSector: currentUser.sector
    };

    handleFieldChange({
      comments: [newCmt, ...card.comments],
      activity: [newLog, ...card.activity]
    });
    setNewComment('');
  };

  const deleteComment = (commentId: string) => {
    const updatedComments = card.comments.filter(c => c.id !== commentId);
    
    const logId = 'log-' + Date.now();
    const newLog = {
      id: logId,
      action: `removeu um comentário do feedback`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userName: currentUser.name,
      userSector: currentUser.sector
    };

    handleFieldChange({
      comments: updatedComments,
      activity: [newLog, ...card.activity]
    });
  };

  // Checklist Completion Rate
  const totalItems = card.checklist.length;
  const completedItems = card.checklist.filter(i => i.completed).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col font-sans animate-fade-in">
        
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-amber-400 text-zinc-950 text-xs font-mono font-bold rounded-md">
              {card.code}
            </span>
            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
              priority === 'Alta' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              priority === 'Média' ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' :
              'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}>
              {priority} prioritário
            </span>
            <span className="text-zinc-500 text-xs">|</span>
            <div className="flex items-center space-x-1.5 text-zinc-400 text-xs font-medium">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Setor: <strong className="text-white">{sector}</strong></span>
            </div>
          </div>
          <button 
            id="close-modal-top-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto">
          
          {/* Coluna Esquerda: Edição Global (Formulário) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* Box Titulo e Descrição */}
              <div>
                <label htmlFor="card-title-input" className="block text-xs uppercase tracking-wider text-zinc-400 font-mono font-bold mb-2">
                  Título da Carga / Serviço
                </label>
                <input
                  id="card-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400/80 rounded-lg py-2.5 px-3.5 text-white font-semibold placeholder-zinc-500 focus:outline-none transition"
                  placeholder="Nome descritivo da entrega ou serviço"
                  required
                />
              </div>

              {/* Box Descritivo Detalhado */}
              <div>
                <label htmlFor="card-desc-textarea" className="block text-xs uppercase tracking-wider text-zinc-400 font-mono font-bold mb-2 flex items-center gap-1">
                  <AlignLeft className="w-4 h-4 text-amber-400" />
                  <span>Descrição Detalhada</span>
                </label>
                <textarea
                  id="card-desc-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400/80 rounded-lg py-2 px-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition resize-none"
                  placeholder="Instruções adicionais de coleta, restrições ou detalhes operacionais da viagem comercial..."
                />
              </div>
                
              {/* Informações Logísticas Específicas */}
              <div className="bg-zinc-950/60 p-5 rounded-xl border border-zinc-800/85 space-y-4 shadow-inner">
                <h4 className="text-xs font-black text-amber-400 font-mono uppercase tracking-wider flex items-center space-x-2 border-b border-zinc-800 pb-2">
                  <span>⚓ 1. ROTA E DISTÂNCIA (Rodovar Monitora)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="card-origin-input" className="block text-[11px] font-mono uppercase text-zinc-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>Origem (UF)</span>
                    </label>
                    <input
                      id="card-origin-input"
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded py-1.5 px-3 text-xs text-white uppercase focus:outline-none focus:border-amber-400 font-medium"
                      placeholder="Ex: Salvador-BA"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="card-destination-input" className="block text-[11px] font-mono uppercase text-zinc-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Destino (UF)</span>
                    </label>
                    <input
                      id="card-destination-input"
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded py-1.5 px-3 text-xs text-white uppercase focus:outline-none focus:border-amber-400 font-medium"
                      placeholder="Ex: São Luis-MA"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="card-distance-input" className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Distância Operacional
                    </label>
                    <input
                      id="card-distance-input"
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400 placeholder-zinc-500 font-mono font-bold"
                      placeholder="Ex: 1.697 km"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                    />
                  </div>
                </div>

                <h4 className="text-xs font-black text-amber-400 font-mono uppercase tracking-wider flex items-center space-x-2 border-b border-zinc-800 pb-2 pt-2">
                  <span>🚛 2. DADOS DO MOTORISTA E VEÍCULO</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="card-driver-input" className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Motorista Credenciado
                    </label>
                    <input
                      id="card-driver-input"
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                      placeholder="Ex: ODEMIR BESEN"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="card-driver-phone-input" className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Telefone do Motorista
                    </label>
                    <input
                      id="card-driver-phone-input"
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded py-1.5 px-3 text-xs text-white placeholder-zinc-500 font-mono"
                      placeholder="Ex: +55 48988381872"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="card-plate-input" className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Veículo Placa
                    </label>
                    <input
                      id="card-plate-input"
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded py-1.5 px-3 text-xs text-white placeholder-zinc-500 font-mono uppercase"
                      placeholder="Ex: RDV-9B45"
                      value={driverPlate}
                      onChange={(e) => setDriverPlate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="card-driver-rating-select" className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Classificação da Viagem
                    </label>
                    <select
                      id="card-driver-rating-select"
                      value={driverRating}
                      onChange={(e) => setDriverRating(e.target.value as 'Boa' | 'Ruim' | 'Nenhum')}
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded py-1.5 px-2 text-xs text-white focus:outline-none font-semibold text-amber-400"
                    >
                      <option value="Nenhum">Sem Avaliação</option>
                      <option value="Boa">👍 Viagem Boa</option>
                      <option value="Ruim">👎 Viagem Ruim</option>
                    </select>
                  </div>
                </div>

                <h4 className="text-xs font-black text-amber-400 font-mono uppercase tracking-wider flex items-center space-x-2 border-b border-zinc-800 pb-2 pt-2">
                  <span>🏢 3. DADOS DO CLIENTE E VENDEDOR</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="card-client-input" className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Nome do Cliente Destinatário
                    </label>
                    <input
                      id="card-client-input"
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                      placeholder="Ex: OBRATEC ATACAREJO"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="card-client-phone-input" className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Telefone do Cliente
                    </label>
                    <input
                      id="card-client-phone-input"
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded py-1.5 px-3 text-xs text-white placeholder-zinc-500 font-mono"
                      placeholder="Ex: +55 48988381872"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="card-client-rating-select" className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Classificação do Cliente
                    </label>
                    <select
                      id="card-client-rating-select"
                      value={clientRating}
                      onChange={(e) => setClientRating(e.target.value as 'Bom' | 'Ruim' | 'Nenhum')}
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded py-1.5 px-2 text-xs text-white focus:outline-none font-semibold text-amber-400"
                    >
                      <option value="Nenhum">Sem Avaliação</option>
                      <option value="Bom">🏆 Cliente Bom</option>
                      <option value="Ruim">⚠️ Cliente Ruim</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="card-seller-input" className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Vendedor Responsável RODOVAR
                    </label>
                    <input
                      id="card-seller-input"
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400 uppercase font-mono font-semibold"
                      placeholder="Ex: MARIANE"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                    />
                  </div>
                </div>

                <h4 className="text-xs font-black text-amber-400 font-mono uppercase tracking-wider flex items-center space-x-2 border-b border-zinc-800 pb-2 pt-2">
                  <span>💲 4. VALORES E CUSTOS DO FRETE (DRE)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="frete-empresa-input" className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Frete Empresa (Receita Bruta S/A)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-zinc-500 text-xs">R$</span>
                      <input
                        id="frete-empresa-input"
                        type="number"
                        value={freteEmpresa}
                        onChange={(e) => setFreteEmpresa(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-700/80 pl-8 rounded p-1.5 text-xs text-white font-mono font-bold"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="frete-motorista-input" className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                      Frete Motorista (Custo Repassado)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-zinc-500 text-xs">R$</span>
                      <input
                        id="frete-motorista-input"
                        type="number"
                        value={freteMotorista}
                        onChange={(e) => setFreteMotorista(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-700/80 pl-8 rounded p-1.5 text-xs text-white font-mono font-bold text-red-400"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Atributos de Ajuste */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-zinc-950/30 p-4 rounded-xl border border-zinc-850">
                <div>
                  <label htmlFor="select-priority-modal" className="block text-[11px] text-zinc-500 uppercase tracking-wider font-mono font-bold mb-1.5">Prioridade</label>
                  <select
                    id="select-priority-modal"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'Baixa' | 'Média' | 'Alta')}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                  >
                    <option value="Baixa">🟢 Baixa</option>
                    <option value="Média">🟡 Média</option>
                    <option value="Alta">🔴 Alta</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="select-sector-modal" className="block text-[11px] text-zinc-500 uppercase tracking-wider font-mono font-bold mb-1.5">Setor de Atividade</label>
                  <select
                    id="select-sector-modal"
                    value={sector}
                    onChange={(e) => setSector(e.target.value as Sector)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-400 focus:outline-none"
                  >
                    <option value="Comercial">💼 Comercial</option>
                    <option value="Expedição">🚛 Expedição</option>
                    <option value="Geral">🏢 Geral</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="card-due-input" className="block text-[11px] text-zinc-500 uppercase tracking-wider font-mono font-bold mb-1.5">Prazo Estimado</label>
                  <input
                    id="card-due-input"
                    type="date"
                    value={dueDate}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Botões do Formulário Esquerdo */}
              <div className="flex justify-between items-center pt-4 border-t border-zinc-805">
                <button
                  id="delete-card-btn"
                  type="button"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja arquivar/deletar essa carga do fluxo?')) {
                      onDelete(card.id);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-red-950/80 hover:bg-red-900 border border-red-750 hover:border-red-600 rounded-lg text-xs font-bold text-red-200 transition flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir Carga</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    id="cancel-modal-btn"
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700/80 rounded-lg text-xs font-semibold text-zinc-300 transition"
                  >
                    Voltar
                  </button>
                  <button
                    id="save-modal-btn"
                    type="submit"
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold rounded-lg text-xs transition"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* Coluna Direita: Checklists dinâmicos e Feed de Comentários / Atividades */}
          <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-zinc-800/80 lg:pl-8">
            
            {/* Seção Checklists */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-mono font-bold flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <span>Checklist Técnico</span>
                </h4>
                <span className="text-xs font-bold font-mono text-amber-400">{progressPercent}%</span>
              </div>
              
              {/* Barra de progresso */}
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              {/* Lista Itens */}
              <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-1">
                {card.checklist.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-2 bg-zinc-950/30 hover:bg-zinc-950/70 border border-zinc-800/60 rounded-lg group transition"
                  >
                    <label className="flex items-center space-x-3 cursor-pointer select-none text-xs flex-1">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleCheckItem(item.id)}
                        className="w-4 h-4 accent-amber-400 rounded focus:ring-amber-400/50 bg-zinc-900 border-zinc-700"
                      />
                      <span className={`transition-colors ${item.completed ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                        {item.text}
                      </span>
                    </label>
                    <button
                      id={`remove-check-item-${item.id}`}
                      type="button"
                      onClick={() => removeCheckItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {card.checklist.length === 0 && (
                  <div className="text-center p-3 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                    Nenhum checklist associado. Insira um abaixo!
                  </div>
                )}
              </div>

              {/* Formulário Inserir Checkitem */}
              <form onSubmit={addCheckItem} className="flex gap-2 mt-2">
                <input
                  id="add-checklist-input"
                  type="text"
                  placeholder="Nova tarefa de checklist..."
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md py-1 px-3 text-xs focus:outline-none focus:border-amber-450 text-stone-200"
                />
                <button
                  id="add-checklist-submit-btn"
                  type="submit"
                  className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-750 p-1.5 rounded-md font-bold text-xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Comentários Operacionais */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-mono font-bold flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Comentários & Histórico</span>
              </h4>

              {/* Form de comentário */}
              <form onSubmit={submitComment} className="space-y-2">
                <textarea
                  id="comment-textarea-input"
                  rows={2}
                  placeholder={`Escreva um comentário como ${currentUser.name}...`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-400 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    id="submit-comment-btn"
                    type="submit"
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Comentar</span>
                  </button>
                </div>
              </form>

              {/* Feed Comentários */}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {card.comments.map((comment) => (
                  <div key={comment.id} className="p-2.5 bg-zinc-950/40 rounded-xl border border-zinc-850 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-bold flex items-center justify-center">
                          {comment.userName.substring(0, 2).toUpperCase()}
                        </span>
                        <div className="text-xs font-bold leading-none text-white">
                          {comment.userName}
                          <span className="text-[10px] text-zinc-500 font-mono font-normal ml-1 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                            {comment.userSector}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] text-zinc-500 font-mono flex items-center">
                        <Clock className="w-2.5 h-2.5 mr-1" />
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 pl-7 leading-relaxed">{comment.text}</p>
                    {currentUser.name === comment.userName && (
                      <div className="flex justify-end pr-1">
                        <button 
                          id={`delete-comment-${comment.id}`}
                          onClick={() => deleteComment(comment.id)}
                          className="text-[10px] text-zinc-500 hover:text-red-400 underline transition duration-100"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Linha do Tempo de Atividades Gerais */}
                <div className="relative border-l border-zinc-800 pl-4 space-y-3 mt-4 pt-4 border-t border-dashed border-zinc-805">
                  <h5 className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest font-bold flex items-center">
                    <span>📋 Auditoria de Eventos</span>
                  </h5>
                  
                  {card.activity.map((act) => (
                    <div key={act.id} className="text-[10px] text-zinc-400 leading-tight">
                      <span className="font-semibold text-white">{act.userName}</span> ({act.userSector}){' '}
                      <span className="text-zinc-500">{act.action}</span>
                      <div className="text-[9px] text-zinc-600 font-mono mt-0.5">{act.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
