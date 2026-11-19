/**
 * Şartname §11.4, §8.2 — sihirbaz alan doğrulaması.
 *
 * Tek kural kümesi: "İleri" denetimi de, alan terk edildiğinde yapılan denetim
 * de buradan geçer. Sınırlar `PLAN_LIMITS` sabitlerinden gelir; elle sayı
 * yazılmaz (§8.2). Metinler `tr.wizard.errors.*` altındadır.
 *
 * Zorunlu tek alan 2. adımda "en az bir kişinin adı"dır (§11.4). Diğer
 * adımlarda zorunlu alan yoktur; yalnızca sınır ve biçim denetimi yapılır.
 */
import { formatText, tr } from '../../../i18n/tr.ts';
import type { Place, Plan } from '../../../model/types.ts';
import { PLAN_LIMITS } from '../../../model/validate.ts';
import { isIsoDateString } from './dates.ts';
import { FIELD_IDS } from './fieldIds.ts';
import type { WizardStep } from './steps.ts';

/** Hatalı alan: DOM kimliği + kullanıcıya görünen ileti (§11.4). */
export interface WizardFieldError {
  id: string;
  message: string;
}

/** §8.2 — telefon yalnızca rakam, boşluk, `+`, `-`, `(`, `)` karakterlerini taşır. */
const PHONE_CHARACTERS = /^[\d +()-]+$/;

const tooLongMessage = (max: number): string => formatText(tr.wizard.errors.tooLong, { max });

const textError = (id: string, value: string, max: number): WizardFieldError | undefined =>
  [...value].length > max ? { id, message: tooLongMessage(max) } : undefined;

const phoneError = (id: string, value: string): WizardFieldError | undefined => {
  const text = value.trim();
  if (text === '') return undefined;
  const length = [...text].length;
  if (!PHONE_CHARACTERS.test(text)) {
    return { id, message: tr.wizard.errors.phoneCharacters };
  }
  if (length < PLAN_LIMITS.phoneMinLength) {
    return {
      id,
      message: formatText(tr.wizard.errors.phoneShort, { min: PLAN_LIMITS.phoneMinLength }),
    };
  }
  if (length > PLAN_LIMITS.phoneMaxLength) {
    return {
      id,
      message: formatText(tr.wizard.errors.phoneLong, { max: PLAN_LIMITS.phoneMaxLength }),
    };
  }
  return undefined;
};

const dateError = (id: string, value: string | null): WizardFieldError | undefined => {
  if (value === null || value === '') return undefined;
  return isIsoDateString(value) ? undefined : { id, message: tr.wizard.errors.dateInvalid };
};

function push(errors: WizardFieldError[], error: WizardFieldError | undefined): void {
  if (error !== undefined) errors.push(error);
}

function pushPlace(
  errors: WizardFieldError[],
  labelId: string,
  detailId: string,
  place: Place,
): void {
  push(errors, textError(labelId, place.label, PLAN_LIMITS.nameLength));
  push(errors, textError(detailId, place.detail, PLAN_LIMITS.shortTextLength));
}

function validateHousehold(plan: Plan, errors: WizardFieldError[]): void {
  push(errors, textError(FIELD_IDS.householdLabel, plan.household.label, PLAN_LIMITS.nameLength));
  push(
    errors,
    textError(FIELD_IDS.householdAddress, plan.household.address, PLAN_LIMITS.shortTextLength),
  );
  push(
    errors,
    textError(
      FIELD_IDS.householdBuildingNote,
      plan.household.buildingNote,
      PLAN_LIMITS.shortTextLength,
    ),
  );
}

function validateMembers(plan: Plan, errors: WizardFieldError[]): void {
  // §11.4 — zorunlu tek alan: en az bir kişinin adı.
  if (!plan.members.some((member) => member.name.trim() !== '')) {
    errors.push({
      id: FIELD_IDS.memberName(0),
      message: tr.wizard.errors.requiredMemberName,
    });
  }
  plan.members.forEach((member, index) => {
    push(errors, textError(FIELD_IDS.memberName(index), member.name, PLAN_LIMITS.nameLength));
    push(errors, phoneError(FIELD_IDS.memberPhone(index), member.phone));
    member.dailyPlaces.forEach((place, placeIndex) => {
      push(
        errors,
        textError(
          FIELD_IDS.dailyPlaceLabel(index, placeIndex),
          place.label,
          PLAN_LIMITS.nameLength,
        ),
      );
      push(errors, phoneError(FIELD_IDS.dailyPlacePhone(index, placeIndex), place.phone));
      push(
        errors,
        textError(
          FIELD_IDS.dailyPlaceNote(index, placeIndex),
          place.note,
          PLAN_LIMITS.shortTextLength,
        ),
      );
    });
  });
}

function validateNeeds(plan: Plan, errors: WizardFieldError[]): void {
  plan.members.forEach((member, index) => {
    push(
      errors,
      textError(FIELD_IDS.needsNote(index), member.needs.note, PLAN_LIMITS.shortTextLength),
    );
    if (!plan.healthOptIn || member.health === undefined) return;
    const health = member.health;
    push(
      errors,
      textError(FIELD_IDS.healthConditions(index), health.conditions, PLAN_LIMITS.longTextLength),
    );
    push(
      errors,
      textError(FIELD_IDS.healthMedications(index), health.medications, PLAN_LIMITS.longTextLength),
    );
    push(
      errors,
      textError(FIELD_IDS.healthAllergies(index), health.allergies, PLAN_LIMITS.longTextLength),
    );
    push(
      errors,
      textError(FIELD_IDS.healthDevices(index), health.devices, PLAN_LIMITS.longTextLength),
    );
  });
}

function validateContacts(plan: Plan, errors: WizardFieldError[]): void {
  plan.contacts.forEach((contact, index) => {
    push(errors, textError(FIELD_IDS.contactName(index), contact.name, PLAN_LIMITS.nameLength));
    push(
      errors,
      textError(FIELD_IDS.contactRelation(index), contact.relation, PLAN_LIMITS.nameLength),
    );
    push(errors, phoneError(FIELD_IDS.contactPhone(index), contact.phone));
    push(errors, phoneError(FIELD_IDS.contactPhoneAlt(index), contact.phoneAlt));
    push(errors, textError(FIELD_IDS.contactCity(index), contact.city, PLAN_LIMITS.nameLength));
  });
}

function validateMeeting(plan: Plan, errors: WizardFieldError[]): void {
  pushPlace(
    errors,
    FIELD_IDS.meetingNearHomeLabel,
    FIELD_IDS.meetingNearHomeDetail,
    plan.meeting.nearHome,
  );
  pushPlace(
    errors,
    FIELD_IDS.meetingNeighborhoodLabel,
    FIELD_IDS.meetingNeighborhoodDetail,
    plan.meeting.neighborhood,
  );
  pushPlace(
    errors,
    FIELD_IDS.meetingOutOfAreaLabel,
    FIELD_IDS.meetingOutOfAreaDetail,
    plan.meeting.outOfArea,
  );
  pushPlace(
    errors,
    FIELD_IDS.meetingAssemblyAreaLabel,
    FIELD_IDS.meetingAssemblyAreaDetail,
    plan.meeting.assemblyArea,
  );
  push(errors, dateError(FIELD_IDS.meetingAssemblyCheckedAt, plan.meeting.assemblyCheckedAt));
}

function validateHome(plan: Plan, errors: WizardFieldError[]): void {
  plan.home.safeSpots.forEach((spot, index) => {
    push(errors, textError(FIELD_IDS.safeSpot(index), spot, PLAN_LIMITS.shortTextLength));
  });
  plan.home.exits.forEach((exit, index) => {
    push(errors, textError(FIELD_IDS.exit(index), exit, PLAN_LIMITS.shortTextLength));
  });
  push(
    errors,
    textError(
      FIELD_IDS.utilityElectricity,
      plan.home.utilities.electricity,
      PLAN_LIMITS.shortTextLength,
    ),
  );
  push(
    errors,
    textError(FIELD_IDS.utilityGas, plan.home.utilities.gas, PLAN_LIMITS.shortTextLength),
  );
  push(
    errors,
    textError(FIELD_IDS.utilityWater, plan.home.utilities.water, PLAN_LIMITS.shortTextLength),
  );
}

function validateRoles(plan: Plan, errors: WizardFieldError[]): void {
  plan.roles.forEach((role) => {
    push(
      errors,
      textError(FIELD_IDS.roleNote(role.roleId), role.note, PLAN_LIMITS.shortTextLength),
    );
  });
}

function validateBag(plan: Plan, errors: WizardFieldError[]): void {
  push(errors, textError(FIELD_IDS.bagLocation, plan.bag.location, PLAN_LIMITS.shortTextLength));
  plan.bag.items.forEach((item) => {
    push(errors, textError(FIELD_IDS.bagItemNote(item.id), item.note, PLAN_LIMITS.shortTextLength));
  });
  plan.documents.forEach((document) => {
    push(
      errors,
      textError(FIELD_IDS.documentNote(document.id), document.note, PLAN_LIMITS.shortTextLength),
    );
  });
  plan.pets.forEach((pet, index) => {
    push(errors, textError(FIELD_IDS.petName(index), pet.name, PLAN_LIMITS.nameLength));
    push(errors, textError(FIELD_IDS.petKind(index), pet.kind, PLAN_LIMITS.shortTextLength));
    push(errors, textError(FIELD_IDS.petNote(index), pet.note, PLAN_LIMITS.shortTextLength));
  });
}

function validateReview(plan: Plan, errors: WizardFieldError[]): void {
  push(errors, dateError(FIELD_IDS.lastDrillAt, plan.review.lastDrillAt));
  push(errors, dateError(FIELD_IDS.nextReviewAt, plan.review.nextReviewAt));
  push(errors, textError(FIELD_IDS.notes, plan.notes, PLAN_LIMITS.longTextLength));
}

/** Adımın doğrulama hataları; görsel sırayla döner. */
export function validateWizardStep(step: WizardStep, plan: Plan): WizardFieldError[] {
  const errors: WizardFieldError[] = [];
  switch (step) {
    case 1: {
      validateHousehold(plan, errors);
      break;
    }
    case 2: {
      validateMembers(plan, errors);
      break;
    }
    case 3: {
      validateNeeds(plan, errors);
      break;
    }
    case 4: {
      validateContacts(plan, errors);
      break;
    }
    case 5: {
      validateMeeting(plan, errors);
      break;
    }
    case 6: {
      validateHome(plan, errors);
      break;
    }
    case 7: {
      validateRoles(plan, errors);
      break;
    }
    case 8: {
      validateBag(plan, errors);
      break;
    }
    case 9: {
      validateReview(plan, errors);
      break;
    }
    default: {
      break;
    }
  }
  return errors;
}
