/**
 * Şartname §11.2, §15, §18.1 — `Dialog`.
 *
 * Ölçütler: `role="dialog"` + `aria-modal`, açılınca odak içeri taşınır,
 * `Esc` kapatır, `Tab`/`Shift+Tab` odak hapsi içinde döner ve kapanınca odak
 * açan öğeye geri verilir (§15).
 */
import { fireEvent, render, screen } from '@testing-library/preact';
import { useState } from 'preact/hooks';
import { describe, expect, it } from 'vitest';
import { tr } from '../../src/i18n/tr.ts';
import { Dialog } from '../../src/ui/components/index.ts';
import { buttonByName } from './helpers.tsx';

const TRIGGER = 'trigger';
const DIALOG_TITLE = 'dialog-title';
const DIALOG_DESCRIPTION = 'dialog-description';
const ACTION = 'confirm';

function DialogHarness() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        {TRIGGER}
      </button>
      <Dialog
        open={open}
        title={DIALOG_TITLE}
        description={DIALOG_DESCRIPTION}
        onClose={() => setOpen(false)}
        actions={
          <button type="button" onClick={() => setOpen(false)}>
            {ACTION}
          </button>
        }
      >
        <button type="button">body-action</button>
      </Dialog>
    </div>
  );
}

/** Kutuyu açar ve odağı tetikleyiciye önceden verir (gerçek tarayıcıda tıklama odaklar). */
function openDialog(): HTMLButtonElement {
  const trigger = buttonByName(TRIGGER);
  trigger.focus();
  fireEvent.click(trigger);
  return trigger;
}

describe('Dialog', () => {
  it('kapalıyken hiçbir şey çizmez', () => {
    render(<DialogHarness />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('açılınca role="dialog" ve aria-modal ile çizilir', () => {
    render(<DialogHarness />);
    openDialog();

    const dialog = screen.getByRole('dialog', { name: DIALOG_TITLE });

    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-describedby')).toBe(screen.getByText(DIALOG_DESCRIPTION).id);
    expect(screen.getByText('body-action')).not.toBeNull();
  });

  it('açılınca odağı kutunun içine taşır', () => {
    render(<DialogHarness />);
    openDialog();

    expect(document.activeElement).toBe(buttonByName(tr.components.dialog.close));
  });

  it('Esc ile kapanır', () => {
    render(<DialogHarness />);
    openDialog();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Kapat düğmesiyle kapanır', () => {
    render(<DialogHarness />);
    openDialog();

    fireEvent.click(buttonByName(tr.components.dialog.close));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Tab ile odak kutunun dışına çıkmaz', () => {
    render(<DialogHarness />);
    openDialog();

    const closeButton = buttonByName(tr.components.dialog.close);
    const lastButton = buttonByName(ACTION);

    lastButton.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(closeButton);

    closeButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(lastButton);
  });

  it('kapanınca odağı açan öğeye geri verir', () => {
    render(<DialogHarness />);
    const trigger = openDialog();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(document.activeElement).toBe(trigger);
  });
});
