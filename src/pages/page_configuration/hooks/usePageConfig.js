import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPageConfigByKey, updatePageConfig } from "../helpers/pageConfigApi";
import { toast } from "sonner";

export const usePageConfig = (pageKey) => {
    const queryClient = useQueryClient();
    const [sections, setSections] = useState([]);
    const [originalSections, setOriginalSections] = useState([]);

    // Fetch page config using TanStack Query
    const {
        data: pageConfigResponse,
        isLoading,
        error: fetchError
    } = useQuery({
        queryKey: ["pageConfig", pageKey],
        queryFn: () => fetchPageConfigByKey(pageKey),
        select: (data) => {
            // Handle API response structure
            return data?.response?.data || data?.data;
        },
        enabled: !!pageKey,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Update sections when data is fetched
    useEffect(() => {
        if (pageConfigResponse?.sections) {
            const sortedSections = [...pageConfigResponse.sections].sort((a, b) => (a.position || 0) - (b.position || 0));
            setSections(sortedSections);
            setOriginalSections(sortedSections);
        }
    }, [pageConfigResponse]);

    // Update page config mutation
    const updateMutation = useMutation({
        mutationFn: ({ configId, pageKey, sections }) => updatePageConfig(configId, pageKey, sections),
        onSuccess: (response) => {
            // Handle API response structure
            if (response?.response?.success || response?.success) {
                toast.success("Page configuration updated successfully!");
                setOriginalSections(sections);
                // Invalidate and refetch page configs
                queryClient.invalidateQueries({ queryKey: ["pageConfigs"] });
                queryClient.invalidateQueries({ queryKey: ["pageConfig", pageKey] });
            } else {
                const errorMessage = response?.response?.data?.message || response?.error || "Failed to update page config";
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }
        },
        onError: (error) => {
            console.error("Error updating page config:", error);
            toast.error("Failed to update page configuration");
        },
    });

    const handleSectionsReorder = useCallback((newSections) => {
        // Update positions based on new order
        const updatedSections = newSections.map((section, index) => ({
            ...section,
            position: index + 1
        }));
        setSections(updatedSections);
    }, []);

    const handleSave = useCallback(async () => {
        if (!pageConfigResponse?._id) {
            toast.error("Page configuration not found");
            return;
        }

        try {
            await updateMutation.mutateAsync({
                configId: pageConfigResponse._id,
                pageKey: pageConfigResponse.pageKey,
                sections: sections
            });
        } catch (error) {
            console.error("Error saving page config:", error);
            throw error;
        }
    }, [sections, pageConfigResponse, updateMutation]);

    const hasUnsavedChanges = useCallback(() => {
        if (sections.length !== originalSections.length) return true;
        
        return sections.some((section, index) => 
            originalSections[index]?.key !== section.key ||
            originalSections[index]?.position !== section.position
        );
    }, [sections, originalSections]);

    return {
        pageConfig: pageConfigResponse,
        sections,
        isLoading: isLoading || updateMutation.isPending,
        isSaving: updateMutation.isPending,
        handleSectionsReorder,
        handleSave,
        hasUnsavedChanges: hasUnsavedChanges(),
        error: fetchError
    };
}; 