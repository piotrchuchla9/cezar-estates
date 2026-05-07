export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] as const },
};

export const stagger = (delay = 0.08) => ({
  transition: { staggerChildren: delay },
});
