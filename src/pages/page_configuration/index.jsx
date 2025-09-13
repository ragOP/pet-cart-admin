import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavbarItem from "@/components/navbar/navbar_items";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import { AlertCircle, Home, ShoppingCart, User, Settings } from "lucide-react";
import { usePageConfigs } from "./hooks/usePageConfigs";
import PageConfigEditor from "./components/PageConfigEditor";

const PageConfiguration = () => {
    const navigate = useNavigate();
    const { pageKey } = useParams();
    const [activeTab, setActiveTab] = useState(pageKey || "home");

    const {
        data: pageConfigs = [],
        isLoading,
        error
    } = usePageConfigs();

    const breadcrumbs = [{ title: "Page Configuration", isNavigation: false }];

    // Icon mapping for different page types
    const getPageIcon = (pageKey) => {
        const iconMap = {
            home: Home,
            cart: ShoppingCart,
            user: User,
            settings: Settings,
        };
        return iconMap[pageKey] || Home;
    };

    // Format page key for display
    const formatPageKey = (key) => {
        return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
    };

    const handleTabChange = (value) => {
        setActiveTab(value);
        navigate(`/dashboard/page-configuration/${value}`);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col">
                <NavbarItem title="Page Configuration" breadcrumbs={breadcrumbs} />
                <div className="flex justify-center items-center py-8">
                    <CustomSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col">
                <NavbarItem title="Page Configuration" breadcrumbs={breadcrumbs} />
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <div className="text-center">
                        <h3 className="text-lg font-semibold">Failed to load page configurations</h3>
                        <p className="text-muted-foreground">
                            {error.message || "An error occurred while loading the page configurations"}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <NavbarItem
                title="Page Configuration"
                breadcrumbs={breadcrumbs}
            />
            
            <div className="px-8 py-4">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                        {pageConfigs.map((config) => {
                            const IconComponent = getPageIcon(config.pageKey);
                            return (
                                <TabsTrigger 
                                    key={config._id} 
                                    value={config.pageKey}
                                    className="flex items-center gap-2"
                                >
                                    <IconComponent className="h-4 w-4" />
                                    {formatPageKey(config.pageKey)}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                    
                    {pageConfigs.map((config) => (
                        <TabsContent key={config._id} value={config.pageKey} className="mt-6">
                            <PageConfigEditor 
                                pageKey={config.pageKey}
                                pageConfig={config}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
};

export default PageConfiguration;