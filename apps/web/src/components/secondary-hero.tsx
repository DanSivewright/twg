"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const SecondaryHero = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ["inset(10% round 0.75rem)", "inset(0.97% round 0.75rem)"]
  );

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);

  return (
    <section ref={sectionRef}>
      <div className="py-16 md:py-32">
        <div className="mx-auto mb-8 max-w-6xl px-6 lg:mb-12 lg:px-12">
          <h1 className="text-balance font-semibold text-4xl md:text-5xl">
            Protection engineered for workers who go beyond the ordinary
          </h1>
        </div>

        <motion.div
          className="perspective-near mx-auto aspect-3/2 max-w-7xl overflow-hidden md:aspect-video"
          style={{ clipPath }}
        >
          <motion.div className="size-full origin-center" style={{ scale }}>
            <video
              autoPlay
              className="size-full object-contain"
              loop
              muted
              playsInline
              src="/section-video.mp4"
            />
          </motion.div>
        </motion.div>

        <div className="mx-auto mt-8 max-w-6xl px-6 lg:mt-12 lg:px-12">
          <div className="grid gap-6 md:grid-cols-2 md:gap-12">
            <p className="text-muted-foreground">
              Our PPE range is{" "}
              <strong className="font-semibold text-foreground">
                tested to the highest international standards
              </strong>
              , covering cut-resistant gloves, respiratory masks, head
              protection, and fall arrest for the hazards crews face on every
              shift.
            </p>
            <p className="text-muted-foreground">
              From arc-flash ratings to variant sizing, our catalog{" "}
              <strong className="font-semibold text-foreground">
                unifies specs and compliance in one place
              </strong>
              , helping safety officers outfit teams with gear built to bring
              them home safely.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecondaryHero;
