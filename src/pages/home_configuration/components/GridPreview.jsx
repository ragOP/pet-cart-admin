import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const GridPreview = ({ gridConfig, gridItems, title, bannerImage, backgroundImage }) => {
    // Helper function to get display URL
    const getDisplayUrl = (imageValue) => {
        if (!imageValue) return null;
        if (typeof imageValue === 'string') return imageValue; // Already a URL
        if (imageValue instanceof File) return URL.createObjectURL(imageValue); // Create object URL for File
        return null;
    };

    const gridStyle = {
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

    const renderGridItem = (item) => {
        if (!item.image) {
            return (
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
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
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                No Image
                            </div>
                        )}

                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Website Preview</h3>
                    <p className="text-sm text-muted-foreground">
                        This is how your product grid will appear on the website
                    </p>
                </div>
                <div className="text-sm text-muted-foreground">
                    Layout: {gridConfig.rows} × {gridConfig.columns}
                </div>
            </div>

            {/* Preview Container */}
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
                        <div style={gridStyle}>
                            {gridItems.map((item) => (
                                <div key={item.id}>
                                    {renderGridItem(item)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default GridPreview; 