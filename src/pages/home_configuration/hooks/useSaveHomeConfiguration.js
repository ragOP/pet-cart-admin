import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveHomeConfiguration } from '../helpers/saveHomeConfiguration';
import { toast } from 'sonner';

export const useSaveHomeConfiguration = (onSuccess) => {
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
    onSuccess: (data) => {
      const isUpdate = data?.data?._id;
      toast.success(`Grid configuration ${isUpdate ? 'updated' : 'created'} successfully!`);
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['homeConfiguration'] });
      queryClient.invalidateQueries({ queryKey: ['gridConfigs'] });
      
      // Call custom onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('Save error:', error);
      // Error toast is already shown in mutationFn
    },
  });
}; 