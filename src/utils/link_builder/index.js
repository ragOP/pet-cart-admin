export function generateLink(params = {}) {
  const {
    type,
    categorySlug,
    subCategorySlug,
    productId,
    collectionSlug,
    brandSlug,
  } = params;

  const qs = new URLSearchParams();

  switch (type) {
    case 'category': {
      if (!categorySlug) return '/category';
      qs.set('categorySlug', encodeURIComponent(categorySlug));
      return `/category?${qs.toString()}`;
    }

    case 'subcategory': {
      if (categorySlug) qs.set('categorySlug', encodeURIComponent(categorySlug));
      if (subCategorySlug) qs.set('subCategorySlug', encodeURIComponent(subCategorySlug));
      const query = qs.toString();
      return query ? `/category?${query}` : '/category';
    }

    case 'product': {
      if (!productId) return '/product';
      return `/product/${encodeURIComponent(productId)}`;
    }

    case 'collection': {
      if (!collectionSlug) return '/category';
      qs.set('collectionSlug', encodeURIComponent(collectionSlug));
      return `/category?${qs.toString()}`;
    }

    case 'brand': {
      if (!brandSlug) return '/category';
      qs.set('brandSlug', encodeURIComponent(brandSlug));
      return `/category?${qs.toString()}`;
    }

    default:
      return '/';
  }
}

export default generateLink;


