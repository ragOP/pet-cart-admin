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
import { fetchSliders } from "./helpers/fetchSliders";
import { deleteSlider } from "./helpers/deleteSlider";

const Sliders = () => {
  const navigate = useNavigate();
  
  const [sliders, setSliders] = useState(null);
  const [selectedType, setSelectedType] = useState("web");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const onAdd = () => {
    navigate("/dashboard/sliders/add");
  };

  const breadcrumbs = [{ title: "Sliders", isNavigation: false }];

  const handleDateRangeChange = (range) => {
    // Date range functionality removed since API doesn't support it
    console.log("Date range changed:", range);
  };

  // Fetch sliders data
  const loadSliders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchSliders(selectedType);
      
      if (result.success) {
        console.log("Full API result:", result);
        console.log("Sliders data:", result.data.data);
        // console.log("Images array:", result.data.data?.images);
        setSliders(result.data.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load sliders");
      console.error("Error loading sliders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSliders(null);
    loadSliders();
  }, [selectedType]);

  // Since the API handles type filtering, we just use the images directly
  // const filteredSliders = sliders?.images || [];

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

  const handleEditSlider = (slider) => {
    navigate(`/dashboard/sliders/edit/${slider._id}`);
  };

  const handleDeleteSlider = (slider) => {
    deleteSlider({ id: slider._id });
    loadSliders();
  };

  const handleViewSlider = (slider) => {
    window.open(slider.link, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <NavbarItem
          title="Sliders"
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
        title="Sliders"
        breadcrumbs={breadcrumbs}
        customBox={<DateRangePicker onChange={handleDateRangeChange} />}
      />

      <div className="py-1 px-4">
        {/* <CustomActionMenu
          title="Slider"
          total={sliderLength}
          onAdd={onAdd}
          showRowSelection={true}
          disableBulkExport={false}
        /> */}

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
            Add New Slider
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


        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.isArray(sliders) && sliders.map((slider) => (
            <Card key={slider._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className={getTypeBadgeColor(slider.type)}>
                    {slider.type}
                  </Badge>
                  <Badge variant={slider.isActive ? "default" : "secondary"}>
                    {slider.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Image */}
                <div className="relative aspect-video mb-3 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={slider.image}
                    alt={`Slider ${slider._id}`}
                    className="object-cover w-full h-full"
                  />
                  {/* Fallback when image fails to load */}
                  <div className="hidden w-full h-full items-center justify-center bg-gray-200 text-gray-500 text-xs p-2 text-center">
                    <div>
                      <div>Image failed to load</div>
                      <div className="break-all mt-1">{slider.image}</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleViewSlider(slider)}
                        className="bg-white/90 hover:bg-white cursor-pointer"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditSlider(slider)}
                        className="bg-white/90 hover:bg-white cursor-pointer"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDeleteSlider(slider)}
                        className="bg-white/90 hover:bg-white cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button> 
                    </div>
                  </div>
                </div>

                {/* Link */}
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="h-3 w-3 text-gray-500" />
                  <Typography variant="small" className="text-gray-600 truncate">
                    {slider.link}
                  </Typography>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-3 w-3 text-gray-500" />
                  <Typography variant="small" className="text-gray-500">
                    {slider.createdAt ? "Created " + format(new Date(sliders?.createdAt), "dd/MM/yyyy") : "N/A"}
                  </Typography>
                </div>

                {/* Updated Date (if different from created) */}
                {slider?.updatedAt !== slider?.createdAt && (
                  <Typography variant="small" className="text-gray-400 mt-1">
                    Updated {formatDistanceToNow(new Date(slider?.updatedAt), { addSuffix: true })}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {Array.isArray(sliders) && sliders.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Typography variant="h4" className="text-gray-600 mb-2">
                No sliders found
              </Typography>
              <Typography variant="small" className="text-gray-500 mb-4">
                {selectedType !== "web" 
                  ? `No sliders found for type "${selectedType}"`
                  : "Get started by adding your first slider"
                }
              </Typography>
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Slider
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Sliders;
