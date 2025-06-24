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
import { fetchCatLifeBanners } from "./helpers/fetchCatLifeBanners";
import { toast } from 'sonner';

const CatLifeBanners = () => {
  const navigate = useNavigate();
  
  const [catLifeBanners, setCatLifeBanners] = useState(null);
  const [selectedType, setSelectedType] = useState("web");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const onAdd = () => {
    if(catLifeBanners?.length === 3){
      toast.error("Only 3 banners are allowed");
      return;
    }
    navigate("/dashboard/cat-life-banner/add");
  };

  const breadcrumbs = [{ title: "CatLifeBanners", isNavigation: false }];

  const handleDateRangeChange = (range) => {
    // Date range functionality removed since API doesn't support it
    console.log("Date range changed:", range);
  };

  // Fetch catLifeBanners data
  const loadCatLifeBanners = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchCatLifeBanners(selectedType);
      
      if (result.success) {
        console.log("Full API result:", result);
        console.log("CatLifeBanners data:", result.data.data);
        // console.log("Images array:", result.data.data?.images);
        setCatLifeBanners(result.data.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load catLifeBanners");
      console.error("Error loading catLifeBanners:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatLifeBanners();
  }, [selectedType]);

  // Since the API handles type filtering, we just use the images directly
  // const filteredCatLifeBanners = catLifeBanners?.images || [];

  const handleEditCatLifeBanner = (catLifeBanner) => {
    navigate(`/dashboard/cat-life-banner/edit/${catLifeBanner._id}`);
  };

  const handleViewCatLifeBanner = (catLifeBanner) => {
    window.open(catLifeBanner.link, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <NavbarItem
          title="CatLifeBanners"
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
        title="CatLifeBanners"
        breadcrumbs={breadcrumbs}
        customBox={<DateRangePicker onChange={handleDateRangeChange} />}
      />

      <div className="py-1 px-4">
        {/* <CustomActionMenu
          title="CatLifeBanner"
          total={catLifeBannerLength}
          onAdd={onAdd}
          showRowSelection={true}
          disableBulkExport={false}
        /> */}

        {/* Type Filter */}
        <div className="mb-4 flex items-center gap-4">
          
          <Button onClick={onAdd} className="ml-auto">
            <Plus className="h-4 w-4" />
            Add New CatLifeBanner
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


        {/* CatLifeBanners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.isArray(catLifeBanners) && catLifeBanners.map((catLifeBanner) => (
            <Card key={catLifeBanner._id} className="overflow-hidden hover:shadow-md transition-shadow">
              
              <CardContent className="pt-0">
                {/* Image */}
                <div className="relative aspect-video mb-3 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={catLifeBanner.image}
                    alt={`CatLifeBanner ${catLifeBanner._id}`}
                    className="object-cover w-full h-full"
                  />
                  {/* Fallback when image fails to load */}
                  <div className="hidden w-full h-full items-center justify-center bg-gray-200 text-gray-500 text-xs p-2 text-center">
                    <div>
                      <div>Image failed to load</div>
                      <div className="break-all mt-1">{catLifeBanner.image}</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleViewCatLifeBanner(catLifeBanner)}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditCatLifeBanner(catLifeBanner)}
                        className="bg-white/90 hover:bg-white"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Link */}
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="h-3 w-3 text-gray-500" />
                  <Typography variant="small" className="text-gray-600 truncate">
                    {catLifeBanner.link}
                  </Typography>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-3 w-3 text-gray-500" />
                  <Typography variant="small" className="text-gray-500">
                    {catLifeBanner.createdAt && (
                      <span>
                        Created {formatDistanceToNow(new Date(catLifeBanners?.createdAt), { addSuffix: true })}
                      </span>
                    )}
                  </Typography>
                </div>

                {/* Updated Date (if different from created) */}
                {catLifeBanners?.updatedAt !== catLifeBanners?.createdAt && (
                  <Typography variant="small" className="text-gray-400 mt-1">
                    {catLifeBanners?.updatedAt && (
                      <span>
                        Updated {formatDistanceToNow(new Date(catLifeBanners?.updatedAt), { addSuffix: true })}
                      </span>
                    )}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {catLifeBanners.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Typography variant="h4" className="text-gray-600 mb-2">
                No catLifeBanners found
              </Typography>
              <Typography variant="small" className="text-gray-500 mb-4">
                {selectedType !== "web" 
                  ? `No catLifeBanners found for type "${selectedType}"`
                  : "Get started by adding your first catLifeBanner"
                }
              </Typography>
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add New CatLifeBanner
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CatLifeBanners;
