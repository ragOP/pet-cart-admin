import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchHomeSections, saveHomeSections } from "../helpers/homeConfigurationApi";
import { toast } from "sonner";

export const useHomeConfiguration = () => {
    const queryClient = useQueryClient();
    const [sections, setSections] = useState([]);
    const [originalSections, setOriginalSections] = useState([]);

    // Fetch home sections using TanStack Query
    const {
        data: sectionsResponse,
        isLoading,
        error: fetchError
    } = useQuery({
        queryKey: ["homeSections"],
        queryFn: fetchHomeSections,
        select: (data) => {
            // Handle API response structure - return data as-is
            const sectionsData = data?.response?.data || data?.response || data?.data || [];
            return sectionsData;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Update sections when data is fetched
    useState(() => {
        if (sectionsResponse && sectionsResponse.length > 0) {
            setSections(sectionsResponse);
            setOriginalSections(sectionsResponse);
        } else {
            // Fallback to dummy data if no API data
            const dummyData = [
                { id: "banner", label: "Banner" },
                { id: "sliders", label: "Sliders" },
                { id: "features", label: "Features" },
                { id: "products", label: "Featured Products" },
                { id: "testimonials", label: "Testimonials" },
                { id: "newsletter", label: "Newsletter" }
            ];
            setSections(dummyData);
            setOriginalSections(dummyData);
        }
    }, [sectionsResponse]);

    // Save home sections mutation
    const saveMutation = useMutation({
        mutationFn: saveHomeSections,
        onSuccess: (response) => {
            // Handle API response structure
            if (response?.response?.success || response?.success) {
                toast.success("Home sections order saved successfully!");
                setOriginalSections(sections);
                // Invalidate and refetch home sections
                queryClient.invalidateQueries({ queryKey: ["homeSections"] });
            } else {
                const errorMessage = response?.response?.data?.message || response?.error || "Failed to save sections";
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        onError: (error) => {
            console.error("Error saving sections:", error);
            toast.error("Failed to save home sections order");
        },
    });

    const handleSectionsReorder = useCallback((newSections) => {
        setSections(newSections);
    }, []);

    const handleSave = useCallback(async () => {
        try {
            await saveMutation.mutateAsync(sections);
        } catch (error) {
            console.error("Error saving sections:", error);
            throw error;
        }
    }, [sections, saveMutation]);

    const hasUnsavedChanges = useCallback(() => {
        if (sections.length !== originalSections.length) return true;
        
        return sections.some((section, index) => 
            originalSections[index]?.id !== section.id
        );
    }, [sections, originalSections]);

    return {
        sections,
        isLoading: isLoading || saveMutation.isPending,
        isSaving: saveMutation.isPending,
        handleSectionsReorder,
        handleSave,
        hasUnsavedChanges,
        error: fetchError
    };
}; 