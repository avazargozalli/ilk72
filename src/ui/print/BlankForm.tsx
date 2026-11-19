/**
 * Şartname §12.6 — **Boş form** (A4, 2 sayfa).
 *
 * Elle doldurulacak plan formu; plan oluşturmadan basılabilir ve **kişisel veri
 * içermez**. Bu yüzden bileşen `plan` almaz: yalnızca etiketler ve alt çizgili
 * boş satırlar basar. Apartman yöneticisi gibi kişiler formu çoğaltıp
 * dağıtabilir (§5).
 *
 * İki sayfa: 1) hane, kişiler, acil kişiler, buluşma yerleri; 2) ev, görevler,
 * çanta, belgeler, gözden geçirme, notlar. Her sayfanın altında §12'deki alt
 * bilgi satırı vardır.
 */
import { tr } from '../../i18n/tr.ts';
import { BlankLine, DocHeading, EmergencyBlock, PrintFoot, todayIso } from './parts.tsx';

export interface BlankFormProps {
  /** Alt bilgideki tarih (`YYYY-AA-GG`); verilmezse bugün. */
  date?: string;
}

/** Alt çizgili boş satır destesi (elle doldurulacak yer). */
function BlankLines({ count }: { count: number }) {
  return (
    <div class="print-blank-lines">
      {Array.from({ length: count }, (_unused, index) => (
        <span class="print-blank__line" key={`blank-line-${index}`} aria-hidden="true" />
      ))}
    </div>
  );
}

/** Başlıklı, alt çizgili boş satır grubu. */
function BlankGroup({ label, count }: { label: string; count: number }) {
  return (
    <div class="print-blank-group">
      <p class="print-blank__label">{label}</p>
      <BlankLines count={count} />
    </div>
  );
}

export function BlankForm({ date = todayIso() }: BlankFormProps) {
  return (
    <section class="print-doc print-doc--blank" aria-label={tr.print.documents.blankForm.title}>
      <DocHeading title={tr.print.documents.blankForm.title} />

      {/* 1. sayfa */}
      <div class="print-sheet">
        <p class="print-note">{tr.print.blankForm.intro}</p>
        <EmergencyBlock />

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.blankForm.household}</h3>
          <BlankLine label={tr.print.blankForm.householdLabel} />
          <BlankLine label={tr.print.blankForm.address} />
          <BlankLine label={tr.print.blankForm.buildingNote} />
        </div>

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.blankForm.members}</h3>
          <BlankGroup label={tr.print.blankForm.memberLine} count={5} />
        </div>

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.blankForm.contacts}</h3>
          <BlankGroup label={tr.print.blankForm.contactLine} count={4} />
        </div>

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.blankForm.meeting}</h3>
          <BlankLine label={tr.print.blankForm.nearHome} />
          <BlankLine label={tr.print.blankForm.neighborhood} />
          <BlankLine label={tr.print.blankForm.outOfAreaPlace} />
          <BlankLine label={tr.print.blankForm.assemblyArea} />
        </div>

        <PrintFoot date={date} />
      </div>

      {/* 2. sayfa */}
      <div class="print-sheet">
        <div class="print-section">
          <h3 class="print-section__title">{tr.print.blankForm.home}</h3>
          <BlankGroup label={tr.print.blankForm.safeSpotLine} count={3} />
          <BlankGroup label={tr.print.blankForm.exitLine} count={2} />
        </div>

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.blankForm.utilities}</h3>
          <BlankLine label={tr.print.blankForm.electricity} />
          <BlankLine label={tr.print.blankForm.gas} />
          <BlankLine label={tr.print.blankForm.water} />
        </div>

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.blankForm.roles}</h3>
          <BlankGroup label={tr.print.blankForm.roleLine} count={7} />
        </div>

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.blankForm.bag}</h3>
          <BlankLine label={tr.print.blankForm.bagLocation} />
          <BlankGroup label={tr.print.blankForm.bagItemLine} count={8} />
        </div>

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.blankForm.documents}</h3>
          <BlankGroup label={tr.print.blankForm.documentLine} count={5} />
        </div>

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.blankForm.review}</h3>
          <BlankLine label={tr.print.blankForm.lastDrillAt} />
          <BlankLine label={tr.print.blankForm.nextReviewAt} />
        </div>

        <div class="print-section">
          <h3 class="print-section__title">{tr.print.blankForm.notes}</h3>
          <BlankLines count={5} />
        </div>

        <PrintFoot date={date} />
      </div>
    </section>
  );
}
