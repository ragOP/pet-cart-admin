import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { CustomSpinner } from '@/components/loaders/CustomSpinner';
import { fetchAdBanner } from './helpers/fetchAdBanner';
import { updateAdBanner } from './helpers/updateAdBanner';
import { fetchProducts } from './helpers/fetchProducts';
import MultiSelectProducts from './components/MultiSelectProducts';
import { 
  Save, 
  Megaphone,
  Link as LinkIcon,
  FileText
} from 'lucide-react';

const AdBannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  link: z.string().url('Please enter a valid URL'),
  products: z.array(z.string()).min(1, 'At least one product must be selected'),
});

const AdBanner = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);

  const form = useForm({
    resolver: zodResolver(AdBannerSchema),
    defaultValues: {
      title: '',
      description: '',
      link: '',
      products: [],
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load products first
        const productsData = await fetchProducts();
        setProducts(productsData || []);

        // Load ad banner data
        const adBannerData = await fetchAdBanner();
        console.log('Fetched ad banner data:', adBannerData);
        
        if (adBannerData) {
          // Reset form with the fetched data
          form.reset({
            title: adBannerData.title || '',
            description: adBannerData.description || '',
            link: adBannerData.link || '',
            products: adBannerData.products?.map(product => product._id) || [],
          });
        } else {
          // If no data, reset form with empty values
          form.reset({
            title: '',
            description: '',
            link: '',
            products: [],
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load ad banner settings');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [form]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const result = await updateAdBanner(data);
      if (result) {
        toast.success('Ad banner settings updated successfully');
      } else {
        toast.error('Failed to update ad banner settings');
      }
    } catch (error) {
      console.error('Error updating ad banner:', error);
      toast.error('Failed to update ad banner settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <CustomSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Ad Banner Settings</h1>
                <p className="text-muted-foreground">
                  Manage your website's advertisement banner configuration
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 lg:px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Megaphone className="h-5 w-5" />
                      Banner Information
                    </CardTitle>
                    <CardDescription>
                      Configure the main advertisement banner that appears on your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Banner Title
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter banner title" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter banner description" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Link */}
                    <FormField
                      control={form.control}
                      name="link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            Banner Link
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="url"
                              placeholder="https://example.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Products */}
                    <FormField
                      control={form.control}
                      name="products"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Products</FormLabel>
                          <FormControl>
                            <MultiSelectProducts
                              products={products}
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
