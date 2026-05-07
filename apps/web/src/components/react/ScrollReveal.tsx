import { motion, useInView } from 'motion/react';
import type { PropsWithChildren } from 'react';
import { useRef } from 'react';
import { fadeUp } from '~/lib/animations';

interface Props {
  delay?: number;
}

export default function ScrollReveal({ children, delay = 0 }: PropsWithChildren<Props>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={fadeUp.initial}
      animate={inView ? fadeUp.animate : fadeUp.initial}
      transition={{ ...fadeUp.transition, delay }}
    >
      {children}
    </motion.div>
  );
}
