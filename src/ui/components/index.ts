/**
 * Şartname §7 — ortak arayüz bileşenleri, tek giriş noktası.
 *
 * Sayfalar bileşenleri **bu modülden** içe aktarmalıdır:
 *
 * ```tsx
 * import { Field, TextInput, type TextInputProps } from '../components/index.ts';
 * ```
 *
 * Stil dosyası (`src/styles/components.css`) burada bir kez yüklenir; böylece
 * bileşenleri kullanan her ekran ortak görünümü ve 44 × 44 px dokunma
 * hedeflerini (§15) alır. Bir bileşen dosyasını doğrudan içe aktaran kod
 * stil dosyasını yüklemez; bu yüzden bu giriş noktası tercih edilmelidir.
 */
import '../../styles/components.css';

export { focusElementById, getFocusableElements } from './a11y.ts';
export { Checkbox, type CheckboxProps } from './Checkbox.tsx';
export { joinClassNames } from './classNames.ts';
export { Dialog, type DialogProps } from './Dialog.tsx';
export {
  ErrorSummary,
  type ErrorSummaryItem,
  type ErrorSummaryProps,
} from './ErrorSummary.tsx';
export { Field, type FieldProps } from './Field.tsx';
export { FirstRunNotice, type FirstRunNoticeProps } from './FirstRunNotice.tsx';
export { Footer, type FooterProps } from './Footer.tsx';
export { Notice, type NoticeProps, type NoticeTone } from './Notice.tsx';
export {
  PHONE_MAX_LENGTH,
  PhoneInput,
  type PhoneInputProps,
  sanitizePhoneInput,
} from './PhoneInput.tsx';
export { RadioGroup, type RadioGroupProps, type RadioOption } from './RadioGroup.tsx';
export { Repeater, type RepeaterItem, type RepeaterProps } from './Repeater.tsx';
export { type SaveState, SaveStatus, type SaveStatusProps } from './SaveStatus.tsx';
export { SourceLink, type SourceLinkProps } from './SourceLink.tsx';
export { Stepper, type StepperProps } from './Stepper.tsx';
export { TextInput, type TextInputProps, type TextInputType } from './TextInput.tsx';
