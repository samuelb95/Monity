import { useEffect, useRef, useState } from 'react';

export const useInViewAnimation = () => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenInView) {
          // Ne déclencher l'animation que la première fois
          setIsInView(true);
          setHasBeenInView(true);
        } else if (!entry.isIntersecting && hasBeenInView) {
          // Une fois que l'élément a été vu, ne pas relancer l'animation
          setIsInView(false);
        }
      },
      {
        threshold: 0.5, // Déclenche quand 50% de l'élément est visible
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [hasBeenInView]);

  return { ref, isInView, hasBeenInView };
};
