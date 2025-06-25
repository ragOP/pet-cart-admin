import { useState } from "react";

const EmptyProductSVG = ({ className = "", ...props }) => (
  <svg
    width={props.width || 80}
    height={props.height || 80}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect width="120" height="120" rx="24" fill="#F7F7F7" />
    <rect x="28" y="36" width="64" height="56" rx="10" fill="#fff" stroke="#E0E0E0" strokeWidth="2.5" strokeDasharray="6 4" />
    <g opacity="0.13">
      <ellipse cx="60" cy="68" rx="15" ry="10" fill="#F59A11" />
      <ellipse cx="50" cy="58" rx="4.5" ry="6.5" fill="#F59A11" />
      <ellipse cx="70" cy="58" rx="4.5" ry="6.5" fill="#F59A11" />
      <ellipse cx="55" cy="50" rx="2.5" ry="3.5" fill="#F59A11" />
      <ellipse cx="65" cy="50" rx="2.5" ry="3.5" fill="#F59A11" />
    </g>
    <g>
      <rect x="52" y="62" width="16" height="10" rx="2" fill="#E0E0E0" />
      <circle cx="60" cy="67" r="2.5" fill="#BDBDBD" />
      <rect x="56" y="60" width="8" height="3" rx="1.5" fill="#E0E0E0" />
      <line x1="54" y1="62" x2="66" y2="72" stroke="#BDBDBD" strokeWidth="1.5" strokeLinecap="round" />
    </g>
    <circle cx="60" cy="98" r="3" fill="#0888B1" fillOpacity="0.18" />
  </svg>
);

export default function CustomImage({ src, alt, className, ...props }) {
  const [imgSrc, setImgSrc] = useState(src);

  if (!imgSrc) {
    return <EmptyProductSVG className={className} width={props.width} height={props.height} />;
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc("")}
      {...props}
      width={props.width || 40}
      height={props.height || 40}
      unoptimized
    />
  );
}
