import React, { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chip, ChipGroup } from "@/components/ui/chip";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { fetchProducts } from "@/pages/product/helpers/fetchProducts";
import { fetchBrands } from "@/pages/brand/helpers/fetchBrand";
import {
    lifeStage,
    breedSize,
    isVeg,
    productType,
    rating
} from "@/utils/product_filters";
import { Search, X, ChevronDown, Check, CheckCircle } from "lucide-react";

const VegSwitchButton = ({ value, onValueChange, label }) => {
    return (
        <div className="flex items-center gap-2">
            {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
            <div className="flex items-center px-2 h-9 rounded-md bg-white border-1 border-gray-200">
                <button
                    onClick={() => onValueChange(!value)}
                    className="relative w-[48px] h-8 mt-[3px] cursor-pointer focus:outline-none"
                    type="button"
                    role="switch"
                    aria-checked={value}
                >
                    {/* Track */}
                    <div className={`absolute w-[48px] h-[14px] rounded-xl top-[7.5px] transition-colors duration-300 ${value ? 'bg-[#0a0]' : 'bg-[#ebebeb]'
                        }`} />

                    {/* Thumb */}
                    <div
                        className={`absolute top-[2px] w-6 h-6 rounded-sm border-2 bg-white flex items-center justify-center transition-all duration-300 ease-in-out ${value ? 'left-[24px] border-[#0a0]' : 'left-[-2] border-[#0a0]'
                            }`}
                    >
                        {/* Thumb Inner Circle */}
                        <div
                            className={`w-3 h-3 bg-[#0a0] rounded-full transition-colors duration-300 `}
                        />
                    </div>
                </button>
            </div>
        </div>
    );
};

const ProductSelectionDialog = ({
    isOpen,
    onClose,
    onProductSelect,
    title = "Select Products",
    fixedFilters = {},
    dynamicFilters = {},
    selectedProducts = [],
    multiple = true
}) => {
    const [searchText, setSearchText] = useState("");
    const [appliedFilters, setAppliedFilters] = useState({});
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    console.log(appliedFilters);

    // Fetch brands for filter
    const { data: brandsRes } = useQuery({
        queryKey: ["brands"],
        queryFn: () => fetchBrands({ params: { per_page: 100 } }),
        enabled: isOpen,
    });

    const brands = brandsRes?.data || [];

    // Set filters when dialog opens
    useEffect(() => {
        if (isOpen) {
            setSearchText("");
            setAppliedFilters({
                breedSize: [],
                productType: [],
                lifeStage: [],
                brandIds: [],
                rating: [],
                isVeg: null,
                ...fixedFilters,
                ...dynamicFilters,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]); // Only depend on isOpen to prevent infinite loops

    // Fetch products with infinite query
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    } = useInfiniteQuery({
        queryKey: ["products", "selection", appliedFilters, searchText],
        queryFn: ({ pageParam = 1 }) =>
            fetchProducts({
                params: {
                    page: pageParam,
                    per_page: 100,
                    search: searchText,
                    ...appliedFilters,
                },
            }),
        getNextPageParam: (lastPage) => {
            const total = lastPage?.total || lastPage?.data?.total || 0;
            const currentPage = lastPage?.current_page || lastPage?.data?.current_page || 1;
            const perPage = 100;
            const totalPages = Math.ceil(total / perPage);

            console.log('Pagination debug:', { total, currentPage, totalPages, hasNext: currentPage < totalPages });

            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        enabled: isOpen,
        staleTime: 30000, // 30 seconds
    });

    // Flatten all products from all pages
    const allProducts = data?.pages?.flatMap((page) =>
        page?.data?.data || page?.data || page || []
    ) || [];

    const totalProducts = data?.pages?.[0]?.total || data?.pages?.[0]?.data?.total || 0;

    // Handle scroll to load more products
    const handleScroll = useCallback(
        (e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.target;
            const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

            console.log('Scroll debug:', {
                scrollTop,
                scrollHeight,
                clientHeight,
                scrollPercentage,
                hasNextPage,
                isFetchingNextPage
            });

            // Trigger when user scrolls to 80% of the content
            if (
                scrollPercentage >= 0.8 &&
                hasNextPage &&
                !isFetchingNextPage
            ) {
                console.log('Fetching next page...');
                fetchNextPage();
            }
        },
        [hasNextPage, isFetchingNextPage, fetchNextPage]
    );

    // Handle filter changes for arrays
    const handleFilterChange = (filterKey, filterValue) => {
        setAppliedFilters((prev) => {
            const newFilters = { ...prev };

            // Initialize as array if not exists
            if (!Array.isArray(newFilters[filterKey])) {
                newFilters[filterKey] = [];
            }

            const currentValues = newFilters[filterKey];
            const index = currentValues.indexOf(filterValue);

            if (index > -1) {
                newFilters[filterKey] = currentValues.filter((_, i) => i !== index);
            } else {
                newFilters[filterKey] = [...currentValues, filterValue];
            }

            return newFilters;
        });
    };

    // Handle toggle changes for boolean filters
    const handleToggleChange = (filterKey, value) => {
        setAppliedFilters((prev) => ({
            ...prev,
            [filterKey]: value
        }));
    };

    // Handle product selection
    const handleProductSelect = (product) => {
        if (multiple) {
            const isSelected = selectedProducts.some((p) => p._id === product._id);
            if (isSelected) {
                onProductSelect(selectedProducts.filter((p) => p._id !== product._id));
            } else {
                onProductSelect([...selectedProducts, product]);
            }
        } else {
            onProductSelect([product]);
        }
    };

    // Handle dialog close with confirmation
    const handleClose = () => {
        if (selectedProducts.length > 0) {
            setShowConfirmDialog(true);
        } else {
            onClose();
        }
    };

    // Handle dialog open change (prevent auto-close when products are selected)
    const handleOpenChange = (open) => {
        if (!open && selectedProducts.length > 0) {
            // Prevent closing when products are selected - show confirmation instead
            setShowConfirmDialog(true);
        } else if (!open) {
            // Allow normal close when no products are selected
            onClose();
        }
    };

    // Handle confirmed close
    const handleConfirmClose = () => {
        setShowConfirmDialog(false);
        onClose();
    };

    // Handle cancel close
    const handleCancelClose = () => {
        setShowConfirmDialog(false);
    };

    // Check if product is selected
    const isProductSelected = (product) => {
        return selectedProducts.some((p) => p._id === product._id);
    };

    // Clear search
    const clearSearch = () => {
        setSearchText("");
    };

    // Clear all dynamic filters
    const clearAllFilters = () => {
        setAppliedFilters(fixedFilters);
    };

    // Get active filter count
    const getActiveFilterCount = () => {
        const dynamicFilterCount = Object.keys(dynamicFilters).reduce((count, key) => {
            const fixedValue = fixedFilters[key];
            const appliedValue = appliedFilters[key];

            if (Array.isArray(fixedValue) && Array.isArray(appliedValue)) {
                return count + (appliedValue.length - fixedValue.length);
            }
            return count;
        }, 0);

        // Add count for brandIds and rating filters
        const brandCount = Array.isArray(appliedFilters.brandIds) ? appliedFilters.brandIds.length : 0;
        const ratingCount = Array.isArray(appliedFilters.rating) ? appliedFilters.rating.length : 0;

        return dynamicFilterCount + brandCount + ratingCount;
    };

    const activeFilterCount = getActiveFilterCount();

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="min-w-[70vw] min-h-[90vh] max-h-[90vh] flex flex-col px-4 py-2 gap-2" showCloseButton={false}>
                    <DialogHeader className="p-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <DialogTitle>{title}</DialogTitle>
                                {selectedProducts.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        <span>{selectedProducts.length} selected</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedProducts.length > 0 && (
                                    <Button
                                        onClick={onClose}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        Save & Close
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (selectedProducts.length > 0) {
                                            setShowConfirmDialog(true);
                                        } else {
                                            onClose();
                                        }
                                    }}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search products..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="pl-10 pr-10"
                            />
                            {searchText && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSearch}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Filter Section */}
                        <div className="space-y-4">
                            {/* All Filters in One Line */}
                            <div className="flex items-center gap-4">
                                {activeFilterCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAllFilters}
                                        className="text-xs"
                                    >
                                        Clear All ({activeFilterCount})
                                    </Button>
                                )}

                                <div className="flex items-center gap-4">
                                    {/* Breed Size Filter */}
                                    <div className="relative">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="justify-between"
                                                >
                                                    Breed Size{Array.isArray(appliedFilters.breedSize) && appliedFilters.breedSize.length > 0 ? ` (${appliedFilters.breedSize.length})` : ''}
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search breed size..." />
                                                    <CommandEmpty>No breed size found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {breedSize.map((option) => (
                                                            <CommandItem
                                                                key={option.value}
                                                                onSelect={() => handleFilterChange("breedSize", option.value)}
                                                                className="cursor-pointer"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${appliedFilters.breedSize?.includes(option.value)
                                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                                        : 'border-muted-foreground'
                                                                        }`}>
                                                                        {appliedFilters.breedSize?.includes(option.value) && (
                                                                            <Check className="h-3 w-3" />
                                                                        )}
                                                                    </div>
                                                                    <span>{option.label}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Product Type Filter */}
                                    <div className="relative">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="justify-between"
                                                >
                                                    Product Type{Array.isArray(appliedFilters.productType) && appliedFilters.productType.length > 0 ? ` (${appliedFilters.productType.length})` : ''}
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search product type..." />
                                                    <CommandEmpty>No product type found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {productType.map((option) => (
                                                            <CommandItem
                                                                key={option.value}
                                                                onSelect={() => handleFilterChange("productType", option.value)}
                                                                className="cursor-pointer"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${appliedFilters.productType?.includes(option.value)
                                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                                        : 'border-muted-foreground'
                                                                        }`}>
                                                                        {appliedFilters.productType?.includes(option.value) && (
                                                                            <Check className="h-3 w-3" />
                                                                        )}
                                                                    </div>
                                                                    <span>{option.label}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Life Stage Filter */}
                                    <div className="relative">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="justify-between"
                                                >
                                                    Life Stage{Array.isArray(appliedFilters.lifeStage) && appliedFilters.lifeStage.length > 0 ? ` (${appliedFilters.lifeStage.length})` : ''}
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search life stage..." />
                                                    <CommandEmpty>No life stage found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {lifeStage.map((option) => (
                                                            <CommandItem
                                                                key={option.value}
                                                                onSelect={() => handleFilterChange("lifeStage", option.value)}
                                                                className="cursor-pointer"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${appliedFilters.lifeStage?.includes(option.value)
                                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                                        : 'border-muted-foreground'
                                                                        }`}>
                                                                        {appliedFilters.lifeStage?.includes(option.value) && (
                                                                            <Check className="h-3 w-3" />
                                                                        )}
                                                                    </div>
                                                                    <span>{option.label}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Brand Filter */}
                                    <div className="relative">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="justify-between"
                                                >
                                                    Brand{Array.isArray(appliedFilters.brandIds) && appliedFilters.brandIds.length > 0 ? ` (${appliedFilters.brandIds.length})` : ''}
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search brands..." />
                                                    <CommandEmpty>No brands found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {brands.map((brand) => (
                                                            <CommandItem
                                                                key={brand._id}
                                                                onSelect={() => handleFilterChange("brandIds", brand._id)}
                                                                className="cursor-pointer"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${appliedFilters.brandIds?.includes(brand._id)
                                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                                        : 'border-muted-foreground'
                                                                        }`}>
                                                                        {appliedFilters.brandIds?.includes(brand._id) && (
                                                                            <Check className="h-3 w-3" />
                                                                        )}
                                                                    </div>
                                                                    <span>{brand.name}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Rating Filter */}
                                    <div className="relative">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="justify-between"
                                                >
                                                    Rating{Array.isArray(appliedFilters.rating) && appliedFilters.rating.length > 0 ? ` (${appliedFilters.rating.length})` : ''}
                                                    <ChevronDown className="h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search ratings..." />
                                                    <CommandEmpty>No ratings found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {rating.map((option) => (
                                                            <CommandItem
                                                                key={option.value}
                                                                onSelect={() => handleFilterChange("rating", option.value)}
                                                                className="cursor-pointer"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${appliedFilters.rating?.includes(option.value)
                                                                        ? 'bg-primary border-primary text-primary-foreground'
                                                                        : 'border-muted-foreground'
                                                                        }`}>
                                                                        {appliedFilters.rating?.includes(option.value) && (
                                                                            <Check className="h-3 w-3" />
                                                                        )}
                                                                    </div>
                                                                    <span>{option.label}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Food Type Toggle */}
                                    <div className="flex items-center gap-4">
                                        <VegSwitchButton
                                            value={appliedFilters.isVeg === "true" || appliedFilters.isVeg?.includes("true")}
                                            onValueChange={(value) => {
                                                if (value) {
                                                    setAppliedFilters((prev) => ({
                                                        ...prev,
                                                        isVeg: "true"
                                                    }));
                                                } else {
                                                    setAppliedFilters((prev) => ({
                                                        ...prev,
                                                        isVeg: "false"
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Count */}
                        <div className="text-sm text-muted-foreground">
                            Showing {allProducts.length} of {totalProducts} products
                        </div>

                        {/* Product Grid */}
                        <div
                            className="flex-1 overflow-y-auto min-h-0"
                            onScroll={handleScroll}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <CustomSpinner />
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center p-8 text-red-500">
                                    Error loading products
                                </div>
                            ) : allProducts.length === 0 ? (
                                <div className="flex items-center justify-center p-8 text-muted-foreground">
                                    No products found
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {allProducts.map((product) => (
                                        <div
                                            key={product._id}
                                            className={`relative border rounded-sm p-1.5 hover:shadow-sm cursor-pointer transition-all ${isProductSelected(product) ? "border-green-500 bg-green-50 shadow-sm" : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            onClick={() => handleProductSelect(product)}
                                        >
                                            {/* Selection Indicator */}
                                            {isProductSelected(product) && (
                                                <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-green-500 text-white flex items-center justify-center text-xs z-10">
                                                    ✓
                                                </div>
                                            )}

                                            {/* Product Image */}
                                            {product.images && product.images[0] ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-30 object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-30 flex items-center justify-center text-gray-400 text-xs">
                                                    No Image
                                                </div>
                                            )}

                                            {/* Product Details */}
                                            <div className="space-y-0.5 mt-1">
                                                {/* Product Name */}
                                                <div className="font-medium text-xs line-clamp-2 min-h-[1.5rem] leading-tight">
                                                    {product.title}
                                                </div>

                                                {/* Brand Chip */}
                                                {/* {product.brandId?.name && (
                                                    <div className="inline-block">
                                                        <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            {product.brandId.name}
                                                        </span>
                                                    </div>
                                                )} */}

                                                {/* Price */}
                                                <div className="space-y-0.5">
                                                    <div className="flex flex-row gap-0.5">
                                                        {/* Original Price */}
                                                        {product.price && (
                                                            <div className="text-xs text-gray-500 line-through">
                                                                ₹{product.price}
                                                            </div>
                                                        )}

                                                        {/* Current Price */}
                                                        {product.salePrice && (
                                                            <div className="text-xs font-semibold text-green-600">
                                                                ₹{product.salePrice}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Discount Badge */}
                                                    {product.originalPrice && product.originalPrice > product.price && (
                                                        <div className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded inline-block">
                                                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Loading indicator for infinite scroll */}
                                    {isFetchingNextPage && (
                                        <div className="col-span-full flex items-center justify-center p-4">
                                            <CustomSpinner />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Leave without saving?</DialogTitle>
                        <DialogDescription>
                            You have {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected.
                            Are you sure you want to leave without using your selection?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCancelClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmClose}
                        >
                            Leave without saving
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProductSelectionDialog;
