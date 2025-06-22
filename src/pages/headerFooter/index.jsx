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
import { Label } from '@/components/ui/label';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { CustomSpinner } from '@/components/loaders/CustomSpinner';
import { fetchHeaderFooter } from './helpers/fetchHeaderFooter';
import { updateHeaderFooter } from './helpers/updateHeaderFooter';
import { urlToFile } from '@/utils/file/urlToFile';
import { 
  Save, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube,
  X
} from 'lucide-react';

const HeaderFooterSchema = z.object({
  logo: z.any().optional(),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Please enter a valid email address'),
  facebook: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  instagram: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  twitter: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  youtube: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

const HeaderFooter = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [headerFooterData, setHeaderFooterData] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoRemoved, setLogoRemoved] = useState(false);

  const form = useForm({
    resolver: zodResolver(HeaderFooterSchema),
    defaultValues: {
      logo: null,
      address: '',
      phone: '',
      email: '',
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: '',
    },
  });

  useEffect(() => {
    const loadHeaderFooter = async () => {
      try {
        const data = await fetchHeaderFooter();
        console.log('Fetched header footer data:', data);
        if (data) {
          setHeaderFooterData(data);
          
          // Convert logo URL to file if it exists
          if (data.logo && !logoFile) {
            const convertLogo = async () => {
              const file = await urlToFile(data.logo, "existing_logo.jpg");
              if (file) {
                setLogoFile(file);
                form.setValue("logo", [file]);
              }
            };
            convertLogo();
          }
          
          // Reset form with the fetched data
          form.reset({
            logo: null,
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            facebook: data.facebook || '',
            instagram: data.instagram || '',
            twitter: data.twitter || '',
            linkedin: data.linkedin || '',
            youtube: data.youtube || '',
          });
        } else {
          // If no data, reset form with empty values
          form.reset({
            logo: null,
            address: '',
            phone: '',
            email: '',
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: '',
            youtube: '',
          });
        }
      } catch (error) {
        console.error('Error loading header footer data:', error);
        toast.error('Failed to load header footer settings');
      } finally {
        setLoading(false);
      }
    };

    loadHeaderFooter();
  }, [form, logoFile]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('address', data.address);
      formData.append('phone', data.phone);
      formData.append('email', data.email);
      formData.append('facebook', data.facebook);
      formData.append('instagram', data.instagram);
      formData.append('twitter', data.twitter);
      formData.append('linkedin', data.linkedin);
      formData.append('youtube', data.youtube);

      // Add logo file if it exists and hasn't been removed
      if (!logoRemoved && logoFile instanceof File) {
        formData.append('logo', logoFile);
      }

      const result = await updateHeaderFooter(formData);
      if (result) {
        setHeaderFooterData(data);
        toast.success('Header footer settings updated successfully');
      } else {
        toast.error('Failed to update header footer settings');
      }
    } catch (error) {
      console.error('Error updating header footer:', error);
      toast.error('Failed to update header footer settings');
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
                <h1 className="text-3xl font-bold tracking-tight">Header & Footer Settings</h1>
                <p className="text-muted-foreground">
                  Manage your website's header and footer configuration
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 lg:px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Logo Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Logo & Branding
                    </CardTitle>
                    <CardDescription>
                      Update your website logo and branding information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="logo"
                      render={() => (
                        <FormItem>
                          <FormLabel>Upload Logo</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setLogoRemoved(false);
                                  setLogoFile(file);
                                  form.setValue("logo", [file]);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Logo Preview */}
                    {(headerFooterData?.logo || logoFile) && !logoRemoved && (
                      <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium">Current Logo:</Label>
                        <div className="relative">
                          <img 
                            src={logoFile ? URL.createObjectURL(logoFile) : headerFooterData.logo} 
                            alt="Current Logo" 
                            className="h-12 w-auto object-contain rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => {
                              setLogoRemoved(true);
                              setLogoFile(null);
                              form.setValue("logo", null);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>
                      Update your business contact details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Address
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter business address" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter phone number" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="Enter email address" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Social Media Links */}
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                    <CardDescription>
                      Update your social media profile URLs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Facebook className="h-4 w-4" />
                              Facebook URL
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter Facebook URL" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Instagram className="h-4 w-4" />
                              Instagram URL
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter Instagram URL" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Twitter className="h-4 w-4" />
                              Twitter URL
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter Twitter URL" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="linkedin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Linkedin className="h-4 w-4" />
                              LinkedIn URL
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter LinkedIn URL" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="youtube"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Youtube className="h-4 w-4" />
                              YouTube URL
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter YouTube URL" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <CustomSpinner size="sm" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
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

export default HeaderFooter;
