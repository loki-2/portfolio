import React, { useState } from 'react';

interface LetsTalkButtonProps {
  className?: string;
  href?: string;
}

export const LetsTalkButton: React.FC<LetsTalkButtonProps> = ({
  className = '',
  href = 'https://wa.me/+919391501588',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group/btn relative inline-flex items-center justify-center gap-1.5 rounded-full bg-white text-black text-sm font-bold px-5 h-11 hover:bg-white/90 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 cursor-pointer select-none ${className}`}
    >
      <span>Lets Talk!</span>
      <span
        className={`inline-flex items-center justify-center overflow-hidden transition-all duration-300 ease-out ${
          isHovered ? 'w-5 opacity-100 scale-100 ml-0.5' : 'w-0 opacity-0 scale-50 ml-0'
        }`}
      >
        <span
          className="inline-block origin-[70%_70%]"
          style={{
            animation: isHovered ? 'wave-hand 0.8s ease-in-out 3' : 'none',
          }}
        >
          👋
        </span>
      </span>
    </a>
  );
};
