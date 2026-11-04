import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ProjectTagProps {
  tag: string;
  className?: string;
}

export function ProjectTag({ tag, className }: ProjectTagProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] uppercase tracking-widest font-semibold border-white/10 text-white rounded-[8px] px-2.5 py-1.5 bg-transparent shrink-0",
        className
      )}
    >
      {tag}
    </Badge>
  );
}

export interface ProjectTagsProps {
  tags: string[];
  layoutId?: string;
  className?: string;
  tagClassName?: string;
}

export function ProjectTags({ tags, layoutId, className, tagClassName }: ProjectTagsProps) {
  if (!tags || tags.length === 0) return null;

  const containerClasses = cn("flex flex-wrap gap-2 lg:gap-3", className);

  if (layoutId) {
    return (
      <motion.div
        layoutId={layoutId}
        className={containerClasses}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
        {tags.map((tag) => (
          <ProjectTag key={tag} tag={tag} className={tagClassName} />
        ))}
      </motion.div>
    );
  }

  return (
    <div className={containerClasses}>
      {tags.map((tag) => (
        <ProjectTag key={tag} tag={tag} className={tagClassName} />
      ))}
    </div>
  );
}
