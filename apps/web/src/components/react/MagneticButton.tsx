import type { PropsWithChildren } from 'react';
import { useRef, type CSSProperties } from 'react';

interface Props {
  href: string;
  className?: string;
  style?: CSSProperties;
}

export default function MagneticButton({ href, className, style, children }: PropsWithChildren<Props>) {
  const ref = useRef<HTMLAnchorElement>(null);

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (reduce || isTouch) return;

    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const max = 8;
    el.style.transform = `translate(${Math.max(-max, Math.min(max, dx * 0.15))}px, ${Math.max(-max, Math.min(max, dy * 0.15))}px)`;
  }

  function reset() {
    if (ref.current) ref.current.style.transform = '';
  }

  return (
    <a
      ref={ref}
      href={href}
      className={`inline-block transition-transform duration-200 ${className ?? ''}`}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </a>
  );
}
