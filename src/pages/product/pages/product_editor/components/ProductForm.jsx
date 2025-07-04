import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import { fetchCategories } from "@/pages/category/helpers/fetchCategories";
import { fetchSubCategoriesByCategoryId } from "@/pages/sub_category/helpers/fetchSubCategories";
import { fetchBreeds } from "@/pages/breed/helpers/fetchBreeds";
import { fetchBrands } from "@/pages/brand/helpers/fetchBrand";
import { fetchHsnCodes } from "@/pages/hsn_codes/helpers/fetchHsnCodes";
import { createProduct } from "../helper/createProduct";
import { updateProduct } from "../helper/updateProduct";
import { urlToFile } from "@/utils/file/urlToFile";
import { slugify } from "@/utils/convert_to_slug";
import { Switch } from "@/components/ui/switch";
import MultiSelectBreeds from "./MultiSelectBreeds";
import { Checkbox } from "@/components/ui/checkbox";
import ProductImage from "./ProductImage";

const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];

const imageArrayValidator = z
  .any()
  .optional()
  .refine((files) => {
    if (!files || files.length === 0) return true;
    if (!Array.isArray(files)) return false;
    return files.every((file) => file?.type && allowedTypes.includes(file.type));
  }, {
    message: "Only JPEG, PNG, JPG, GIF, or WEBP images are allowed",
  });

const VariantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().positive("Price must be positive"),
  salePrice: z.coerce.number().optional(),
  stock: z.coerce.number().nonnegative().optional(),
  weight: z.string().optional(),
  images: imageArrayValidator,
  attributes: z.record(z.string()).optional(),
  isActive: z.boolean().optional()
});

const ProductFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  subCategoryId: z.string().min(1, "Please select a subcategory"),
  price: z.coerce.number().positive("Price must be a positive number"),
  salePrice: z.coerce.number().optional(),
  stock: z.coerce.number().nonnegative(),
  brandId: z.string().min(1, "Please select a brand"),
  breedIds: z.optional(z.array(z.string())),
  hsnCodeId: z.string().min(1, "Please select a HSN code"),
  isBestSeller: z.boolean().default(false),
  isEverydayEssential: z.boolean().default(false),
  isNewleyLaunched: z.boolean().default(false),
  isAddToCart: z.boolean().default(false),
  images: imageArrayValidator,
  variants: z.array(VariantSchema).min(1, "At least one variant is required")
});


const ProductForm = ({ isEdit = false, initialData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.categoryId || "");
  const [imageFiles, setImageFiles] = useState([]);
  const [variantImages, setVariantImages] = useState([]);
  const [newBreedName, setNewBreedName] = useState("");
  const [isAddingBreed, setIsAddingBreed] = useState(false);
  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState('');
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const variantImageMap = useRef({})

  // Process initial data for the form
  const getDefaultValues = () => {
    if (!initialData) {
      return {
        title: "",
        description: "",
        categoryId: "",
        subCategoryId: "",
        brandId: "",
        breedIds: [],
        hsnCodeId: "",
        isBestSeller: false,
        isEverydayEssential: false,
        isNewleyLaunched: false,
        isAddToCart: false,
        price: 0,
        salePrice: 0,
        stock: 0,
        images: [],
        variants: [
          { price: 0, salePrice: 0, stock: 0, weight: "", isActive: true, attributes: {} }
        ]
      };
    }

    return {
      title: initialData.title || "",
      description: initialData.description || "",
      categoryId: initialData.categoryId?._id || "",
      subCategoryId: initialData.subCategoryId?._id || "",
      brandId: initialData.brandId?._id || "",
      breedIds: initialData.breedId?.map(breed => breed._id) || [],
      hsnCodeId: initialData.hsnCode?._id || "",
      isBestSeller: initialData.isBestSeller || false,
      isEverydayEssential: initialData.isEverydayEssential || false,
      isNewleyLaunched: initialData.newleyLaunched || false,
      isAddToCart: initialData.isAddToCart || false,
      price: initialData.price || 0,
      salePrice: initialData.salePrice || 0,
      stock: initialData.stock || 0,
      images: [],
      variants: initialData.variants?.length > 0 
        ? initialData.variants.map(variant => ({
            ...variant,
            images: []
          }))
        : [{ price: 0, salePrice: 0, stock: 0, weight: "", isActive: true, attributes: {} }]
    };
  };

  const form = useForm({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: getDefaultValues()
  });

  // Set category ID when initial data changes
  useEffect(() => {
    if (initialData?.categoryId?._id) {
      setSelectedCategoryId(initialData.categoryId._id);
    }
  }, [initialData]);

  const { fields: variantFields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });


  const { data: categoryListRes } = useQuery({
    queryKey: ["all_categories"],
    queryFn: fetchCategories
  });

  const { data: subCategoryListRes } = useQuery({
    queryKey: ["subcategories", selectedCategoryId],
    queryFn: () => fetchSubCategoriesByCategoryId({ params: { categoryId: selectedCategoryId } }),
    enabled: !!selectedCategoryId,
  });

  const { data: breedListRes, refetch: refetchBreeds } = useQuery({
    queryKey: ["breeds"],
    queryFn: fetchBreeds
  });

  const { data: brandListRes } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands
  });

  const { data: hsnCodeListRes } = useQuery({
    queryKey: ["hsn_codes"],
    queryFn: fetchHsnCodes
  });

  const categories = categoryListRes?.data?.categories || [];
  const subCategories = subCategoryListRes?.data || [];
  const breeds = breedListRes?.data || [];
  const brands = brandListRes?.data || [];
  const hsnCodes = hsnCodeListRes?.response?.data?.data || [];

  // Handle image and variant image loading
  useEffect(() => {
    const loadImages = async () => {
      if (!isEdit || !initialData) return;

      try {
        // Load main product images
        if (initialData.images?.length > 0) {
          const files = await Promise.all(
            initialData.images.map((img, index) =>
              urlToFile(img, `product_image_${index}.jpg`)
            )
          );
          setImageFiles(files);
          form.setValue("images", files);
        }

        // Load variant images
        if (initialData.variants?.length > 0) {
          const variantImagesMap = {};
          
          for (let i = 0; i < initialData.variants.length; i++) {
            const variant = initialData.variants[i];
            if (variant.images?.length > 0) {
              try {
                const files = await Promise.all(
                  variant.images.map((img, imgIndex) =>
                    urlToFile(img, `variant_${i}_image_${imgIndex}.jpg`)
                  )
                );
                variantImagesMap[i] = files;
                
                // Update variant images in form
                form.setValue(`variants.${i}.images`, files);
              } catch (error) {
                console.error(`Error loading variant ${i} images:`, error);
              }
            }
          }
          
          if (Object.keys(variantImagesMap).length > 0) {
            variantImageMap.current = variantImagesMap;
          }
        }
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    loadImages();
  }, [isEdit, initialData, form]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = new FormData();

      payload.append("title", data.title);
      payload.append("slug", slugify(data.title));
      payload.append("description", data.description);
      payload.append("categoryId", data.categoryId);
      payload.append("subCategoryId", data.subCategoryId);
      payload.append("price", data.price);
      payload.append("salePrice", data.salePrice);
      payload.append("stock", data.stock);
      payload.append("brandId", data.brandId);
      payload.append("hsnCode", data.hsnCodeId);
      payload.append("isAddToCart", data.isAddToCart);
      payload.append("isBestSeller", data.isBestSeller);
      payload.append("isNewleyLaunched", data.isNewleyLaunched);
      payload.append("isEverydayEssential", data.isEverydayEssential);

      // Breed IDs
      data.breedIds.forEach((id) => payload.append("breedId[]", id));

      // Product Images
      imageFiles?.forEach((file) => {
        if (file instanceof File) {
          payload.append("images", file);
        }
      });

      // Add variant data & variant image map
      const variantImageMapArray = [];

      data.variants.forEach((variant, i) => {
        const { images, ...rest } = variant;
        payload.append("variants[]", JSON.stringify(rest));

        const files = variantImageMap.current?.[i] || [];
        files.forEach((file) => {
          payload.append("variantImages", file);
          variantImageMapArray.push({ index: i, name: file.name });
        });
      });

      payload.append("variantImageMap", JSON.stringify(variantImageMapArray));

      if (isEdit) {
        return await updateProduct({ id: initialData._id, payload });
      } else {
        return await createProduct(payload);
      }
    },

    onSuccess: (res) => {
      if (res?.success || res?.response?.success) {
        queryClient.invalidateQueries(["product", initialData?._id]);
        toast.success(`Product ${isEdit ? "updated" : "created"} successfully`);
        navigate("/dashboard/product");
      } else {
        toast.error(res?.response?.message || `Failed to ${isEdit ? "update" : "create"} product`);
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} product`);
    },
  });

  const validateSalePrice = (salePrice, price, context) => {
    if (salePrice && price && Number(salePrice) > Number(price)) {
      toast.warning('Sale price cannot be greater than the regular price');
      return false;
    }
    return true;
  };

  const onSubmit = (data) => {
    // Validate main product price vs sale price
    if (data.salePrice && !validateSalePrice(data.salePrice, data.price)) {
      return;
    }

    // Validate variant prices
    const hasInvalidVariant = data.variants.some(variant => {
      if (variant.salePrice && !validateSalePrice(variant.salePrice, variant.price)) {
        return true;
      }
      return false;
    });

    if (hasInvalidVariant) {
      return;
    }

    mutation.mutate(data);
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    form.setValue("images", newFiles);
  };

  const handleVariantImageUpload = (e, variantIndex) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = files.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (validFiles.length === 0) {
      toast.error("Only image files are allowed");
      return;
    }

    // Update variant images in the form
    const currentVariantImages = form.getValues(`variants.${variantIndex}.images`) || [];
    const newVariantImages = [...currentVariantImages, ...validFiles];
    
    // Update form with new images
    form.setValue(`variants.${variantIndex}.images`, newVariantImages);

    // Update variant image map for preview
    const currentVariantImagesMap = variantImageMap.current[variantIndex] || [];
    variantImageMap.current = {
      ...variantImageMap.current,
      [variantIndex]: [...currentVariantImagesMap, ...validFiles]
    };

    // Trigger form validation
    form.trigger(`variants.${variantIndex}.images`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter product title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter product description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price */}
        <FormField
          name="price"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter price" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sale Price */}
        <FormField
          name="salePrice"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sale Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter sale price"
                  {...field}
                  onBlur={(e) => {
                    const price = form.getValues('price');
                    if (e.target.value && price && Number(e.target.value) > Number(price)) {
                      toast.warning('Sale price cannot be greater than the regular price');
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stock */}
        <FormField
          name="stock"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter stock" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  {...field}
                  onChange={(e) => {
                    const handleCategoryChange = (value) => {
                      setSelectedCategoryId(value);
                      form.setValue("categoryId", value);
                      form.setValue("subCategoryId", ""); // Reset subcategory when category changes
                      
                      // Clear variant images when category changes
                      variantImageMap.current = {};
                    };
                    handleCategoryChange(e.target.value);
                  }}
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SubCategory */}
        <FormField
          name="subCategoryId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>SubCategory</FormLabel>
              <FormControl>
                <select
                  {...field}
                  disabled={!selectedCategoryId}
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                >
                  <option value="">Select SubCategory</option>
                  {subCategories.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Brand */}
        <FormField
          name="brandId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* HSN Code */}
        <FormField
          name="hsnCodeId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>HSN Code</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                >
                  <option value="">Select HSN Code</option>
                  {hsnCodes.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.hsn_code}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Breeds */}
        <FormField
          control={form.control}
          name="breedIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breeds</FormLabel>
              <FormControl>
                <MultiSelectBreeds
                  breeds={breeds}
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* isBestSeller */}
        <FormField
          control={form.control}
          name="isBestSeller"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Best Seller</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* isEverydayEssential */}
        <FormField
          control={form.control}
          name="isEverydayEssential"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Everyday Essential</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* isNewleyLaunched */}
        <FormField
          control={form.control}
          name="isNewleyLaunched"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Newly Launched</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* isAddToCart */}
        <FormField
          control={form.control}
          name="isAddToCart"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Add To Cart</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Images */}
        <FormField
          name="images"
          control={form.control}
          render={() => (
            <FormItem>
              <FormLabel>Product Images</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setImageFiles(files);
                    form.setValue("images", files);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Previews */}
        {imageFiles?.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4">
            {imageFiles.map((file, index) => (
              <div key={index} className="relative">
                <ProductImage
                  image={file instanceof File ? URL.createObjectURL(file) : file}
                  alt={`preview-${index}`}
                  className="w-32 h-32 object-cover rounded"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  onClick={() => removeImage(index)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <FormLabel className="block text-lg font-semibold">
            Variants
          </FormLabel>
          {variantFields.map((variant, index) => (
            <div
              key={variant._id}
              className="border p-4 rounded space-y-2 relative"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField
                  name={`variants.${index}.sku`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={`variants.${index}.price`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={`variants.${index}.salePrice`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onBlur={(e) => {
                            const price = form.getValues(`variants.${index}.price`);
                            if (e.target.value && price && Number(e.target.value) > Number(price)) {
                              toast.warning('Variant sale price cannot be greater than the variant price');
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={`variants.${index}.stock`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={`variants.${index}.weight`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name={`variants.${index}.attributes`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attributes</FormLabel>
                      {Object.entries(field.value || {}).map(([key, value], idx) => (
                        <div className="flex gap-2 mb-2" key={idx}>
                          <Input placeholder="Key" value={key} disabled />
                          <Input
                            placeholder="Value"
                            defaultValue={value}
                            onChange={(e) => {
                              const newAttributes = {
                                ...(field.value || {}),
                              };
                              newAttributes[key] = e.target.value;
                              field.onChange(newAttributes);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              const newAttributes = {
                                ...(field.value || {}),
                              };
                              delete newAttributes[key];
                              field.onChange(newAttributes);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}

                      <Dialog
                        open={isAttributeDialogOpen === index}
                        onOpenChange={(open) => setIsAttributeDialogOpen(open ? index : false)}
                      >
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline">
                            Add Attribute
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Attribute</DialogTitle>
                            <DialogDescription>
                              Enter the name of the new attribute for variant {index + 1}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Attribute name"
                              value={newAttributeName}
                              onChange={(e) => setNewAttributeName(e.target.value)}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setNewAttributeName('');
                                setIsAttributeDialogOpen(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                if (newAttributeName.trim()) {
                                  const newAttributes = {
                                    ...(field.value || {}),
                                  };
                                  newAttributes[newAttributeName.trim()] = "";
                                  field.onChange(newAttributes);
                                  setNewAttributeName('');
                                  setIsAttributeDialogOpen(false);
                                }
                              }}
                            >
                              Add
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </FormItem>
                  )}
                />

                <FormField
                  name={`variants.${index}.images`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variant Images</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            variantImageMap.current[index] = files; // 👈 attach files by variant index
                            field.onChange(files);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField name={`variants.${index}.isActive`} control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      {field.value ? "Active" : "Inactive"}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-2 right-2 text-red-600"
              >
                <X size={18} />
              </button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() =>
              append({
                sku: "",
                price: 0,
                salePrice: 0,
                stock: 0,
                weight: "",
                isActive: false,
                attributes: {},
              })
            }
          >
            <Plus size={18} /> Add Variant
          </Button>
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full md:w-auto"
        >
          {mutation.isPending
            ? "Processing..."
            : isEdit
              ? "Update Product"
              : "Create Product"}
        </Button>
      </form>
    </Form>
  );
};

export default ProductForm;