/**
 * Şartname §11.3–§11.10 — sayfa testlerinin plan örnekleri.
 *
 * Test dosyası **değildir** (`*.test.tsx` desenine uymaz); yalnızca
 * `test/ui/pages*.test.tsx` içinden kullanılır. Örnekler `createEmptyPlan()` ve
 * `createEmptyMember()` fabrikalarıyla kurulur; böylece kimlik üretimi ve
 * varsayılanlar tek yerde kalır.
 */
import { createEmptyMember, createEmptyPlan } from '../../src/model/defaults.ts';
import type { Member, Plan } from '../../src/model/types.ts';

/** Ev bilgisi doldurulmuş, tek bölümü dolu plan. */
export function planWithHousehold(): Plan {
  return {
    ...createEmptyPlan(),
    household: {
      label: 'Yılmaz ailesi',
      address: 'Deneme sokak 1',
      buildingNote: '4. kat, asansörlü',
      floorCount: '5',
    },
  };
}

/**
 * Bütün bölümleri dolu, iki kişilik örnek plan.
 *
 * İçinde sağlık bilgisi (`healthOptIn: true`) **ve** hem şehir içi hem şehir
 * dışı acil kişi vardır; acil ekranının sıralamasını ve özet sayfasının
 * gizleme davranışını sınamak için gerekir.
 */
export function fullPlan(): Plan {
  const adult: Member = {
    ...createEmptyMember('yetiskin'),
    name: 'Ayşe Yılmaz',
    phone: '0555 111 22 33',
    dailyPlaces: [{ kind: 'is', label: 'Belediye', phone: '0312 000 00 00', note: 'Saat 17.00' }],
    needs: {
      mobility: true,
      hearing: false,
      vision: false,
      communication: false,
      note: 'Merdiven inerken destek gerekir.',
    },
  };

  const child: Member = {
    ...createEmptyMember('cocuk'),
    name: 'Can Yılmaz',
    health: {
      bloodType: 'A+',
      conditions: 'Astım',
      medications: 'Ventolin',
      allergies: 'Polen',
      devices: '',
    },
  };

  return {
    ...createEmptyPlan(),
    healthOptIn: true,
    household: {
      label: 'Yılmaz ailesi',
      address: 'Deneme sokak 1',
      buildingNote: '4. kat, asansörlü',
      floorCount: '5',
    },
    members: [adult, child],
    contacts: [
      {
        id: 'contact-in-city',
        name: 'Ali Veli',
        relation: 'komşu',
        phone: '0555 222 33 44',
        phoneAlt: '',
        outOfArea: false,
        city: '',
        canPickUpChildren: false,
      },
      {
        id: 'contact-out-of-area',
        name: 'Zeynep Yılmaz',
        relation: 'teyze',
        phone: '0555 444 55 66',
        phoneAlt: '0212 000 00 00',
        outOfArea: true,
        city: 'İzmir',
        canPickUpChildren: true,
      },
    ],
    meeting: {
      nearHome: { label: 'Karşı park', detail: 'Kapıcı dairesinin karşısı' },
      neighborhood: { label: 'Cami avlusu', detail: '' },
      outOfArea: { label: 'Teyzenin evi', detail: 'İzmir, Karşıyaka' },
      assemblyArea: { label: 'Okul bahçesi', detail: '' },
      assemblyCheckedAt: '2026-04-01',
    },
    home: {
      safeSpots: ['Salon iç duvarı', 'Mutfak masasının yanı'],
      exits: ['Ana kapı'],
      utilities: {
        electricity: 'Giriş katı, merdiven altı',
        gas: 'Mutfakta ocağın yanında',
        water: 'Banyoda',
      },
      hazards: [{ id: 'H-01', done: true, note: '' }],
    },
    roles: [
      { roleId: 'canta', memberId: adult.id, note: '' },
      { roleId: 'vanalar', memberId: null, note: 'Uygun' },
    ],
    bag: {
      location: 'Koridor dolabı',
      items: [{ id: 'C-01', done: true, note: '2 şişe' }],
      lastCheckedAt: '2026-05-04',
    },
    documents: [{ id: 'B-01', done: true, note: '' }],
    pets: [{ id: 'pet-1', name: 'Pamuk', kind: 'kedi', note: '' }],
    insurance: { dask: 'evet' },
    review: { lastDrillAt: '2026-05-04', nextReviewAt: '2026-11-04' },
    notes: 'Toplanma alanını eylülde yeniden kontrol et.',
  };
}
