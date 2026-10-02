"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function HeaderScrollWrapper({ children }: { children: ReactNode }) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const observer = new ResizeObserver(([entry]) => {
      setHeaderHeight(entry.contentRect.height);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={headerRef} className="fixed inset-x-0 top-0 z-40">
        {children}
      </div>
      <div aria-hidden="true" className="h-[69px] sm:h-[79px] lg:h-[97px]" style={headerHeight ? { height: headerHeight } : undefined} />
    </>
  );
}
