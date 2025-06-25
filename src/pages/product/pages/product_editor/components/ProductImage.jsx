import React from "react";
import CustomImage from "@/components/images/CustomImage";

/**
 * ProductItem component
 * @param {object} props
 * @param {string|StaticImageData} props.image - Product image src
 * @param {string} props.alt - Alt text for product image
 * @param {string} props.label - Label text to be displayed below the product image
 * @param {string} [props.className] - Additional classes
 */
const ProductImage = ({ image, alt, label, className = "" }) => {
  return (
    <div
      className={`relative flex flex-col px-2 items-center duration-200 group ${className}`}
      tabIndex={0}
    >
      {/* Product image */}
      <div className="relative z-10 flex items-center justify-center w-36 h-36 transition-all group-hover:scale-105 group-focus:scale-105">
        {/* Product base background below the product image */}
        <CustomImage
          src="/product-base.png"
          alt="Product Base"
          className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-28 h-28 z-0 pointer-events-none select-none transition-all group-hover:scale-105 group-focus:scale-105"
          width={112}
          height={112}
        />
        {/* Product image above the base */}
        <CustomImage
          src={image}
          alt={alt}
          className="w-32 h-32 object-contain relative z-10 drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)] transition-all group-hover:scale-110 group-focus:scale-110"
          width={124}
          height={124}
          priority
        />
      </div>
      {/* Label below the product */}
      <p className="text-sm mt-2 font-medium text-[#181818] text-center mb-2 break-words line-clamp-2">
        {label}
      </p>
      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-[#F59A11] group-focus:border-[#F59A11] group-hover:shadow-lg group-focus:shadow-lg transition-all duration-200 pointer-events-none z-20" />
    </div>
  );
};

export default ProductImage;
