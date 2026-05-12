import { ReactNode } from 'react';

interface Props {
  eyebrow?: string;
  heading: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  cta?: ReactNode;
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  heading,
  description,
  align = 'left',
  cta,
  className = '',
}: Props) {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <div className={`flex flex-col ${alignment} ${className}`}>
      <div className={`flex flex-col ${alignment} max-w-3xl ${align === 'center' ? 'mx-auto' : ''}`}>
        {eyebrow && (
          <div className={`flex items-center gap-2.5 mb-5 ${align === 'center' ? 'justify-center' : ''}`}>
            <span className="block w-8 h-px bg-[#C8102E]" />
            <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.3em] uppercase text-[#C8102E]">
              {eyebrow}
            </p>
          </div>
        )}
        <h2
          className="font-black text-gray-900 leading-[0.95] tracking-editorial"
          style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.5rem)' }}
        >
          {heading}
        </h2>
        {description && (
          <p className={`text-sm sm:text-base text-gray-500 leading-relaxed mt-5 ${align === 'center' ? 'max-w-xl' : 'max-w-lg'}`}>
            {description}
          </p>
        )}
      </div>
      {cta && <div className="mt-6 sm:mt-0">{cta}</div>}
    </div>
  );
}
