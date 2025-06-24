import React, { useState, useEffect } from 'react';
import NavbarItem from "@/components/navbar/navbar_items";
import CustomActionMenu from "@/components/custom_action";
import { useNavigate } from "react-router";
import { DateRangePicker } from "@/components/date_filter";
import Typography from "@/components/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink, Image as ImageIcon, Edit, Trash2, Eye } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fetchBanners } from "./helpers/fetchBanners";
import { toast } from 'sonner';

const Banners = () => {
  const navigate = useNavigate();
  
  const [banners, setBanners] = useState(null);
  const [selectedType, setSelectedType] = useState("web");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const onAdd = () => {
    if(banners.length === 1){
      toast.error("Single banner is allowed");
      return;
    }
    navigate("/dashboard/banners/add");
  };

  const breadcrumbs = [{ title: "Banners", isNavigation: false }];

  const handleDateRangeChange = (range) => {
    // Date range functionality removed since API doesn't support it
    console.log("Date range changed:", range);
  };

  // Fetch banners data
  const loadBanners = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchBanners(selectedType);
      
      if (result.success) {
        console.log("Full API result:", result);
        console.log("Banners data:", result.data.data);
        // console.log("Images array:", result.data.data?.images);
        setBanners(result.data.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load banners");
      console.error("Error loading banners:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, [selectedType]);

  // Since the API handles type filtering, we just use the images directly
  // const filteredBanners = banners?.images || [];

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "web":
        return "bg-blue-100 text-blue-700";
      case "mobile":
        return "bg-green-100 text-green-700";
      case "app":
        return "bg-purple-100 text-purple-700";
      case "tablet":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleEditBanner = (banner) => {
    navigate(`/dashboard/banners/edit/${selectedType}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <NavbarItem
          title="Banners"
          breadcrumbs={breadcrumbs}
          customBox={<DateRangePicker onChange={handleDateRangeChange} />}
        />
        <div className="py-1 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="aspect-video mb-3 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="flex flex-col">
      <NavbarItem
        title="Banners"
        breadcrumbs={breadcrumbs}
        customBox={<DateRangePicker onChange={handleDateRangeChange} />}
      />

      <div className="py-1 px-4">

        {/* Type Filter */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Typography variant="small" className="text-gray-600">Filter by type:</Typography>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem> 
                <SelectItem value="app">App</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={onAdd} className="ml-auto">
            <Plus className="h-4 w-4" />
            Add New Banner
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <Typography variant="small" className="text-red-600">
                {error}
              </Typography>
            </CardContent>
          </Card>
        )}


        {/* Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.isArray(banners) && banners.map((banner) => (
            <Card key={banner._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className={getTypeBadgeColor(banner.type)}>
                    {banner.type}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Image */}
                <div className="relative aspect-video mb-3 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={banner.image}
                    alt={`Slider ${banner._id}`}
                    className="object-cover w-full h-full"
                  />
                  {/* Fallback when image fails to load */}
                  <div className="hidden w-full h-full items-center justify-center bg-gray-200 text-gray-500 text-xs p-2 text-center">
                    <div>
                      <div>Image failed to load</div>
                      <div className="break-all mt-1">{banner.image}</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      {/* <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleViewSlider(banner)}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Eye className="h-3 w-3" />
                      </Button> */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditBanner(banner)}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {banners.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Typography variant="h4" className="text-gray-600 mb-2">
                No banners found
              </Typography>
              <Typography variant="small" className="text-gray-500 mb-4">
                {selectedType !== "web" 
                  ? `No banners found for type "${selectedType}"`
                  : "Get started by adding your first banner"
                }
              </Typography>
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Banner
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Banners;
