import React, { useState } from "react";
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
  ArrowUp,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";
import { useContentData } from "../hooks/useContentData";
import { generateLink } from "@/utils/link_builder";

const ContentSelector = ({ contentType, onSelect, currentItem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Use TanStack Query for data fetching with search and pagination
  const { data: response, isLoading: loading } = useContentData(contentType, {
    limit: 50, // Show 50 items per page
    page: 1,
    search: searchTerm || undefined, // Add search parameter to API call
  });

  // Extract data from API response
  let contentData = response?.data?.data || response?.data || [];
  if (contentType === "category")
    contentData = response?.data?.data?.categories || [];
  const totalCount =
    response?.data?.total || response?.data?.length || contentData.length;
  const limit = response?.data?.limit || 50;

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

  // Calculate display information - always show API results
  const showingCount = Math.min(contentData.length, limit);
  const totalDisplayCount = totalCount;
  const hasNoSearchResults = searchTerm && contentData.length === 0;
  const hasNoData = !searchTerm && contentData.length === 0;

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
        <div className="flex flex-col items-center justify-center min-h-[40vh] max-h-[80vh] py-12">
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
        <div className="flex flex-col items-center justify-center min-h-[40vh] max-h-[80vh] py-12">
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
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Select {contentTypeConfig[contentType]?.singular || contentType}
          </DialogTitle>
        </DialogHeader>

        {/* Fixed Header Section - No Scroll */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={getSearchPlaceholder()}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {/* Search Results Counter */}
            {searchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-gray-400">
                  {contentData.length} results
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Results Summary - Always show when there are products */}
          {contentData.length > 0 && (
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
        <div className="flex-1 overflow-hidden">
          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
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
              {contentData.length > 0 ? (
                <div
                  className="h-full overflow-y-auto"
                  onScroll={(e) => {
                    const { scrollTop } = e.target;
                    setShowScrollTop(scrollTop > 100);
                  }}
                >
                  <div className="space-y-2">
                    {contentData.map((item) => (
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

                  {/* Scroll to Top Button */}
                  {showScrollTop && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="fixed bottom-6 right-6 z-50 shadow-lg"
                      onClick={() => {
                        const scrollContainer =
                          document.querySelector(".min-h-\\[40vh\\]");
                        if (scrollContainer) {
                          scrollContainer.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }
                      }}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                  )}
                </div>
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
