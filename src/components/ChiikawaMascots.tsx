import React from 'react';

// Real Chiikawa reference illustrations uploaded by the user
export const REAL_CHIIKAWA_BG_1 = '/assets/aistudio/___08137b0b.jpg';
export const REAL_CHIIKAWA_BG_2 = '/assets/aistudio/____1__c061d0a5.jpg';

// Faithful Chiikawa-style portraits matching the uploaded reference illustrations
export function MascotChiikawa({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden="true">
      {/* Tiny round ears matching real Chiikawa */}
      <circle cx="33" cy="24" r="9.5" fill="#FFFFFF" stroke="#332520" strokeWidth="4" />
      <circle cx="87" cy="24" r="9.5" fill="#FFFFFF" stroke="#332520" strokeWidth="4" />
      {/* Round chubby head/body */}
      <ellipse cx="60" cy="60" rx="41" ry="37" fill="#FFFFFF" stroke="#332520" strokeWidth="4" />
      {/* Tiny raised eyebrows */}
      <path d="M40 43 Q43 40 46 42" fill="none" stroke="#332520" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M74 42 Q77 40 80 43" fill="none" stroke="#332520" strokeWidth="2.4" strokeLinecap="round" />
      {/* Large glossy eyes */}
      <ellipse cx="44" cy="54" rx="5.5" ry="6" fill="#332520" />
      <ellipse cx="43.5" cy="52" rx="2.3" ry="2.2" fill="#FFFFFF" />
      <path d="M41.5 57.5 Q44 59 46.5 57.5" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="76" cy="54" rx="5.5" ry="6" fill="#332520" />
      <ellipse cx="75.5" cy="52" rx="2.3" ry="2.2" fill="#FFFFFF" />
      <path d="M73.5 57.5 Q76 59 78.5 57.5" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
      {/* Pink oval cheeks + authentic 4 diagonal blush hatch marks */}
      <ellipse cx="30" cy="64" rx="8.5" ry="5" fill="#F8A8B8" opacity="0.85" />
      <path d="M25 66 L27.5 62 M28.5 66 L31 62 M32 66 L34.5 62" stroke="#D96B88" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="90" cy="64" rx="8.5" ry="5" fill="#F8A8B8" opacity="0.85" />
      <path d="M85.5 66 L88 62 M89 66 L91.5 62 M92.5 66 L95 62" stroke="#D96B88" strokeWidth="1.4" strokeLinecap="round" />
      {/* Authentic tiny 'w' mouth */}
      <path
        d="M54 62 Q57 66 60 61 Q63 66 66 62"
        fill="none"
        stroke="#332520"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MascotHachiware({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 110" className={className} aria-hidden="true">
      {/* Pointed cat ears */}
      <path d="M24 44 L29 14 L50 28 Z" fill="#6F95B5" stroke="#332520" strokeWidth="4" strokeLinejoin="round" />
      <path d="M96 44 L91 14 L70 28 Z" fill="#6F95B5" stroke="#332520" strokeWidth="4" strokeLinejoin="round" />
      {/* Head */}
      <ellipse cx="60" cy="61" rx="41" ry="37" fill="#FFFFFF" stroke="#332520" strokeWidth="4" />
      {/* Iconic split Hachiware blue hair cap */}
      <path
        d="M22 48 Q40 28 60 40 Q80 28 98 48 Q88 24 60 24 Q32 24 22 48 Z"
        fill="#6F95B5"
        stroke="#332520"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Happy curved eyes */}
      <path d="M38 56 Q44 49 50 56" fill="none" stroke="#332520" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M70 56 Q76 49 82 56" fill="none" stroke="#332520" strokeWidth="3.2" strokeLinecap="round" />
      {/* Cheeks + diagonal hatch marks */}
      <ellipse cx="30" cy="65" rx="8.5" ry="5" fill="#F8A8B8" opacity="0.85" />
      <path d="M25 67 L27.5 63 M28.5 67 L31 63 M32 67 L34.5 63" stroke="#D96B88" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="90" cy="65" rx="8.5" ry="5" fill="#F8A8B8" opacity="0.85" />
      <path d="M85.5 67 L88 63 M89 67 L91.5 63 M92.5 67 L95 63" stroke="#D96B88" strokeWidth="1.4" strokeLinecap="round" />
      {/* Happy open cat smile */}
      <path
        d="M54 63 Q57 67 60 62 Q63 67 66 63"
        fill="none"
        stroke="#332520"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path d="M56 66 Q60 75 64 66 Z" fill="#EA7B93" stroke="#332520" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

export function MascotUsagi({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 125" className={className} aria-hidden="true">
      {/* Tall straight bunny ears */}
      <ellipse cx="46" cy="28" rx="8.5" ry="23" fill="#F7E9B8" stroke="#332520" strokeWidth="4" />
      <ellipse cx="46" cy="29" rx="4" ry="13" fill="#F8B6C4" />
      <ellipse cx="74" cy="28" rx="8.5" ry="23" fill="#F7E9B8" stroke="#332520" strokeWidth="4" />
      <ellipse cx="74" cy="29" rx="4" ry="13" fill="#F8B6C4" />
      {/* Cream-yellow round body */}
      <ellipse cx="60" cy="76" rx="40" ry="36" fill="#F7E9B8" stroke="#332520" strokeWidth="4" />
      {/* Curved brow lines */}
      <path d="M36 58 Q43 52 50 57" fill="none" stroke="#332520" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M70 57 Q77 52 84 58" fill="none" stroke="#332520" strokeWidth="2.4" strokeLinecap="round" />
      {/* Large glossy eyes */}
      <ellipse cx="44" cy="68" rx="5.5" ry="6" fill="#332520" />
      <ellipse cx="43.5" cy="66" rx="2.3" ry="2.2" fill="#FFFFFF" />
      <ellipse cx="76" cy="68" rx="5.5" ry="6" fill="#332520" />
      <ellipse cx="75.5" cy="66" rx="2.3" ry="2.2" fill="#FFFFFF" />
      {/* Cheeks + diagonal hatch marks */}
      <ellipse cx="30" cy="79" rx="8.5" ry="5" fill="#F8A8B8" opacity="0.88" />
      <path d="M25 81 L27.5 77 M28.5 81 L31 77 M32 81 L34.5 77" stroke="#D96B88" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="90" cy="79" rx="8.5" ry="5" fill="#F8A8B8" opacity="0.88" />
      <path d="M85.5 81 L88 77 M89 81 L91.5 77 M92.5 81 L95 77" stroke="#D96B88" strokeWidth="1.4" strokeLinecap="round" />
      {/* Usagi energetic mouth */}
      <path d="M54 77 Q57 81 60 76 Q63 81 66 77" fill="none" stroke="#332520" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}) {
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#FCE8EE] via-[#FBF9F6] to-[#EAF4FC] text-[#6F6672] p-6 text-center ${className}`}
      >
        <MascotChiikawa className="w-16 h-16 mb-2" />
        <span className="text-sm font-medium text-[#2E2830]">{fallbackTitle || alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
