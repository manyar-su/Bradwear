
export enum SakuColor {
  ABU = 'Abu',
  HITAM = 'Hitam',
  CREAM = 'Cream',
  OREN = 'Oren'
}

export enum SakuType {
  SKOTLAIT = 'Skotlait',
  PETERBAN = 'Peterban',
  POLOS = 'Polos'
}

export enum JobStatus {
  BERES = 'Beres',
  PROSES = 'Proses'
}

export enum PaymentStatus {
  BAYAR = 'Sudah Bayar',
  BELUM = 'Belum Bayar'
}

export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface CustomMeasurements {
  tinggi?: number;
  lebarDada?: number;
  lebarBahu?: number;
  lenganPanjang?: number;
  lenganPendek?: number;
  kerah?: number;
  manset?: number;
  lingPerut?: number;
  lingPinggul?: number;
  // Untuk Celana
  lingkarPinggang?: number;
  lingkarPinggul?: number;
  lingkarPaha?: number;
  lingkarBawah?: number;
  // Alias untuk compatibility
  panjangLengan?: number; // Alias untuk lenganPanjang
  lingkaranPerut?: number; // Alias untuk lingPerut
}

export enum JenisBarang {
  KEMEJA = 'Kemeja',
  ROMPI = 'Rompi',
  CELANA = 'Celana'
}

export enum ModelCelana {
  WARRIOR = 'Warrior',
  ARMOR = 'Armor'
}

export enum ModelRompi {
  BUPATI = 'Bupati',
  CUSTOM = 'Custom'
}

export enum BahanCelana {
  AMERICAN_DRILL = 'American Drill',
  JAPAN_DRILL = 'Japan Drill',
  RIPSTOP = 'Ripstop',
  CANVAS = 'Canvas'
}

export enum BahanKemeja {
  MARYLAND = 'Maryland',
  AMERICAN_DRILL = 'American Drill',
  JAPAN_DRILL = 'Japan Drill',
  OXFORD = 'Oxford',
  KATUN = 'Katun',
  POLYESTER = 'Polyester',
  TROPICAL = 'Tropical',
  DENIM = 'Denim'
}

export enum JenisSakuRompi {
  DALAM = 'Dalam',
  LUAR = 'Luar',
  KOMBINASI = 'Kombinasi'
}

export interface SizeDetail {
  size: string;
  jumlah: number;
  gender: 'Pria' | 'Wanita';
  tangan: 'Panjang' | 'Pendek';
  namaPerSize?: string;
  isCustomSize?: boolean;
  customMeasurements?: CustomMeasurements;
  warna?: string;
  sakuType?: SakuType;
  sakuColor?: SakuColor;
  model?: string;
  // Untuk Kemeja
  bahanKemeja?: BahanKemeja;
  // Untuk Celana
  modelCelana?: ModelCelana;
  bahanCelana?: BahanCelana;
  // Untuk Rompi
  modelRompi?: ModelRompi;
  jenisSakuRompi?: JenisSakuRompi;
  // Multiple sizes dalam satu item
  sizes?: Array<{
    size: string;
    jumlah: number;
    namaPerSize?: string;
    isCustomSize?: boolean;
    customMeasurements?: CustomMeasurements;
  }>;
}

// Internal grouped state structure (not persisted)
export interface SizeGroup {
  id: string; // Unique identifier for React keys
  // Category attributes (only relevant ones based on jenis barang)
  gender?: 'Pria' | 'Wanita';
  tangan?: 'Panjang' | 'Pendek';
  modelCelana?: ModelCelana;
  modelRompi?: ModelRompi;
  // Shared attributes across all sizes in group
  warna?: string;
  model?: string; // For KEMEJA
  sakuType?: SakuType;
  sakuColor?: SakuColor;
  bahanKemeja?: BahanKemeja;
  bahanCelana?: BahanCelana;
  jenisSakuRompi?: JenisSakuRompi;
  // Array of sizes within this group
  sizes: Array<{
    id: string;
    size: string;
    jumlah: number;
    namaPerSize?: string;
    isCustomSize?: boolean;
    customMeasurements?: CustomMeasurements;
  }>;
}

export interface SizeChartEntry {
  size: string;
  tinggi?: number;
  lebarDada?: number;
  lebarBahu?: number;
  lenganPanjang?: number;
  lenganPendek?: number;
  kerah?: number;
  manset?: number;
}

export interface SizeChart {
  id: string;
  name: string;
  entries: SizeChartEntry[];
}

export interface OrderItem {
  id: string;
  namaPenjahit: string;
  kodeBarang: string;
  tanggalOrder: string;
  tanggalTargetSelesai: string;
  completedAt?: string | null;
  cs: string;
  konsumen: string;
  jumlahPesanan: number;
  sizeDetails: SizeDetail[];
  model: string;
  warna: string;
  sakuType: SakuType;
  sakuColor: SakuColor;
  status: JobStatus;
  priority: Priority;
  deskripsiPekerjaan: string;
  embroideryStatus?: 'Lengkap' | 'Kurang';
  embroideryNotes?: string;
  createdAt: string;
  deletedAt?: string | null;
  isManual?: boolean;
  createCalendarReminder?: boolean;
  modelDetail?: string;
  paymentStatus?: PaymentStatus;
  cloudId?: string;
  jenisBarang?: JenisBarang;
  bahanKemeja?: BahanKemeja;
}

export const BRAD_MODELS = ['Brad V1', 'Brad V2', 'Brad V3', 'Yoroi', 'PDH', 'PDH Baru', 'Ventura', 'Rompi', 'Celana', 'Custom'];

export const PRICE_LIST: Record<string, number> = {
  'V1_KPLJ': 39000,
  'V1_KLPD': 38000,
  'BRAD V1_KPLJ': 39000,
  'BRAD V1_KLPD': 38000,
  'V2_KPLJ': 39000,
  'V2_KLPD': 38000,
  'BRAD V2_KPLJ': 39000,
  'BRAD V2_KLPD': 38000,
  'PDH_KPLJ': 39000,
  'PDH BARU_KPLJ': 39000,
  'VENTURA_KPLJ': 41000,
  'VENTURA_KLPD': 40000,
  'ROMPI': 45000,
  'CELANA_PDL': 45000,
  'CELANA_FORMAL': 40000,
  'PDL_KPLJ': 39000,
  'PDL_KLPD': 38000,
  'V1 (GRAD B)_KPLJ': 34000,
  'V1 TUNIK (GRAD B)_KPLJ': 36000,
  'COSTUM_KPLJ': 39000,
  'CUSTOM_KPLJ': 39000,
  'YOROI_KPLJ': 42000,
  'YOROI_KLPD': 41000,
  'YOROI': 42000,
  'DEFAULT': 35000
};

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe?: boolean;
  image?: string;
}

export type ViewState = 'DASHBOARD' | 'SCAN' | 'HISTORY' | 'ANALYTICS' | 'ACCOUNT' | 'FORUM_CHAT';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  timestamp: string;
  read: boolean;
}

export interface ConfirmDialogConfig {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  type: 'danger' | 'warning' | 'info';
}
