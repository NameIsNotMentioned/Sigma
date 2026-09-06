import React from 'react';

type BrandLogoProps = {
  isDarkTheme?: boolean;
  compact?: boolean;
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ isDarkTheme = false, compact = false }) => (
  <span className={`brand-logo${compact ? ' brand-logo-compact' : ''}${isDarkTheme ? ' is-dark' : ' is-light'} gap-2`}>
    <img
      src={`${import.meta.env.BASE_URL}favicon.svg`}
      alt="Unpack"
      width={64}
      height={64}
      className="brand-logo-image"
    />
    <span className="font-bold text-xl tracking-tight text-white">Unpack</span>
  </span>
);
