export type Sector = 'Comercial' | 'Expedição' | 'Geral';

export interface User {
  id: string;
  name: string;
  email: string;
  sector: Sector;
  avatarColor: string;
  avatarText: string;
  passwordHash?: string;
  role?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userSector: Sector;
  text: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  userName: string;
  userSector: Sector;
}

export interface TaskCard {
  id: string;
  code: string; // Registered by employee manually
  title: string;
  description: string;
  columnId: string;
  sector: Sector;
  priority: 'Baixa' | 'Média' | 'Alta';
  dueDate: string;
  value: number; // Overall reference value
  freteEmpresa: number; // Receita de faturamento
  freteMotorista: number; // Custo de operação repassado
  distance?: string; // e.g. '1.697 km'
  origin?: string;
  destination?: string;
  driverName?: string;
  driverPhone?: string;
  driverPlate?: string;
  driverRating?: 'Boa' | 'Ruim' | 'Nenhum';
  clientName?: string;
  clientPhone?: string;
  clientRating?: 'Bom' | 'Ruim' | 'Nenhum';
  sellerName?: string; // Vendedor responsável
  checklist: ChecklistItem[];
  comments: Comment[];
  activity: ActivityLog[];
  attachments?: string[];
}

export interface BoardColumn {
  id: string;
  title: string;
  accentColor: string; // Tailwind color class
}
