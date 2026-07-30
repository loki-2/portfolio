import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ContentArea } from '@/components/ContentArea';

export function HomePage() {
  const [activeSection, setActiveSection] = useState<string>('work');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const updateActive = () => {
      // querySelectorAll on the outer div captures sections inside ContentArea too
      const sections = Array.from(content.querySelectorAll('section[id]')) as HTMLElement[];
      if (sections.length === 0) return;

      // The offset where we consider a section "active" — 30% down the viewport
      const triggerY = content.scrollTop + content.clientHeight * 0.3;

      // Walk from bottom to top, pick the first section whose top is at or above triggerY
      let active = sections[0].id;
      for (const section of sections) {
        if (section.offsetTop <= triggerY) {
          active = section.id;
        }
      }
      setActiveSection(active);
    };

    // Run once on mount then on every scroll
    updateActive();
    content.addEventListener('scroll', updateActive, { passive: true });
    return () => content.removeEventListener('scroll', updateActive);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const content = contentRef.current;
    const el = content?.querySelector(`#${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div
      ref={contentRef}
      className="flex flex-col lg:flex-row h-screen overflow-y-auto overflow-x-hidden bg-background text-foreground antialiased scroll-smooth"
    >
      <Sidebar activeSection={activeSection} scrollToSection={scrollToSection} />
      <div className="flex-1">
        <ContentArea />
      </div>
    </div>
  );
}
