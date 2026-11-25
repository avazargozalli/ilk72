/**
 * Şartname §11.8, §18.2 — `progress.ts`: dokuz bölümün doluluk durumu.
 *
 * Her bölüm için "dolu", "kısmen" ve "boş" örnekleri ayrı ayrı ölçülür;
 * işlev saftır, depo okumaz ve planı değiştirmez.
 */
import { describe, expect, it } from 'vitest';
import { BASE_BAG_ITEM_IDS } from '../../src/model/bag';
import { createEmptyContact, createEmptyMember, createEmptyPlan } from '../../src/model/defaults';
import {
  computeProgress,
  NEEDS_WIZARD_STEP,
  PLAN_SECTIONS,
  type SectionStatus,
  sectionStatus,
} from '../../src/model/progress';
import type { Contact, Member, Plan } from '../../src/model/types';

function addMember(plan: Plan, group: Member['group'] = 'yetiskin', name = 'Ayşe Yılmaz'): Member {
  const member = createEmptyMember(group);
  member.name = name;
  plan.members.push(member);
  return member;
}

function addContact(plan: Plan, outOfArea = false): Contact {
  const contact = createEmptyContact();
  contact.name = 'Zeynep Kaya';
  contact.phone = '0532 111 22 33';
  contact.outOfArea = outOfArea;
  plan.contacts.push(contact);
  return contact;
}

function markBaseItems(plan: Plan, count: number): void {
  plan.bag.items = BASE_BAG_ITEM_IDS.slice(0, count).map((id) => ({ id, done: true, note: '' }));
}

const NEEDS_VISITED = new Set<number>([NEEDS_WIZARD_STEP]);

describe('§11.8 tablosu', () => {
  it('dokuz bölümü sabit sırayla listeler', () => {
    expect(PLAN_SECTIONS).toEqual([
      'household',
      'members',
      'needs',
      'contacts',
      'meeting',
      'home',
      'roles',
      'bag',
      'review',
    ]);
    expect(PLAN_SECTIONS).toHaveLength(9);
    expect(NEEDS_WIZARD_STEP).toBe(3);
  });

  it('boş planda dokuz bölüm de boştur', () => {
    const progress = computeProgress(createEmptyPlan());

    for (const section of PLAN_SECTIONS) {
      expect(progress.sections[section], section).toBe('bos');
    }
    expect(progress.filled).toBe(0);
    expect(progress.partial).toBe(0);
    expect(progress.empty).toBe(9);
    expect(progress.total).toBe(9);
  });

  it('ziyaret izni verilmezse "Özel ihtiyaçlar" boş kalır', () => {
    const plan = createEmptyPlan();
    addMember(plan);

    expect(computeProgress(plan).sections.needs).toBe('bos');
    expect(sectionStatus(plan, 'needs')).toBe('bos');
  });
});

describe('Hane', () => {
  it('etiket ve adres doluysa dolu', () => {
    const plan = createEmptyPlan();
    plan.household.label = 'Yılmaz ailesi';
    plan.household.address = 'Örnek Mahallesi 12. Sokak No 3';

    expect(sectionStatus(plan, 'household')).toBe('dolu');
  });

  it('yalnızca biri doluysa kısmen', () => {
    const plan = createEmptyPlan();
    plan.household.label = 'Yılmaz ailesi';

    expect(sectionStatus(plan, 'household')).toBe('kismen');
  });

  it('yalnızca bina notu ya da kat sayısı doluysa kısmen', () => {
    const plan = createEmptyPlan();
    plan.household.buildingNote = '4. kat, asansörlü';

    expect(sectionStatus(plan, 'household')).toBe('kismen');

    plan.household.floorCount = '4';
    expect(sectionStatus(plan, 'household')).toBe('kismen');
  });

  it('hiçbir alan dolu değilse boş', () => {
    expect(sectionStatus(createEmptyPlan(), 'household')).toBe('bos');
  });
});

describe('Kişiler', () => {
  it('en az bir kişi ve bütün adlar doluysa dolu', () => {
    const plan = createEmptyPlan();
    addMember(plan);
    addMember(plan, 'cocuk', 'Mehmet Yılmaz');

    expect(sectionStatus(plan, 'members')).toBe('dolu');
  });

  it('adı boş kişi varsa kısmen', () => {
    const plan = createEmptyPlan();
    addMember(plan);
    addMember(plan, 'bebek', '');

    expect(sectionStatus(plan, 'members')).toBe('kismen');
  });

  it('kişi yoksa boş', () => {
    expect(sectionStatus(createEmptyPlan(), 'members')).toBe('bos');
  });
});

describe('Özel ihtiyaçlar', () => {
  it('adım ziyaret edildiyse dolu', () => {
    const plan = createEmptyPlan();
    addMember(plan);

    expect(sectionStatus(plan, 'needs', NEEDS_VISITED)).toBe('dolu');
    expect(computeProgress(plan, NEEDS_VISITED).sections.needs).toBe('dolu');
  });

  it('adım ziyaret edilmediyse ama sağlık izni açıksa kısmen', () => {
    const plan = createEmptyPlan();
    addMember(plan);
    plan.healthOptIn = true;

    expect(sectionStatus(plan, 'needs')).toBe('kismen');
  });

  it('adım ziyaret edilmediyse ama ihtiyaç işaretliyse kısmen', () => {
    const plan = createEmptyPlan();
    const member = addMember(plan);
    member.needs.hearing = true;

    expect(sectionStatus(plan, 'needs')).toBe('kismen');
  });

  it('ihtiyaç notu doluysa kısmen', () => {
    const plan = createEmptyPlan();
    const member = addMember(plan);
    member.needs.note = 'Merdiven inerken destek gerekir';

    expect(sectionStatus(plan, 'needs')).toBe('kismen');
  });

  it('ziyaret ve veri yoksa boş', () => {
    const plan = createEmptyPlan();
    addMember(plan);

    expect(sectionStatus(plan, 'needs')).toBe('bos');
  });
});

describe('Acil kişiler', () => {
  it('telefonu olan kişi ve şehir dışı kişi varsa dolu', () => {
    const plan = createEmptyPlan();
    addContact(plan);
    addContact(plan, true);

    expect(sectionStatus(plan, 'contacts')).toBe('dolu');
  });

  it('telefonu olan kişi var, şehir dışı kişi yoksa kısmen', () => {
    const plan = createEmptyPlan();
    addContact(plan);

    expect(sectionStatus(plan, 'contacts')).toBe('kismen');
  });

  it('şehir dışı irtibat kişisinin ikinci telefonu tek başına yeterlidir', () => {
    const plan = createEmptyPlan();
    const contact = addContact(plan, true);
    contact.phone = '';
    contact.phoneAlt = '0532 111 22 33';

    expect(sectionStatus(plan, 'contacts')).toBe('dolu');
  });

  it('kişi yoksa boş', () => {
    expect(sectionStatus(createEmptyPlan(), 'contacts')).toBe('bos');
  });

  it('telefonsuz ya da adsız kişi "kişi telefonuyla" sayılmaz', () => {
    const plan = createEmptyPlan();
    const noPhone = addContact(plan, true);
    noPhone.phone = '';

    expect(sectionStatus(plan, 'contacts')).toBe('bos');

    noPhone.phone = '0532 111 22 33';
    noPhone.name = '';
    expect(sectionStatus(plan, 'contacts')).toBe('bos');
  });
});

describe('Buluşma', () => {
  it('ev yakını ve mahalle dolu, toplanma alanı da doluysa dolu', () => {
    const plan = createEmptyPlan();
    plan.meeting.nearHome.label = 'Park';
    plan.meeting.neighborhood.label = 'Okul bahçesi';
    plan.meeting.assemblyArea.label = 'Kongre meydanı';

    expect(sectionStatus(plan, 'meeting')).toBe('dolu');
  });

  it('ev yakını ve mahalle dolu, toplanma alanı boşsa kısmen', () => {
    const plan = createEmptyPlan();
    plan.meeting.nearHome.label = 'Park';
    plan.meeting.neighborhood.label = 'Okul bahçesi';

    expect(sectionStatus(plan, 'meeting')).toBe('kismen');
  });

  it('başka bir buluşma yeri girildiyse kısmen', () => {
    const plan = createEmptyPlan();
    plan.meeting.outOfArea.label = 'Teyzenin evi';
    plan.meeting.outOfArea.detail = 'İzmir';

    expect(sectionStatus(plan, 'meeting')).toBe('kismen');
  });

  it('yalnızca tarif girildiyse kısmen', () => {
    const plan = createEmptyPlan();
    plan.meeting.outOfArea.detail = 'İzmir, Karşıyaka';

    expect(sectionStatus(plan, 'meeting')).toBe('kismen');
  });

  it('hiçbiri dolu değilse boş', () => {
    expect(sectionStatus(createEmptyPlan(), 'meeting')).toBe('bos');
  });
});

describe('Ev', () => {
  it('güvenli yer ve üç vana/şalter alanından ikisi doluysa dolu', () => {
    const plan = createEmptyPlan();
    plan.home.safeSpots = ['Salon: sağlam masa altı'];
    plan.home.utilities.gas = 'Mutfakta';
    plan.home.utilities.water = 'Banyoda';

    expect(sectionStatus(plan, 'home')).toBe('dolu');
  });

  it('güvenli yer var ama vana/şalter alanı bir taneyse kısmen', () => {
    const plan = createEmptyPlan();
    plan.home.safeSpots = ['Salon: sağlam masa altı'];
    plan.home.utilities.gas = 'Mutfakta';

    expect(sectionStatus(plan, 'home')).toBe('kismen');
  });

  it('yalnızca vana/şalter yerleri doluysa kısmen', () => {
    const plan = createEmptyPlan();
    plan.home.utilities.gas = 'Mutfakta';
    plan.home.utilities.water = 'Banyoda';

    expect(sectionStatus(plan, 'home')).toBe('kismen');
  });

  it('yalnızca çıkış yolu doluysa kısmen', () => {
    const plan = createEmptyPlan();
    plan.home.exits = ['Ana kapı'];

    expect(sectionStatus(plan, 'home')).toBe('kismen');
  });

  it('yalnızca tehlike avı işaretliyse kısmen', () => {
    const plan = createEmptyPlan();
    plan.home.hazards = [{ id: 'H-01', done: true, note: '' }];

    expect(sectionStatus(plan, 'home')).toBe('kismen');
  });

  it('hiçbiri dolu değilse boş', () => {
    expect(sectionStatus(createEmptyPlan(), 'home')).toBe('bos');
  });
});

describe('Görevler', () => {
  it('en az bir rol atanmışsa dolu', () => {
    const plan = createEmptyPlan();
    const member = addMember(plan);
    plan.roles.push({ roleId: 'canta', memberId: member.id, note: '' });

    expect(sectionStatus(plan, 'roles')).toBe('dolu');
  });

  it('rol satırı var ama atama yoksa kısmen', () => {
    const plan = createEmptyPlan();
    plan.roles.push({ roleId: 'canta', memberId: null, note: 'Yatak odasında' });

    expect(sectionStatus(plan, 'roles')).toBe('kismen');
  });

  it('rol yoksa boş', () => {
    expect(sectionStatus(createEmptyPlan(), 'roles')).toBe('bos');
  });
});

describe('Çanta ve belgeler', () => {
  it('çanta yeri dolu ve temel maddelerin en az yarısı işaretliyse dolu', () => {
    const plan = createEmptyPlan();
    plan.bag.location = 'Giriş dolabı';
    markBaseItems(plan, 9);

    expect(sectionStatus(plan, 'bag')).toBe('dolu');
  });

  it('temel maddelerin yarısından azı işaretliyse kısmen', () => {
    const plan = createEmptyPlan();
    plan.bag.location = 'Giriş dolabı';
    markBaseItems(plan, 8);

    expect(sectionStatus(plan, 'bag')).toBe('kismen');
  });

  it('yalnızca çanta yeri doluysa kısmen', () => {
    const plan = createEmptyPlan();
    plan.bag.location = 'Giriş dolabı';

    expect(sectionStatus(plan, 'bag')).toBe('kismen');
  });

  it('çanta yeri olmadan işaretli temel madde varsa kısmen', () => {
    const plan = createEmptyPlan();
    markBaseItems(plan, 3);

    expect(sectionStatus(plan, 'bag')).toBe('kismen');
  });

  it('işaretsiz temel maddeler dolu sayılmaz', () => {
    const plan = createEmptyPlan();
    plan.bag.location = 'Giriş dolabı';
    plan.bag.items = BASE_BAG_ITEM_IDS.slice(0, 9).map((id) => ({ id, done: false, note: '' }));

    expect(sectionStatus(plan, 'bag')).toBe('kismen');
  });

  it('yalnızca belge kopyası işaretliyse kısmen', () => {
    const plan = createEmptyPlan();
    plan.documents = [{ id: 'B-01', done: true, note: '' }];

    expect(sectionStatus(plan, 'bag')).toBe('kismen');
  });

  it('son kontrol tarihi girildiyse kısmen', () => {
    const plan = createEmptyPlan();
    plan.bag.lastCheckedAt = '2026-10-01';

    expect(sectionStatus(plan, 'bag')).toBe('kismen');
  });

  it('özel maddeler temel madde sayılmaz', () => {
    const plan = createEmptyPlan();
    plan.bag.location = 'Giriş dolabı';
    plan.bag.items = Array.from({ length: 9 }, () => ({
      id: `ozel-${crypto.randomUUID()}`,
      done: true,
      note: '',
    }));

    expect(sectionStatus(plan, 'bag')).toBe('kismen');
  });

  it('hiçbiri dolu değilse boş', () => {
    expect(sectionStatus(createEmptyPlan(), 'bag')).toBe('bos');
  });
});

describe('Gözden geçirme', () => {
  it('sonraki gözden geçirme tarihi doluysa dolu', () => {
    const plan = createEmptyPlan();
    plan.review.nextReviewAt = '2027-05-01';

    expect(sectionStatus(plan, 'review')).toBe('dolu');
  });

  it('yalnızca tatbikat tarihi doluysa kısmen', () => {
    const plan = createEmptyPlan();
    plan.review.lastDrillAt = '2026-05-01';

    expect(sectionStatus(plan, 'review')).toBe('kismen');
  });

  it('tarih yoksa boş', () => {
    expect(sectionStatus(createEmptyPlan(), 'review')).toBe('bos');
  });
});

describe('computeProgress özeti', () => {
  function filledPlan(): Plan {
    const plan = createEmptyPlan();
    plan.household.label = 'Yılmaz ailesi';
    plan.household.address = 'Örnek Mahallesi 12. Sokak No 3';
    const member = addMember(plan);
    addContact(plan, true);
    plan.meeting.nearHome.label = 'Park';
    plan.meeting.neighborhood.label = 'Okul bahçesi';
    plan.meeting.assemblyArea.label = 'Kongre meydanı';
    plan.home.safeSpots = ['Salon: sağlam masa altı'];
    plan.home.utilities.gas = 'Mutfakta';
    plan.home.utilities.water = 'Banyoda';
    plan.roles.push({ roleId: 'canta', memberId: member.id, note: '' });
    plan.bag.location = 'Giriş dolabı';
    markBaseItems(plan, 12);
    plan.review.nextReviewAt = '2027-05-01';
    return plan;
  }

  it('dolu planın dokuz bölümü de doludur', () => {
    const progress = computeProgress(filledPlan(), NEEDS_VISITED);

    for (const section of PLAN_SECTIONS) {
      expect(progress.sections[section], section).toBe('dolu');
    }
    expect(progress.filled).toBe(9);
    expect(progress.partial).toBe(0);
    expect(progress.empty).toBe(0);
  });

  it('bölüm durumlarını ve sayıları birlikte döndürür', () => {
    const plan = createEmptyPlan();
    plan.household.label = 'Yılmaz ailesi';
    plan.household.address = 'Örnek Mahallesi 12. Sokak No 3';
    addMember(plan);
    plan.meeting.nearHome.label = 'Park';
    plan.meeting.neighborhood.label = 'Okul bahçesi';
    plan.meeting.assemblyArea.label = 'Kongre meydanı';
    plan.home.safeSpots = ['Salon'];

    const progress = computeProgress(plan, NEEDS_VISITED);

    expect(progress.sections).toEqual({
      household: 'dolu',
      members: 'dolu',
      needs: 'dolu',
      contacts: 'bos',
      meeting: 'dolu',
      home: 'kismen',
      roles: 'bos',
      bag: 'bos',
      review: 'bos',
    } satisfies Record<(typeof PLAN_SECTIONS)[number], SectionStatus>);
    expect(progress.filled).toBe(4);
    expect(progress.partial).toBe(1);
    expect(progress.empty).toBe(4);
    expect(progress.total).toBe(9);
  });

  it('planı değiştirmez', () => {
    const plan = filledPlan();
    const before = JSON.stringify(plan);

    computeProgress(plan, NEEDS_VISITED);
    computeProgress(plan);

    expect(JSON.stringify(plan)).toBe(before);
  });

  it('yalnızca boşluk içeren metinleri dolu saymaz', () => {
    const plan = createEmptyPlan();
    plan.household.label = '   ';
    plan.household.address = '\n';

    expect(computeProgress(plan).sections.household).toBe('bos');
  });
});
