import { useEffect, useState } from 'react';

interface Image { url: string; alt: string }
interface Props { images: Image[] }

export default function Gallery({ images }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? null : (i - 1 + images.length) % images.length));
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? null : (i + 1) % images.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, images.length]);

  useEffect(() => {
    document.body.style.overflow = open !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => setOpen(i)}
            className="aspect-square overflow-hidden bg-neutral-200"
            aria-label={`Otwórz zdjęcie ${i + 1}`}
          >
            <img src={img.url} alt={img.alt} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={(e) => { e.stopPropagation(); setOpen(null); }}
            aria-label="Zamknij"
          >×</button>
          <button
            type="button"
            className="absolute left-4 text-white text-4xl px-3"
            onClick={(e) => { e.stopPropagation(); setOpen((i) => i === null ? null : (i - 1 + images.length) % images.length); }}
            aria-label="Poprzednie"
          >‹</button>
          <img
            src={images[open]!.url.replace(/w=\d+/, 'w=1600')}
            alt={images[open]!.alt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="absolute right-4 text-white text-4xl px-3"
            onClick={(e) => { e.stopPropagation(); setOpen((i) => i === null ? null : (i + 1) % images.length); }}
            aria-label="Następne"
          >›</button>
        </div>
      )}
    </>
  );
}
