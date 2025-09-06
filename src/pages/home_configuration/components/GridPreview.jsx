import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Monitor } from "lucide-react";

const GridPreview = ({ gridConfig, gridItems, title, bannerImage, backgroundImage }) => {
    // Helper function to get display URL
    const getDisplayUrl = (imageValue) => {
        if (!imageValue) return null;
        if (typeof imageValue === 'string') return imageValue; // Already a URL
        if (imageValue instanceof File) return URL.createObjectURL(imageValue); // Create object URL for File
        return null;
    };

    const desktopGridStyle = {
        display: "grid",
        gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
        gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
        gap: "1rem",
        padding: "1rem",
        backgroundColor: "#f8fafc",
        borderRadius: "0.5rem",
        minHeight: "400px",
        backgroundImage: backgroundImage ? `url(${getDisplayUrl(backgroundImage)})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    };

    const mobileGridStyle = {
        display: "grid",
        gridTemplateColumns: `repeat(${gridConfig.mobileColumns || 2}, 1fr)`,
        gridTemplateRows: `repeat(${gridConfig.mobileRows || 2}, 1fr)`,
        gap: "0.75rem",
        padding: "0.75rem",
        backgroundColor: "#f8fafc",
        borderRadius: "0.5rem",
        minHeight: "300px",
        backgroundImage: backgroundImage ? `url(${getDisplayUrl(backgroundImage)})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    };

    const renderGridItem = (item, isMobile = false) => {
        if (!item.image) {
            return (
                <div className={`${isMobile ? 'h-32' : 'h-48'} bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs`}>
                    Empty Slot
                </div>
            );
        }

        return (
            <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                    {/* Image */}
                    <div className="relative bg-gray-100">
                        {item.image ? (
                            <img
                                src={getDisplayUrl(item.image)}
                                alt={item.title || "Product"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Calculate mobile grid items (limit to mobile grid size)
    const mobileGridSize = (gridConfig.mobileRows || 2) * (gridConfig.mobileColumns || 2);
    const mobileGridItems = gridItems.slice(0, mobileGridSize);

    return (
        <div className="space-y-6">
            {/* Desktop Preview */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Monitor className="h-5 w-5 text-blue-600" />
                        <div>
                            <h3 className="text-lg font-semibold">Desktop Preview</h3>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-sm">
                        {gridConfig.rows} × {gridConfig.columns}
                    </Badge>
                </div>

                {/* Desktop Preview Container */}
                <div className="border rounded-lg p-4 bg-gray-50">
                    {/* Banner Image Display */}
                    {bannerImage && (
                        <div className="mb-4">
                            <img
                                src={getDisplayUrl(bannerImage)}
                                alt="Banner"
                                className="w-full object-cover rounded-lg"
                            />
                        </div>
                    )}

                    {/* Title Display */}
                    <div className="">
                        {title && <h4 className="text-2xl font-bold text-gray-700 mb-4">
                            {title}
                        </h4>}
                        <div className="w-full mx-auto">
                            <div style={desktopGridStyle}>
                                {gridItems.map((item) => (
                                    <div key={item.id}>
                                        {renderGridItem(item, false)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Preview */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Smartphone className="h-5 w-5 text-green-600" />
                        <div>
                            <h3 className="text-lg font-semibold">Mobile Preview</h3>

                        </div>
                    </div>
                    <Badge variant="outline" className="text-sm">
                        {gridConfig.mobileRows || 2} × {gridConfig.mobileColumns || 2}
                    </Badge>
                </div>

                {/* Mobile Preview Container - Simulated mobile viewport */}
                <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="max-w-sm mx-auto">
                        {/* Mobile Banner Image Display */}
                        {bannerImage && (
                            <div className="mb-3">
                                <img
                                    src={getDisplayUrl(bannerImage)}
                                    alt="Banner"
                                    className="w-full object-cover rounded-lg"
                                />
                            </div>
                        )}

                        {/* Mobile Title Display */}
                        <div className="">
                            {title && <h4 className="text-lg font-bold text-gray-700 mb-3">
                                {title}
                            </h4>}
                            <div className="w-full">
                                <div style={mobileGridStyle}>
                                    {mobileGridItems.map((item, index) => (
                                        <div key={`mobile-${item.id}-${index}`}>
                                            {renderGridItem(item, true)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default GridPreview; 