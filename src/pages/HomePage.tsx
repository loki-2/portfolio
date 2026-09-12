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
      const sections = Array.from(content.querySelectorAll('section[id]')) as HTMLElement[];
      if (sections.length === 0) return;
      const triggerY = content.scrollTop + content.clientHeight * 0.3;
      let active = sections[0].id;
      for (const section of sections) {
        if (section.offsetTop <= triggerY) active = section.id;
      }
      setActiveSection(active);
    };

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
