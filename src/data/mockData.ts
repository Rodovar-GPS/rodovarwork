import { User, BoardColumn, TaskCard } from '../types';

export const MOCK_USERS: (User & { passwordHash: string; role: string })[] = [
  {
    id: 'usr-master',
    name: 'Diretor Master (Administrador)',
    email: 'master@rodovar.com.br',
    sector: 'Geral',
    avatarColor: 'bg-amber-400 text-zinc-950 font-black ring-2 ring-white',
    avatarText: 'DM',
    passwordHash: '123456',
    role: 'Administrador Master'
  },
  {
    id: 'usr-mariane',
    name: 'Mariane',
    email: 'mariane@rodovar.com.br',
    sector: 'Comercial',
    avatarColor: 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-zinc-950 font-bold',
    avatarText: 'MA',
    passwordHash: '123456',
    role: 'Gestora Comercial Sênior'
  },
  {
    id: 'usr-priscila',
    name: 'Priscila',
    email: 'priscila@rodovar.com.br',
    sector: 'Expedição',
    avatarColor: 'bg-zinc-900 text-cyan-400 border border-cyan-400 font-bold',
    avatarText: 'PR',
    passwordHash: '123456',
    role: 'Coordenadora de Frota'
  },
  {
    id: 'usr-cesar',
    name: 'Cesar',
    email: 'cesar@rodovar.com.br',
    sector: 'Comercial',
    avatarColor: 'bg-zinc-100 text-zinc-900 border border-zinc-450 font-bold',
    avatarText: 'CE',
    passwordHash: '123456',
    role: 'Analista de Faturamento'
  },
  {
    id: 'usr-jeise',
    name: 'JEISE',
    email: 'jeise@rodovar.com.br',
    sector: 'Comercial',
    avatarColor: 'bg-emerald-600 text-white font-bold',
    avatarText: 'JE',
    passwordHash: '123456',
    role: 'Assessora de Vendas'
  },
  {
    id: 'usr-marival',
    name: 'Marival',
    email: 'marival@rodovar.com.br',
    sector: 'Expedição',
    avatarColor: 'bg-amber-400 text-zinc-950 font-black',
    avatarText: 'MV',
    passwordHash: '123456',
    role: 'Operador Logístico Pleno'
  },
  {
    id: 'usr-ana',
    name: 'Ana',
    email: 'ana@rodovar.com.br',
    sector: 'Geral',
    avatarColor: 'bg-rose-500 text-white font-bold',
    avatarText: 'AN',
    passwordHash: '123456',
    role: 'Supervisora do Faturamento'
  }
];

export const DEFAULT_COLUMNS: BoardColumn[] = [
  {
    id: 'cotacao',
    title: 'Cotação & Proposta',
    accentColor: 'border-l-4 border-amber-400'
  },
  {
    id: 'agendado',
    title: 'Coleta Programada',
    accentColor: 'border-l-4 border-zinc-400'
  },
  {
    id: 'transito',
    title: 'Em Trânsito (Rota)',
    accentColor: 'border-l-4 border-amber-500'
  },
  {
    id: 'faturamento',
    title: 'Aguardando Faturamento',
    accentColor: 'border-l-4 border-pink-500'
  },
  {
    id: 'concluido',
    title: 'Entregue & Concluído',
    accentColor: 'border-l-4 border-emerald-500'
  }
];

export const INITIAL_CARDS: TaskCard[] = [
  {
    id: 'card-live-monitored',
    code: 'RDV-M402',
    title: 'Rota Monitorada: Salvador-BA ➔ São Luis-MA - Paraguaçu',
    description: 'Monitoramento contínuo de rota prioritária para escoamento logístico. Carga protegida pelo plano de monitoramento ativo.',
    columnId: 'transito',
    sector: 'Expedição',
    priority: 'Alta',
    dueDate: '2026-06-13',
    value: 1100,
    freteEmpresa: 1100,
    freteMotorista: 3478.29,
    distance: '1.697 km',
    driverName: 'ODEMIR BESEN',
    driverPhone: '+55 48988381872',
    driverPlate: 'RDV-9B45',
    driverRating: 'Nenhum',
    clientName: 'OBRATEC ATACAREJO',
    clientPhone: '+55 48988381872',
    clientRating: 'Nenhum',
    sellerName: 'MARIANE',
    checklist: [
      { id: 'chk-m1', text: 'Confirmar início da rota no Rodovar Monitora', completed: true },
      { id: 'chk-m2', text: 'Validar dados do motorista credenciado', completed: true },
      { id: 'chk-m3', text: 'Checar sinal de rastreamento principal', completed: true },
      { id: 'chk-m4', text: 'Enviar link de monitoramento ao cliente', completed: false }
    ],
    comments: [
      {
        id: 'cmt-m1',
        userId: 'usr-2',
        userName: 'Amanda Souza',
        userSector: 'Expedição',
        text: 'Rota iniciada sem intercorrências em Salvador-BA com destino a São Luis-MA.',
        timestamp: '2026-06-13 14:02'
      }
    ],
    activity: [
      {
        id: 'act-m1',
        action: 'vinculou o motorista ODEMIR BESEN e iniciou o monitoramento',
        timestamp: '2026-06-13 14:00',
        userName: 'Amanda Souza',
        userSector: 'Expedição'
      }
    ]
  },
  {
    id: 'card-1',
    code: 'RDV-C001',
    title: 'Cotação: Carga de Milho (60t) - Cascavel/PR para Santos/SP',
    description: 'Demanda de transporte de milho a granel. Cliente solicita cotação imediata com inclusão de tarifas aduaneiras e estadia inclusa de até 24 horas.',
    columnId: 'cotacao',
    sector: 'Comercial',
    priority: 'Alta',
    dueDate: '2026-06-18',
    value: 12500,
    freteEmpresa: 12500,
    freteMotorista: 10200,
    distance: '1.200 km',
    driverName: 'Marcos Silva',
    driverPhone: '+55 11985472145',
    driverPlate: 'ABC-1234',
    driverRating: 'Boa',
    clientName: 'Cooperativa Agro Cascavel',
    clientPhone: '+55 4532214455',
    clientRating: 'Bom',
    sellerName: 'MARIANE',
    checklist: [
      { id: 'chk-1-1', text: 'Calcular pedágio por eixo', completed: true },
      { id: 'chk-1-2', text: 'Verificar disponibilidade de caçamba bi-trem', completed: false },
      { id: 'chk-1-3', text: 'Enviar PDF de proposta comercial', completed: false }
    ],
    comments: [
      {
        id: 'cmt-1-1',
        userId: 'usr-1',
        userName: 'Carlos Oliveira',
        userSector: 'Comercial',
        text: 'Em contato com a cooperativa, eles têm urgência nesse embarque!',
        timestamp: '2026-06-13 10:30'
      }
    ],
    activity: [
      {
        id: 'act-1-1',
        action: 'criou e cadastrou a cotação inicial no sistema',
        timestamp: '2026-06-13 09:30',
        userName: 'Carlos Oliveira',
        userSector: 'Comercial'
      }
    ]
  },
  {
    id: 'card-2',
    code: 'RDV-E002',
    title: 'Programação: Coleta de Adutores e Tubulações',
    description: 'Coleta de carga de tubulações de aço de 12 metros na metalúrgica em Betim/MG. Necessário carreta prancha ou extensiva com licença especial (AET).',
    columnId: 'agendado',
    sector: 'Expedição',
    priority: 'Média',
    dueDate: '2026-06-15',
    value: 8400,
    freteEmpresa: 8400,
    freteMotorista: 6900,
    distance: '450 km',
    driverName: 'Marcos Silva (Agregado)',
    driverPhone: '+55 31985552323',
    driverPlate: 'KRD-5G42',
    driverRating: 'Nenhum',
    clientName: 'Metalurgica Betim',
    clientPhone: '+55 3133334444',
    clientRating: 'Bom',
    sellerName: 'CARLOS',
    checklist: [
      { id: 'chk-2-1', text: 'Emitir autorização especial de tráfego (AET)', completed: true },
      { id: 'chk-2-2', text: 'Confirmar horário de recebimento no porto', completed: true },
      { id: 'chk-2-3', text: 'Notificar motorista por WhatsApp com ordem de coleta', completed: false }
    ],
    comments: [],
    activity: [
      {
        id: 'act-2-1',
        action: 'vinculou o motorista Marcos Silva de placa KRD-5G42',
        timestamp: '2026-06-13 11:20',
        userName: 'Amanda Souza',
        userSector: 'Expedição'
      }
    ]
  },
  {
    id: 'card-4',
    code: 'RDV-F004',
    title: 'Faturamento: Frete de Defensivos Agrícolas',
    description: 'Transporte concluído ontem. Necessita emissão de CTE, MDFE, envio do canhoto assinado digitalmente e faturamento para vencimento de 15 dias.',
    columnId: 'faturamento',
    sector: 'Comercial',
    priority: 'Alta',
    dueDate: '2026-06-16',
    value: 23900,
    freteEmpresa: 23900,
    freteMotorista: 19800,
    distance: '2.100 km',
    driverName: 'Antônio Ferreira',
    driverPhone: '+55 1999882233',
    driverPlate: 'ABC-9876',
    driverRating: 'Boa',
    clientName: 'Agroquímica Cubatão',
    clientPhone: '+55 1332210099',
    clientRating: 'Bom',
    sellerName: 'MARIANE',
    checklist: [
      { id: 'chk-4-1', text: 'Conferir assinatura legível no Canhoto Físico', completed: true },
      { id: 'chk-4-2', text: 'Emitir NFS-e complementar de estadia extra', completed: false },
      { id: 'chk-4-3', text: 'Gerar boleto bancário de fatura', completed: false }
    ],
    comments: [
      {
        id: 'cmt-4-1',
        userId: 'usr-3',
        userName: 'Ricardo Santos',
        userSector: 'Comercial',
        text: 'Adicionando cobrança devida a 2 dias de estadia extra no terminal de Sorriso.',
        timestamp: '2026-06-13 15:45'
      }
    ],
    activity: [
      {
        id: 'act-4-1',
        action: 'solicitou emissão de NFS-e complementar de estadia',
        timestamp: '2026-06-13 15:44',
        userName: 'Ricardo Santos',
        userSector: 'Comercial'
      }
    ]
  }
];
