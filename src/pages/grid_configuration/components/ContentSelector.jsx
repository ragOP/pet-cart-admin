import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Image,
  Package,
  Folder,
  Layers,
  Tag,
  AlertCircle,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { useInfiniteContentData } from "../hooks/useInfiniteContentData";
import { generateLink } from "@/utils/link_builder";

const ContentSelector = ({ contentType, onSelect, currentItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const scrollContainerRef = useRef(null);

  // Debounce search term to reduce API calls
  useEffect(() => {
    // If search is cleared, update immediately without debounce
    if (searchTerm === "") {
      setDebouncedSearchTerm("");
      return;
    }

    // Otherwise, debounce the search
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Use TanStack Infinite Query for automatic pagination
  const trimmedSearch = debouncedSearchTerm.trim();
  
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteContentData(contentType, trimmedSearch);

  // Flatten all pages into a single array
  const allItems = useMemo(() => {
    if (!data?.pages) return [];
    
    return data.pages.flatMap(page => {
      if (contentType === "category") {
        return page?.data?.data?.categories || [];
      }
      return page?.data?.data || page?.data || [];
    });
  }, [data, contentType]);

  // Get total count from first page
  const totalCount = useMemo(() => {
    const firstPage = data?.pages?.[0];
    if (!firstPage) return 0;
    
    // For categories, total is nested in data.data.total
    if (contentType === "category") {
      return firstPage?.data?.data?.total || 0;
    }
    
    // For other types, total is in data.total
    return firstPage?.data?.total || firstPage?.data?.length || 0;
  }, [data, contentType]);

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Content type configuration mapper
  const contentTypeConfig = {
    product: {
      icon: <Package className="w-4 h-4" />,
      singular: "Product",
      plural: "Products",
      getDisplayName: (item) => item.title || item.name || "Unnamed Product",
      getImageUrl: (item) => item.images?.[0] || item.image || item.thumbnail,
      getDetails: (item) => ({
        price: item.price ? `₹${item.price}` : null,
        category: item.categoryId?.name || null,
      }),
    },
    category: {
      icon: <Folder className="w-4 h-4" />,
      singular: "Category",
      plural: "Categories",
      getDisplayName: (item) => item.name || "Unnamed Category",
      getImageUrl: (item) => item.image || item.banner || item.icon,
      getDetails: () => ({}),
    },
    subCategory: {
      icon: <Layers className="w-4 h-4" />,
      singular: "Sub-Category",
      plural: "Sub-Categories",
      getDisplayName: (item) => item.name || "Unnamed Sub-Category",
      getImageUrl: (item) => item.image || item.banner || item.icon,
      getDetails: () => ({}),
    },
    collection: {
      icon: <Tag className="w-4 h-4" />,
      singular: "Collection",
      plural: "Collections",
      getDisplayName: (item) => item.name || "Unnamed Collection",
      getImageUrl: (item) => item.image || item.banner || item.icon,
      getDetails: () => ({}),
    },
    brand: {
      icon: <BadgeCheck className="w-4 h-4" />,
      singular: "Brand",
      plural: "Brands",
      getDisplayName: (item) => item.name || "Unnamed Brand",
      getImageUrl: (item) =>
        item.logo || item.image || item.banner || item.icon,
      getDetails: () => ({}),
    },
  };

  const getIcon = (type) => {
    return contentTypeConfig[type]?.icon || <Image className="w-4 h-4" />;
  };

  const getDisplayName = (item, type) => {
    return (
      contentTypeConfig[type]?.getDisplayName(item) ||
      item.title ||
      item.name ||
      "Unknown Item"
    );
  };

  const getImageUrl = (item, type) => {
    return contentTypeConfig[type]?.getImageUrl(item);
  };

  // Calculate display information - use accumulated items
  const showingCount = allItems.length;
  const totalDisplayCount = totalCount;
  const hasNoSearchResults = trimmedSearch && allItems.length === 0 && !isLoading;
  const hasNoData = !trimmedSearch && allItems.length === 0 && !isLoading;

  // Handle scroll to load more
  const handleScroll = (e) => {
    if (!hasNextPage || isFetchingNextPage) return;

    const container = e.target;
    const scrollThreshold = 200; // Load more when 200px from bottom
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceFromBottom < scrollThreshold) {
      fetchNextPage();
    }
  };

  const buildContentLink = (type, item) => {
    const normalizedType = type === "subCategory" ? "subcategory" : type;
    switch (normalizedType) {
      case "product":
        return generateLink({ type: "product", productId: item._id });
      case "category":
        return generateLink({ type: "category", categorySlug: item.slug });
      case "subcategory":
        return generateLink({
          type: "subcategory",
          categorySlug: item.categoryId?.slug || item.categorySlug,
          subCategorySlug: item.slug,
        });
      case "collection":
        return generateLink({ type: "collection", collectionSlug: item.slug });
      case "brand":
        return generateLink({ type: "brand", brandSlug: item.slug });
      default:
        return "/";
    }
  };

  const handleSelect = (item) => {
    const selectedItem = {
      itemId: item._id,
      link: buildContentLink(contentType, item),
      image: getImageUrl(item, contentType),
      name: getDisplayName(item, contentType),
      type: contentType,
    };
    onSelect(selectedItem);
    setIsOpen(false);
  };

  const getSearchPlaceholder = () => {
    return `Search ${contentTypeConfig[contentType]?.plural || contentType}...`;
  };

  const renderNoResultsMessage = () => {
    if (hasNoSearchResults) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No results found
          </h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            No {contentTypeConfig[contentType]?.plural || contentType} match
            your search for{" "}
            <span className="font-medium text-gray-700">"{searchTerm}"</span>
          </p>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="min-w-[120px]"
            >
              Clear search
            </Button>
          </div>
        </div>
      );
    }

    if (hasNoData) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No {contentTypeConfig[contentType]?.plural || contentType} available
          </h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            There are currently no{" "}
            {contentTypeConfig[contentType]?.plural || contentType} in the
            database.
            {contentType === "product" &&
              " Products will appear here once they are added to your catalog."}
            {contentType === "category" &&
              " Categories will appear here once they are created."}
            {contentType === "subCategory" &&
              " Sub-categories will appear here once they are created."}
            {contentType === "collection" &&
              " Collections will appear here once they are created."}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setIsOpen(true)}
        >
          {getIcon(contentType)}
          <span className="ml-2">
            {currentItem
              ? `Change ${
                  contentTypeConfig[contentType]?.singular || contentType
                }`
              : `Select ${
                  contentTypeConfig[contentType]?.singular || contentType
                }`}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <div className="px-6 pt-4 pb-3 border-b">
          <DialogHeader>
            <DialogTitle>
              Select {contentTypeConfig[contentType]?.singular || contentType}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Fixed Header Section - No Scroll */}
        <div className="px-6 py-3 space-y-3 border-b">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={getSearchPlaceholder()}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {/* Search Status Indicator */}
            {searchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {searchTerm !== debouncedSearchTerm ? (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Typing...
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">
                    {allItems.length} results
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Summary - Always show when there are products */}
          {allItems.length > 0 && !isLoading && (
            <div className="text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>📊</span>
                <span>
                  Showing <strong>{showingCount}</strong> of{" "}
                  <strong>{totalDisplayCount}</strong>{" "}
                  {contentTypeConfig[contentType]?.plural || contentType}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content Section */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-6 py-4"
          onScroll={handleScroll}
        >
          {/* Initial Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-gray-500 text-sm">
                Loading {contentTypeConfig[contentType]?.plural || contentType}
                s...
              </p>
            </div>
          ) : (
            <>
              {/* Content List */}
              {allItems.length > 0 ? (
                <>
                  <div className="space-y-2 pb-4">
                    {allItems.map((item) => (
                      <div
                        key={item._id}
                        className="border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                        onClick={() => handleSelect(item)}
                      >
                        <div className="flex items-center space-x-4">
                          {/* Item Image */}
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                            {getImageUrl(item, contentType) ? (
                              <img
                                src={getImageUrl(item, contentType)}
                                alt={getDisplayName(item, contentType)}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{
                                display: getImageUrl(item, contentType)
                                  ? "none"
                                  : "flex",
                              }}
                            >
                              <Image className="w-6 h-6 text-gray-400" />
                            </div>
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {getDisplayName(item, contentType)}
                            </h4>
                            {(() => {
                              const details =
                                contentTypeConfig[contentType]?.getDetails(
                                  item
                                );
                              return (
                                <>
                                  {details.price && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {details.price}
                                    </p>
                                  )}
                                  {details.category && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {details.category}
                                    </p>
                                  )}
                                </>
                              );
                            })()}
                          </div>

                          {/* Selection Indicator */}
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Loading More Indicator */}
                  {isFetchingNextPage && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                      <span className="text-sm text-gray-500">Loading more...</span>
                    </div>
                  )}

                  {/* End of Results Message */}
                  {!hasNextPage && allItems.length > 0 && totalDisplayCount > 0 && (
                    <div className="text-center py-4 text-sm text-gray-500">
                      {allItems.length === totalDisplayCount ? (
                        <>All {totalDisplayCount} {contentTypeConfig[contentType]?.plural || contentType} loaded</>
                      ) : (
                        <>Showing {allItems.length} of {totalDisplayCount} {contentTypeConfig[contentType]?.plural || contentType}</>
                      )}
                    </div>
                  )}
                </>
              ) : (
                renderNoResultsMessage()
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentSelector;
