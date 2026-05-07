import { useEffect, useRef } from 'react';

interface Props {
  imageUrl: string;
  alt: string;
}

export default function HeroParallax({ imageUrl, alt }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const offset = window.scrollY * 0.25;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 will-change-transform">
      <img src={imageUrl} alt={alt} className="h-full w-full object-cover" loading="eager" />
    </div>
  );
}
