import React, { useState } from "react";
import NavbarItem from "@/components/navbar/navbar_items";
import HomeConfigList from "./components/HomeConfigList";
import HomeConfigEditor from "./components/HomeConfigEditor";

const HomeConfiguration = () => {
    const [currentView, setCurrentView] = useState("list"); // "list" or "editor"
    const [editingConfig, setEditingConfig] = useState(null);

    const breadcrumbs = [{ title: "Home Configuration", isNavigation: false }];

    const handleEdit = (config) => {
        setEditingConfig(config);
        setCurrentView("editor");
    };

    const handleAdd = () => {
        setEditingConfig(null);
        setCurrentView("editor");
    };

    const handleBackToList = () => {
        setEditingConfig(null);
        setCurrentView("list");
    };

    return (
        <div className="flex flex-col">
            <NavbarItem
                title="Home Configuration"
                breadcrumbs={breadcrumbs}
            />

            <div className="py-1 px-4">
                {currentView === "list" ? (
                    <HomeConfigList
                        onEdit={handleEdit}
                        onAdd={handleAdd}
                    />
                ) : (
                    <HomeConfigEditor
                        onBack={handleBackToList}
                        editingConfig={editingConfig}
                    />
                )}
            </div>
        </div>
    );
};

export default HomeConfiguration; 