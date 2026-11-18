import React, { useState } from 'react';

interface LetsTalkButtonProps {
  className?: string;
  href?: string;
}

// function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
//   return (
//     <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
//       <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.7C7.02 10.92 7.91 12.1 8.03 12.27C8.16 12.44 9.77 14.93 12.24 16C12.83 16.25 13.28 16.4 13.64 16.51C14.23 16.7 14.77 16.67 15.2 16.61C15.68 16.54 16.68 16.01 16.89 15.42C17.1 14.83 17.1 14.33 17.04 14.22C16.98 14.11 16.81 14.05 16.56 13.92C16.31 13.79 15.08 13.18 14.85 13.1C14.62 13.01 14.46 12.97 14.29 13.22C14.12 13.47 13.65 14.03 13.5 14.2C13.36 14.37 13.22 14.39 12.97 14.27C12.72 14.14 11.91 13.88 10.95 13.02C10.2 12.35 9.7 11.53 9.55 11.28C9.41 11.03 9.53 10.89 9.66 10.76C9.77 10.65 9.91 10.47 10.04 10.32C10.17 10.17 10.21 10.06 10.29 9.9C10.37 9.74 10.33 9.6 10.27 9.48C10.21 9.36 9.71 8.14 9.5 7.64C9.3 7.15 9.09 7.22 8.94 7.21C8.79 7.2 8.62 7.2 8.53 7.33Z" />
//     </svg>
//   );
// }

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
      className={`group/btn relative inline-flex items-center justify-center gap-2 rounded-full bg-white text-black text-sm font-bold pl-5 pr-5 h-11 hover:bg-white/90 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 cursor-pointer select-none ${className}`}
    >
      {/* <WhatsAppIcon className="w-4 h-4 shrink-0 text-[#25D366] group-hover/btn:scale-110 transition-transform duration-200" /> */}
      <span>Lets Talk!</span>
      {isHovered && (
        <span className="inline-flex items-center justify-center animate-in fade-in zoom-in-75 duration-200">
          <span
            className="inline-block origin-[70%_70%]"
            style={{
              animation: 'wave-hand 0.8s ease-in-out 3',
            }}
          >
            👋
          </span>
        </span>
      )}
    </a>
  );
};
