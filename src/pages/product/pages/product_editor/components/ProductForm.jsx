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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import { fetchCategories } from "@/pages/category/helpers/fetchCategories";
import { fetchSubCategoriesByCategoryId } from "@/pages/sub_category/helpers/fetchSubCategories";
import { fetchBreeds } from "@/pages/breed/helpers/fetchBreeds";
import { fetchBrands } from "@/pages/brand/helpers/fetchBrand";
import { createProduct } from "../helper/createProduct";
import { updateProduct } from "../helper/updateProduct";
import { urlToFile } from "@/utils/file/urlToFile";
import { slugify } from "@/utils/convert_to_slug";
import { Switch } from "@/components/ui/switch";
import MultiSelectBreeds from "./MultiSelectBreeds";
import { set } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

const VariantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().positive("Price must be positive"),
  salePrice: z.coerce.number().optional(),
  stock: z.coerce.number().nonnegative().optional(),
  weight: z.string().optional(),
  barcode: z.string().optional(),
  images: z.any().optional().refine((files) => {
    if (!files || files.length === 0) return true;
    return Array.isArray(files) && files.length > 0;
  }, { message: "At least one image is required" }),
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
  brandId: z.string().min(1, "Please select a brand"),
  breedIds: z.optional(z.array(z.string())),
  isBestSeller: z.boolean().default(false),
  isEverydayEssential: z.boolean().default(false),
  isNewleyLaunched: z.boolean().default(false),
  isAddToCart: z.boolean().default(false),
  images: z.any().refine((files) => {
    if (!files || files.length === 0) return true;
    return Array.isArray(files) && files.length > 0;
  }, { message: "At least one image is required" }),
  variants: z.array(VariantSchema).min(1, "At least one variant is required")
});

const ProductForm = ({ isEdit = false, initialData }) => {
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.categoryId || "");
  const [imageFiles, setImageFiles] = useState([]);
  const [variantImages, setVariantImages] = useState([]);
  const [newBreedName, setNewBreedName] = useState("");
  const [isAddingBreed, setIsAddingBreed] = useState(false);
  const variantImageMap = useRef({})

  const form = useForm({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || "",
      subCategoryId: initialData?.subCategoryId || "",
      brandId: initialData?.brandId || "",
      breedIds: initialData?.breedIds || [],
      isBestSeller: initialData?.isBestSeller || false,
      isEverydayEssential: initialData?.isEverydayEssential || false,
      isNewleyLaunched: initialData?.isNewleyLaunched || false,
      isAddToCart: initialData?.isAddToCart || false,
      price: initialData?.price || 0,
      images: [],
      variants: initialData?.variants || [
        { sku: "", price: 0, salePrice: 0, stock: 0, weight: "", barcode: "" }
      ],
    },
  });

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

  const categories = categoryListRes?.categories || [];
  const subCategories = subCategoryListRes?.data || [];
  const breeds = breedListRes?.data || [];
  const brands = brandListRes?.data || [];

  useEffect(() => {
    if (isEdit && initialData?.images?.length > 0) {
      const convertImages = async () => {
        const files = await Promise.all(
          initialData.images.map((img, index) => 
            urlToFile(img, `product_image_${index}.jpg`)
          )
        );
        setImageFiles(files);
        form.setValue("images", files);
      };
      convertImages();
    }
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
      payload.append("brandId", data.brandId);
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

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    form.setValue("images", newFiles);
  };

  const generateFakeBarcode = () => {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString(); // 12-digit fake barcode
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
                />
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
                    const selected = e.target.value;
                    setSelectedCategoryId(selected);
                    form.setValue("categoryId", selected);
                    form.setValue("subCategoryId", "");
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
                <FormDescription>
                  This product will appear on the best seller page.
                </FormDescription>
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
                <FormDescription>
                  This product will appear on the home page.
                </FormDescription>
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
                <FormDescription>
                  This product will appear on the newly launched page.
                </FormDescription>
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
                <FormDescription>
                  This product will appear on the add to cart page.
                </FormDescription>
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
                <img
                  src={file instanceof File ? URL.createObjectURL(file) : file}
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
              key={variant.id}
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
                        <Input type="number" {...field} />
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
                  name={`variants.${index}.barcode`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <div className="grid lg:grid-cols-5 gap-4">
                        <FormControl className="col-span-3">
                          <Input {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          className={"col-span-2"}
                          onClick={() =>
                            form.setValue(
                              `variants.${index}.barcode`,
                              generateFakeBarcode()
                            )
                          }
                        >
                          Generate Barcode
                        </Button>
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name={`variants.${index}.attributes`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Attributes
                      </FormLabel>
                      {Object.entries(form.watch("attributes") || {}).map(
                        ([key, value], idx) => (
                          <div className="flex gap-2 mb-2" key={idx}>
                            <Input placeholder="Key" value={key} disabled />
                            <Input
                              placeholder="Value"
                              defaultValue={value}
                              onChange={(e) => {
                                const newAttributes = {
                                  ...(form.getValues("attributes") || {}),
                                };
                                newAttributes[key] = e.target.value;
                                form.setValue("attributes", newAttributes);
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                const newAttributes = {
                                  ...(form.getValues("attributes") || {}),
                                };
                                delete newAttributes[key];
                                form.setValue("attributes", newAttributes);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const key = prompt("Enter attribute name:");
                          if (key) {
                            const newAttributes = {
                              ...(form.getValues("attributes") || {}),
                            };
                            newAttributes[key] = "";
                            form.setValue("attributes", newAttributes);
                          }
                        }}
                      >
                        Add Attribute
                      </Button>
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

                <FormField name="isActive" control={form.control} render={({ field }) => (
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
                barcode: "",
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