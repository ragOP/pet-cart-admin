import React from "react";
import NavbarItem from "@/components/navbar/navbar_items";
import HomeSectionList from "./components/HomeSectionList";
import { useHomeConfiguration } from "./hooks/useHomeConfiguration";

const HomeConfiguration = () => {
    const breadcrumbs = [{ title: "Home Configuration", isNavigation: false }];

    const {
        sections,
        isLoading,
        isSaving,
        handleSectionsReorder,
        handleSave,
        hasUnsavedChanges,
        error
    } = useHomeConfiguration();

    return (
        <div className="flex flex-col">
            <NavbarItem
                title="Home Configuration"
                breadcrumbs={breadcrumbs}
            />
            
            <div className="px-8">
                <HomeSectionList
                    sections={sections}
                    isLoading={isLoading}
                    isSaving={isSaving}
                    onSectionsReorder={handleSectionsReorder}
                    onSave={handleSave}
                    hasUnsavedChanges={hasUnsavedChanges}
                    error={error}
                />
            </div>
        </div>
    );
};

export default HomeConfiguration;