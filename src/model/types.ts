/**
 * Şartname §8.1 — veri modeli. Bu dosya sözleşmedir: alan adları, türler ve
 * yorumlar şartnameden birebir alınmıştır; değiştirmeden önce §8.3 ve Ek B'yi oku.
 */

export const SCHEMA_VERSION = 1;

export type YesNoUnknown = 'evet' | 'hayir' | 'bilmiyorum';

export interface Place {
  label: string; // "Apartmanın karşısındaki park"
  detail: string; // tarif ya da adres; boş olabilir
}

export interface DailyPlace {
  // okul, iş yeri, kreş, bakım merkezi
  kind: 'okul' | 'is' | 'diger';
  label: string;
  phone: string;
  note: string; // "Servisle gidiyor", "Teslim alacak kişi: ..."
}

export interface Health {
  // ÖZEL NİTELİKLİ — yalnızca healthOptIn true iken var olur
  bloodType: '' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | '0+' | '0-';
  conditions: string; // sürekli hastalıklar
  medications: string; // düzenli ilaçlar
  allergies: string;
  devices: string; // işitme cihazı, oksijen, tekerlekli sandalye...
}

export interface Member {
  id: string; // crypto.randomUUID()
  name: string;
  group: 'yetiskin' | 'cocuk' | 'bebek' | 'yasli';
  phone: string;
  dailyPlaces: DailyPlace[]; // en çok 3
  needs: {
    mobility: boolean; // hareket desteği gerekir
    hearing: boolean;
    vision: boolean;
    communication: boolean; // iletişim desteği gerekir
    note: string; // "Merdiven inerken destek gerekir"
  };
  health?: Health;
}

export interface Contact {
  id: string;
  name: string;
  relation: string; // "teyze", "komşu"
  phone: string;
  phoneAlt: string;
  outOfArea: boolean; // şehir dışı irtibat kişisi
  city: string; // outOfArea ise
  canPickUpChildren: boolean; // çocukları teslim alabilir
}

export interface RoleAssignment {
  roleId: RoleId;
  memberId: string | null;
  note: string;
}

export type RoleId =
  | 'canta'
  | 'vanalar'
  | 'cocuklar'
  | 'yaslilar'
  | 'evcil'
  | 'kapilar'
  | 'iletisim';

export interface ChecklistState {
  id: string;
  done: boolean;
  note: string;
}

export interface Pet {
  id: string;
  name: string;
  kind: string;
  note: string;
}

export interface Plan {
  schemaVersion: 1;
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
  healthOptIn: boolean;
  household: {
    label: string; // "Yılmaz ailesi"
    address: string;
    buildingNote: string; // "4. kat, asansörlü, 2 merdiven"
    floorCount: string;
  };
  members: Member[]; // 1–12
  contacts: Contact[]; // 0–10
  meeting: {
    nearHome: Place; // 1. buluşma yeri: evin hemen yakını
    neighborhood: Place; // 2. buluşma yeri: mahallede
    outOfArea: Place; // 3. buluşma yeri: şehir dışı
    assemblyArea: Place; // resmî toplanma alanı (kullanıcı yazar)
    assemblyCheckedAt: string | null; // resmî sorgudan baktığı tarih
  };
  home: {
    safeSpots: string[]; // her oda için güvenli yer; en çok 10
    exits: string[]; // çıkış yolları; en çok 5
    utilities: { electricity: string; gas: string; water: string }; // yer tarifi
    hazards: ChecklistState[]; // tehlike avı listesi (13.3, H-*)
  };
  roles: RoleAssignment[];
  bag: {
    location: string;
    items: ChecklistState[]; // çanta listesi (13.3, C-*)
    lastCheckedAt: string | null;
  };
  documents: ChecklistState[]; // belge kopyaları (13.3, B-*)
  pets: Pet[]; // 0–6
  insurance: { dask: YesNoUnknown };
  review: {
    lastDrillAt: string | null;
    nextReviewAt: string | null;
  };
  notes: string;
}
