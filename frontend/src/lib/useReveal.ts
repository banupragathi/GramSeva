import { useEffect, useRef, useState, RefObject } from "react";

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.2
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // If intersection observer is not supported or prefers-reduced-motion is on
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return [ref, isRevealed];
}
