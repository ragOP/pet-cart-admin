import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveHomeConfiguration } from '../helpers/saveHomeConfiguration';
import { toast } from 'sonner';

export const useSaveHomeConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configData) => {
      const response = await saveHomeConfiguration(configData);
      
      // Handle API response and show errors in toast
      if (!response.success) {
        const errorMessage = response.error || response.message || 'Failed to save configuration';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      return response;
    },
    onSuccess: () => {
      toast.success('Grid configuration saved successfully!');
      
      // Invalidate and refetch related queries if needed
      queryClient.invalidateQueries({ queryKey: ['homeConfiguration'] });
    },
    onError: (error) => {
      console.error('Save error:', error);
      // Error toast is already shown in mutationFn
    },
  });
}; 