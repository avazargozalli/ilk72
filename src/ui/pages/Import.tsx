/**
 * Şartname §10.3, §18.4-4 — gönderilen plan özetini açma sayfası.
 *
 * Akış:
 * 1. `decodeShare(payload)` → parola gerekiyorsa parola istenir → `validateCard`.
 * 2. Önizleme: özet metni birebir ve kart **düz metin** olarak gösterilir.
 * 3. İki seçenek: "Yalnızca görüntüle ve yazdır" (varsayılan) ve "Kendi planıma
 *    ekle". Birleştirme kişileri, acil kişileri ve buluşma yerlerini ekler;
 *    **çakışan alanlarda kullanıcıya sorar**, onay olmadan hiçbir alanı ezmez.
 * 4. Telefonlar yalnızca §8.2 karakter kümesine uyuyorsa `tel:` bağlantısı olur.
 * 5. İşlem bitince yük `history.replaceState` ile adres çubuğundan silinir.
 *
 * Sayfa depoyu tanımaz; birleştirme sonucu `onMerge` ile yukarıya verilir
 * (kaydetme tek sahipliğini uygulama kabuğu korur).
 */
import { useEffect, useState } from 'preact/hooks';
import { ROUTES } from '../../config.ts';
import { errorMessage, formatDate, tr } from '../../i18n/tr.ts';
import { createEmptyContact, createEmptyMember } from '../../model/defaults.ts';
import type { Contact, Member, Plan } from '../../model/types.ts';
import { PLAN_LIMITS } from '../../model/validate.ts';
import {
  decodeShare,
  type ShareCard,
  type ShareContact,
  type SharePerson,
  validateCard,
} from '../../share/index.ts';
import { Field, Notice, RadioGroup } from '../components/index.ts';
import { isFilled, toTelHref } from './pages/shared.ts';

export interface ImportProps {
  /** Adres çubuğundaki `#/al/<yük>` parçası (yönlendiriciden gelir). */
  payload: string;
  /** Kullanıcının kendi planı; yoksa birleştirme sunulmaz. */
  plan?: Plan | null;
  /** "Yalnızca görüntüle ve yazdır" seçildiğinde çağrılır. */
  onViewOnly?: () => void;
  /** Birleştirme onaylandığında temizlenmiş yeni planla çağrılır. */
  onMerge?: (merged: Plan) => void;
}

type Phase = 'loading' | 'password' | 'preview' | 'error';
type MergeMode = 'view' | 'merge';

/** §8.2 — telefon alanının izinli karakterleri. */
const PHONE_CHARACTERS = /^[\d +()-]+$/u;

/** Yük çözme hatalarının kodu; bilinmeyen hata genel iletiye düşer. */
function errorCode(error: unknown): string {
  return error instanceof Error ? error.message : '';
}

/**
 * §10.3/5 — içe alınan telefondan `tel:` bağlantısı. Yalnızca §8.2 karakter
 * kümesine ve 3–20 karakter aralığına uyan değerler bağlantı olur.
 */
function importedTelHref(phone: string): string | null {
  const text = phone.trim();
  const length = [...text].length;
  if (length < PLAN_LIMITS.phoneMinLength || length > PLAN_LIMITS.phoneMaxLength) return null;
  if (!PHONE_CHARACTERS.test(text)) return null;
  return toTelHref(text);
}

function normalized(value: string): string {
  return value.trim().toLocaleLowerCase('tr');
}

function memberFrom(person: SharePerson): Member {
  const template = createEmptyMember('yetiskin');
  return {
    ...template,
    name: person.a,
    phone: person.t,
    needs: { ...template.needs, note: person.o ?? '' },
  };
}

/** "Ad (ilişki)" biçimini ayırır; parantez yoksa ilişki boş kalır. */
function splitContactLabel(label: string): { name: string; relation: string } {
  const match = /^(.*?)\s*\(([^()]*)\)\s*$/u.exec(label);
  if (match === null) return { name: label.trim(), relation: '' };
  return { name: (match[1] ?? '').trim(), relation: (match[2] ?? '').trim() };
}

function contactFrom(person: ShareContact): Contact {
  const template = createEmptyContact();
  const label = splitContactLabel(person.a);
  return {
    ...template,
    name: label.name,
    relation: label.relation,
    phone: person.t,
    outOfArea: person.d,
    city: person.s,
  };
}

function contactLabels(contact: Contact): string[] {
  const labels: string[] = [];
  if (isFilled(contact.name)) labels.push(normalized(contact.name));
  if (isFilled(contact.relation)) {
    labels.push(normalized(contact.relation));
    if (isFilled(contact.name)) {
      labels.push(normalized(`${contact.name} (${contact.relation})`));
    }
  }
  return labels;
}

function findContactIndex(plan: Plan, label: string): number | undefined {
  const target = normalized(label);
  const index = plan.contacts.findIndex((contact) => contactLabels(contact).includes(target));
  return index < 0 ? undefined : index;
}

/** Birleştirmede kullanıcıya sorulacak çakışma. */
interface MergeConflict {
  id: string;
  /** Çakışmanın kimde olduğu (kişi adı ya da buluşma yeri başlığı). */
  subject: string;
  /** Çakışan alanın adı ("Telefon", "Şehir" …). */
  label: string;
  current: string;
  incoming: string;
  /** `true` seçilirse gönderilen değer uygulanır. */
  take: (draft: Plan) => void;
}

/** Birleştirme önizlemesi: eklemeler ve çakışmalar. */
interface MergePreview {
  conflicts: readonly MergeConflict[];
  build: (choices: Readonly<Record<string, boolean>>) => Plan;
}

const MEETING_FIELDS: ReadonlyArray<{
  key: 'nearHome' | 'neighborhood' | 'outOfArea' | 'assemblyArea';
  label: string;
  value: (card: ShareCard) => string;
}> = [
  { key: 'nearHome', label: tr.share.receive.fields.nearHome, value: (card) => card.b.e },
  { key: 'neighborhood', label: tr.share.receive.fields.neighborhood, value: (card) => card.b.m },
  { key: 'outOfArea', label: tr.share.receive.fields.outOfArea, value: (card) => card.b.d },
  { key: 'assemblyArea', label: tr.share.receive.fields.assemblyArea, value: (card) => card.b.t },
];

function clonePlan(plan: Plan): Plan {
  return {
    ...plan,
    members: plan.members.map((member) => ({ ...member, needs: { ...member.needs } })),
    contacts: plan.contacts.map((contact) => ({ ...contact })),
    meeting: {
      nearHome: { ...plan.meeting.nearHome },
      neighborhood: { ...plan.meeting.neighborhood },
      outOfArea: { ...plan.meeting.outOfArea },
      assemblyArea: { ...plan.meeting.assemblyArea },
      assemblyCheckedAt: plan.meeting.assemblyCheckedAt,
    },
  };
}

/** Bir buluşma yerinin kartla aynı biçimdeki tek satırlık gösterimi. */
function placeLine(label: string, detail: string): string {
  if (isFilled(label)) return isFilled(detail) ? `${label}, ${detail}` : label;
  return detail;
}

/**
 * §10.3/4 — kartı mevcut planla birleştirmeyi hazırlar.
 *
 * Eklemeler (planda olmayan kişi/telefon/şehir/buluşma yeri) doğrudan
 * uygulanır; **iki taraf da dolu ve farklı** olan her alan `conflicts`
 * listesine girer ve varsayılan seçim mevcut bilgiyi korumaktır.
 */
function buildMerge(plan: Plan, card: ShareCard): MergePreview {
  const additions: Array<(draft: Plan) => void> = [];
  const conflicts: MergeConflict[] = [];

  const memberIndex = new Map<string, number>();
  plan.members.forEach((member, index) => {
    if (isFilled(member.name)) memberIndex.set(normalized(member.name), index);
  });

  for (const person of card.k) {
    if (!isFilled(person.a) && !isFilled(person.t)) continue;
    const index = memberIndex.get(normalized(person.a));
    if (index === undefined) {
      additions.push((draft) => {
        if (draft.members.length < PLAN_LIMITS.members) draft.members.push(memberFrom(person));
      });
      continue;
    }

    const current = plan.members[index];
    if (current === undefined) continue;

    if (isFilled(person.t) && person.t !== current.phone) {
      if (!isFilled(current.phone)) {
        additions.push((draft) => {
          const member = draft.members[index];
          if (member !== undefined) member.phone = person.t;
        });
      } else {
        conflicts.push({
          id: `member-phone-${index}`,
          subject: current.name,
          label: tr.share.receive.fields.phone,
          current: current.phone,
          incoming: person.t,
          take: (draft) => {
            const member = draft.members[index];
            if (member !== undefined) member.phone = person.t;
          },
        });
      }
    }

    const note = person.o ?? '';
    if (isFilled(note) && note !== current.needs.note) {
      const label = tr.share.receive.fields.needsNote;
      if (isFilled(current.needs.note)) {
        conflicts.push({
          id: `member-note-${index}`,
          subject: current.name,
          label,
          current: current.needs.note,
          incoming: note,
          take: (draft) => {
            const member = draft.members[index];
            if (member !== undefined) member.needs.note = note;
          },
        });
      } else {
        additions.push((draft) => {
          const member = draft.members[index];
          if (member !== undefined) member.needs.note = note;
        });
      }
    }
  }

  for (const person of card.i) {
    if (!isFilled(person.a) && !isFilled(person.t)) continue;
    const index = findContactIndex(plan, person.a);
    if (index === undefined) {
      additions.push((draft) => {
        if (draft.contacts.length < PLAN_LIMITS.contacts) {
          draft.contacts.push(contactFrom(person));
        }
      });
      continue;
    }

    const current = plan.contacts[index];
    if (current === undefined) continue;
    const name = isFilled(current.name) ? current.name : current.relation;

    if (isFilled(person.t) && person.t !== current.phone && person.t !== current.phoneAlt) {
      if (!isFilled(current.phone)) {
        additions.push((draft) => {
          const contact = draft.contacts[index];
          if (contact !== undefined) contact.phone = person.t;
        });
      } else {
        conflicts.push({
          id: `contact-phone-${index}`,
          subject: name,
          label: tr.share.receive.fields.phone,
          current: current.phone,
          incoming: person.t,
          take: (draft) => {
            const contact = draft.contacts[index];
            if (contact !== undefined) contact.phone = person.t;
          },
        });
      }
    }

    if (isFilled(person.s) && person.s !== current.city) {
      const label = tr.share.receive.fields.city;
      if (isFilled(current.city)) {
        conflicts.push({
          id: `contact-city-${index}`,
          subject: name,
          label,
          current: current.city,
          incoming: person.s,
          take: (draft) => {
            const contact = draft.contacts[index];
            if (contact !== undefined) contact.city = person.s;
          },
        });
      } else {
        additions.push((draft) => {
          const contact = draft.contacts[index];
          if (contact !== undefined) contact.city = person.s;
        });
      }
    }

    // Şehir dışı işareti yalnızca gönderen "evet" dediyse ve mevcut kayıt
    // "hayır" ise sorulur; mevcut bilgiyi kendiliğinden kapatmayız.
    if (person.d && !current.outOfArea) {
      conflicts.push({
        id: `contact-out-of-area-${index}`,
        subject: name,
        label: tr.share.receive.fields.outOfAreaFlag,
        current: tr.share.receive.conflict.no,
        incoming: tr.share.receive.conflict.yes,
        take: (draft) => {
          const contact = draft.contacts[index];
          if (contact !== undefined) contact.outOfArea = true;
        },
      });
    }
  }

  for (const meeting of MEETING_FIELDS) {
    const incoming = meeting.value(card).trim();
    if (incoming === '') continue;
    const current = plan.meeting[meeting.key];
    const currentLine = placeLine(current.label, current.detail).trim();

    if (currentLine === '') {
      additions.push((draft) => {
        draft.meeting[meeting.key] = { label: incoming, detail: '' };
      });
    } else if (currentLine !== incoming) {
      conflicts.push({
        id: `meeting-${meeting.key}`,
        subject: tr.share.receive.fields.meeting,
        label: meeting.label,
        current: currentLine,
        incoming,
        take: (draft) => {
          draft.meeting[meeting.key] = { label: incoming, detail: '' };
        },
      });
    }
  }

  const build = (choices: Readonly<Record<string, boolean>>): Plan => {
    const draft = clonePlan(plan);
    for (const addition of additions) addition(draft);
    for (const conflict of conflicts) {
      if (choices[conflict.id] === true) conflict.take(draft);
    }
    draft.updatedAt = new Date().toISOString();
    return draft;
  };

  return { conflicts, build };
}

function ImportedPhone({ phone }: { phone: string }) {
  if (!isFilled(phone)) return null;
  const href = importedTelHref(phone);
  if (href === null) return <span class="phone-link">{phone}</span>;
  return (
    <a class="phone-link" href={href}>
      {phone}
    </a>
  );
}

function CardText({ card }: { card: ShareCard }) {
  const fields = tr.share.receive.fields;
  const empty = tr.share.receive.empty;

  return (
    <section class="import__preview" aria-labelledby="import-card-heading">
      <h2 id="import-card-heading">{tr.share.receive.cardTitle}</h2>

      <dl class="import__fields">
        <dt>{fields.household}</dt>
        <dd>{isFilled(card.h) ? card.h : empty}</dd>
        <dt>{fields.updated}</dt>
        <dd>{card.u === '' ? empty : formatDate(card.u)}</dd>
      </dl>

      <h3>{fields.members}</h3>
      {card.k.length === 0 ? (
        <p>{empty}</p>
      ) : (
        <ul class="import__list">
          {card.k.map((person, index) => (
            <li key={`person-${index}`}>
              <p>{isFilled(person.a) ? person.a : empty}</p>
              {isFilled(person.t) ? (
                <p>
                  <ImportedPhone phone={person.t} />
                </p>
              ) : null}
              {person.o === undefined ? null : <p>{person.o}</p>}
            </li>
          ))}
        </ul>
      )}

      <h3>{fields.contacts}</h3>
      {card.i.length === 0 ? (
        <p>{empty}</p>
      ) : (
        <ul class="import__list">
          {card.i.map((person, index) => (
            <li key={`contact-${index}`}>
              <p>{isFilled(person.a) ? person.a : empty}</p>
              {isFilled(person.t) ? (
                <p>
                  <ImportedPhone phone={person.t} />
                </p>
              ) : null}
              {person.d ? (
                <dl class="import__fields">
                  <dt>{fields.outOfAreaFlag}</dt>
                  <dd>{tr.share.receive.conflict.yes}</dd>
                  {isFilled(person.s) ? (
                    <>
                      <dt>{fields.city}</dt>
                      <dd>{person.s}</dd>
                    </>
                  ) : null}
                </dl>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <h3>{fields.meeting}</h3>
      <dl class="import__fields">
        {MEETING_FIELDS.map((meeting) => (
          <div key={meeting.key}>
            <dt>{meeting.label}</dt>
            <dd>{isFilled(meeting.value(card)) ? meeting.value(card) : empty}</dd>
          </div>
        ))}
      </dl>

      <h3>{fields.notes}</h3>
      <p>{isFilled(card.n) ? card.n : empty}</p>
    </section>
  );
}

export function Import({ payload, plan = null, onViewOnly, onMerge }: ImportProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [card, setCard] = useState<ShareCard | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<MergeMode>('view');
  const [choices, setChoices] = useState<Readonly<Record<string, boolean>>>({});
  const [finished, setFinished] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setPhase('loading');
    setCard(null);
    setLoadError(null);
    setPassword('');
    setPasswordError(null);
    setBusy(false);
    setMode('view');
    setChoices({});
    setFinished(null);

    const run = async (): Promise<void> => {
      if (payload === '') {
        if (!cancelled) {
          setLoadError('gecersiz-baglanti');
          setPhase('error');
        }
        return;
      }
      try {
        const data = await decodeShare(payload);
        if (cancelled) return;
        setCard(validateCard(data));
        setPhase('preview');
      } catch (error) {
        if (cancelled) return;
        const code = errorCode(error);
        if (code === 'parola-gerekli') {
          setPhase('password');
          return;
        }
        setLoadError(code);
        setPhase('error');
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [payload]);

  const submitPassword = async (): Promise<void> => {
    setBusy(true);
    setPasswordError(null);
    try {
      const data = await decodeShare(payload, password);
      setCard(validateCard(data));
      setPhase('preview');
    } catch (error) {
      const code = errorCode(error);
      if (code === 'parola-gerekli' || code === 'parola-yanlis-veya-bozuk') {
        setPasswordError(errorMessage(code));
      } else {
        setLoadError(code);
        setPhase('error');
      }
    } finally {
      setBusy(false);
    }
  };

  /** §10.3/6 — yükü adres çubuğundan siler; sayfa görünümü değişmez. */
  const finish = (message: string): void => {
    if (typeof history !== 'undefined' && typeof history.replaceState === 'function') {
      history.replaceState(null, '', ROUTES.home);
    }
    setFinished(message);
  };

  const handleView = (): void => {
    onViewOnly?.();
    if (typeof window !== 'undefined' && typeof window.print === 'function') window.print();
    finish(tr.share.receive.done);
  };

  const handleFinish = (): void => {
    finish(tr.share.receive.done);
  };

  const preview = card !== null && plan !== null ? buildMerge(plan, card) : null;

  const handleMerge = (): void => {
    if (preview === null) return;
    onMerge?.(preview.build(choices));
    finish(tr.share.receive.mergeDone);
  };

  if (phase === 'error') {
    return (
      <div class="page page--import">
        <h1 tabIndex={-1}>{tr.share.receive.title}</h1>
        <Notice tone="error" live="assertive">
          <p>{tr.share.receive.errorTitle}</p>
          <p>{errorMessage(loadError ?? '')}</p>
        </Notice>
        <p>
          <a class="button button--secondary" href={ROUTES.home}>
            {tr.common.backHome}
          </a>
        </p>
      </div>
    );
  }

  if (phase === 'password') {
    return (
      <div class="page page--import">
        <h1 tabIndex={-1}>{tr.share.receive.title}</h1>
        <p>{tr.share.receive.passwordPrompt}</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submitPassword();
          }}
        >
          <Field
            label={tr.share.receive.passwordLabel}
            hint={tr.share.receive.passwordHint}
            id="import-passphrase"
            error={passwordError ?? undefined}
          >
            <input
              class="text-input"
              id="import-passphrase"
              type="password"
              autocomplete="off"
              value={password}
              onInput={(event) => setPassword(event.currentTarget.value)}
            />
          </Field>
          <button class="button button--primary" type="submit" disabled={busy}>
            {tr.share.receive.submit}
          </button>
        </form>
      </div>
    );
  }

  if (phase === 'loading' || card === null) {
    return (
      <div class="page page--import">
        <h1 tabIndex={-1}>{tr.share.receive.title}</h1>
        <p role="status">{tr.share.receive.loading}</p>
      </div>
    );
  }

  return (
    <div class="page page--import">
      <h1 tabIndex={-1}>{tr.share.receive.title}</h1>
      <p class="import__intro">{tr.share.receive.intro}</p>

      <CardText card={card} />

      {plan === null ? <Notice tone="info">{tr.share.receive.noPlanNote}</Notice> : null}

      <RadioGroup
        legend={tr.share.receive.modeLegend}
        name="import-mode"
        value={mode}
        onChange={(value) => setMode(value === 'merge' ? 'merge' : 'view')}
        options={[
          { value: 'view', label: tr.share.receive.viewOnly },
          {
            value: 'merge',
            label: tr.share.receive.merge,
            hint: tr.share.receive.mergeHint,
            disabled: plan === null,
          },
        ]}
      />

      {mode === 'merge' && preview !== null && preview.conflicts.length > 0 ? (
        <section class="import__conflicts" aria-labelledby="import-conflicts-heading">
          <h2 id="import-conflicts-heading">{tr.share.receive.conflict.title}</h2>
          <p>{tr.share.receive.conflict.hint}</p>
          {preview.conflicts.map((conflict) => (
            <div class="import__conflict" key={conflict.id}>
              <p class="import__conflict-subject">{conflict.subject}</p>
              <p class="import__conflict-field">{conflict.label}</p>
              <dl class="import__fields">
                <dt>{tr.share.receive.conflict.currentLabel}</dt>
                <dd>{conflict.current}</dd>
                <dt>{tr.share.receive.conflict.incomingLabel}</dt>
                <dd>{conflict.incoming}</dd>
              </dl>
              <RadioGroup
                legend={conflict.label}
                name={`merge-conflict-${conflict.id}`}
                value={choices[conflict.id] === true ? 'take' : 'keep'}
                onChange={(value) =>
                  setChoices((current) => ({ ...current, [conflict.id]: value === 'take' }))
                }
                direction="horizontal"
                options={[
                  { value: 'keep', label: tr.share.receive.conflict.keep },
                  { value: 'take', label: tr.share.receive.conflict.take },
                ]}
              />
            </div>
          ))}
        </section>
      ) : null}

      <div class="button-row import__actions">
        {mode === 'merge' ? (
          <button
            class="button button--primary"
            type="button"
            disabled={busy || preview === null}
            onClick={handleMerge}
          >
            {tr.share.receive.mergeApply}
          </button>
        ) : (
          <button class="button button--primary" type="button" onClick={handleView}>
            {tr.share.receive.print}
          </button>
        )}
        <button class="button button--secondary" type="button" onClick={handleFinish}>
          {tr.share.receive.finish}
        </button>
      </div>

      {finished === null ? null : (
        <Notice tone="success" live="polite">
          {finished}
        </Notice>
      )}
    </div>
  );
}
