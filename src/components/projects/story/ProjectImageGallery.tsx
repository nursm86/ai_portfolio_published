'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Img = {
  id: number;
  src: string;
  alt: string;
  caption: string | null;
  layout: string; // "wide" | "half" | "mobile"
};

export default function ProjectImageGallery({ images }: { images: Img[] }) {
  const [lightbox, setLightbox] = useState<Img | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox]);

  if (images.length === 0) return null;

  // Group half-layout images into pairs for 2-col rendering.
  const blocks: Array<{ type: 'solo' | 'pair'; items: Img[] }> = [];
  let pendingHalf: Img | null = null;
  for (const img of images) {
    if (img.layout === 'half') {
      if (pendingHalf) {
        blocks.push({ type: 'pair', items: [pendingHalf, img] });
        pendingHalf = null;
      } else {
        pendingHalf = img;
      }
    } else {
      if (pendingHalf) {
        blocks.push({ type: 'solo', items: [pendingHalf] });
        pendingHalf = null;
      }
      blocks.push({ type: 'solo', items: [img] });
    }
  }
  if (pendingHalf) blocks.push({ type: 'solo', items: [pendingHalf] });

  return (
    <>
      <div className="space-y-6">
        {blocks.map((block, bi) => {
          if (block.type === 'pair') {
            return (
              <div key={bi} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {block.items.map((img) => (
                  <GalleryImage
                    key={img.id}
                    img={img}
                    onOpen={() => setLightbox(img)}
                  />
                ))}
              </div>
            );
          }
          const img = block.items[0];
          const isMobile = img.layout === 'mobile';
          return (
            <div
              key={bi}
              className={isMobile ? 'flex justify-center' : 'w-full'}
            >
              <div className={isMobile ? 'max-w-sm' : 'w-full'}>
                <GalleryImage img={img} onOpen={() => setLightbox(img)} />
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-[95vw] overflow-auto"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              />
              {lightbox.caption && (
                <p className="mt-4 text-center text-sm text-white/70">
                  {lightbox.caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function GalleryImage({ img, onOpen }: { img: Img; onOpen: () => void }) {
  return (
    <figure className="group">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      </button>
      {img.caption && (
        <figcaption className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
          {img.caption}
        </figcaption>
      )}
    </figure>
  );
}
