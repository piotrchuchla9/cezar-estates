import { useEffect, useRef, useState } from 'react';

interface Props { percent: number }

export default function ProgressBar({ percent }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setAnimated(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-1 w-full overflow-hidden rounded-sm bg-white/15">
      <div
        className="h-full bg-[var(--color-accent-soft)] transition-[width] duration-1200 ease-out"
        style={{ width: animated ? `${percent}%` : '0%' }}
      />
    </div>
  );
}
