import { useEffect, useRef, useState } from 'react';

export const useInViewAnimation = () => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasBeenInView(true);
        } else {
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
  }, []);

  return { ref, isInView, hasBeenInView };
};