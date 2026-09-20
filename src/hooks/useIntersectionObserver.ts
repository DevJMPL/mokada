import { useEffect, useRef, useState, RefObject } from 'react';

interface Args {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

export function useIntersectionObserver(options?: Args): [RefObject<HTMLDivElement | null>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  // Using any to avoid complicated type errors with HTMLDivElement vs general Element,
  // but typed return explicitly for easier use in React divs
  const ref = useRef<any>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options?.threshold, options?.root, options?.rootMargin]);

  return [ref, isIntersecting];
}
