import { tr } from '../../i18n/tr.ts';
import type { ShareQr } from '../../share/index.ts';

export function ShareQrImage({ qr, class: className }: { qr: ShareQr; class: string }) {
  return (
    <svg
      class={className}
      role="img"
      aria-label={tr.share.qr.label}
      viewBox={`0 0 ${qr.viewSize} ${qr.viewSize}`}
      shape-rendering="crispEdges"
    >
      <rect width={qr.viewSize} height={qr.viewSize} fill="#fff" />
      <path d={qr.path} fill="#000" />
    </svg>
  );
}
