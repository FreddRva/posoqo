import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  className = ''
}) => {
  return (
    <div className={`section-header ${className}`}>
      {icon && (
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2 glass-gold rounded-lg">
            {icon}
          </div>
          <span className="text-gold font-black tracking-[0.3em] text-sm md:text-base uppercase">
            {subtitle}
          </span>
        </div>
      )}
      
      <h2 className="section-title">
        {title}
      </h2>
      
      <div className="section-divider" />
    </div>
  );
};

export default SectionHeader;
