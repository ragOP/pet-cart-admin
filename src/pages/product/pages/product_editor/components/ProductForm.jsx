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
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { X, Plus } from "lucide-react";
import { fetchCategories } from "@/pages/category/helpers/fetchCategories";
import { fetchSubCategoriesByCategoryId } from "@/pages/sub_category/helpers/fetchSubCategories";
import { fetchBreeds } from "@/pages/breed/helpers/fetchBreeds";
import { fetchBrands } from "@/pages/brand/helpers/fetchBrand";
import { fetchHsnCodes } from "@/pages/hsn_codes/helpers/fetchHsnCodes";
import { createProduct } from "../helper/createProduct";
import { updateProduct } from "../helper/updateProduct";
import { fetchProducts } from "../../../helpers/fetchProducts";
import { urlToFile } from "@/utils/file/urlToFile";
import { slugify } from "@/utils/convert_to_slug";
import { Switch } from "@/components/ui/switch";
import MultiSelectBreeds from "./MultiSelectBreeds";
import { Checkbox } from "@/components/ui/checkbox";
import ProductImage from "./ProductImage";
import { Textarea } from "@/components/ui/textarea";

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
  sku: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  salePrice: z.coerce.number().optional(),
  stock: z.coerce.number().nonnegative().optional(),
  weight: z.coerce.number().optional(),
  images: imageArrayValidator,
  attributes: z.record(z.string()).optional(),
  isActive: z.boolean().optional()
});

const ProductFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  sku: z.string().optional(),
  importedBy: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  categoryId: z.string().min(1, "Please select a category"),
  subCategoryId: z.string().min(1, "Please select a subcategory"),
  price: z.coerce.number().positive("Price must be a positive number"),
  salePrice: z.coerce.number().optional(),
  stock: z.coerce.number().nonnegative(),
  weight: z.coerce.number().optional(),
  brandId: z.string().min(1, "Please select a brand"),
  breedIds: z.optional(z.array(z.string())),
  hsnCodeId: z.string().min(1, "Please select a HSN code"),
  isBestSeller: z.boolean().default(false),
  isVeg: z.boolean().default(false),
  lifeStage: z.enum(['Puppy', 'Adult', 'Starter', 'Kitten']).default('Adult'),
  breedSize: z.enum(['Mini', 'Medium', 'Large', 'Giant']).default('Medium'),
  productType: z.enum(['Wet Food', 'Dry Food', 'Food Toppers', 'Treat']).default('Dry Food'),
  images: imageArrayValidator,
  variants: z.array(VariantSchema).min(1, "At least one variant is required")
});


const ProductForm = ({ isEdit = false, initialData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialData?.categoryId || "");
  const [imageFiles, setImageFiles] = useState([]);
  
  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState('');
  const variantImageMap = useRef({})
  

  const getDefaultValues = () => {
    if (!initialData) {
      return {
        title: "",
        description: "",
        sku: "",
        importedBy: "",
        countryOfOrigin: "",
        categoryId: "",
        subCategoryId: "",
        brandId: "",
        breedIds: [],
        hsnCodeId: "",
        isBestSeller: false,
        isVeg: false,
        lifeStage: 'Adult',
        breedSize: 'Medium',
        productType: 'Dry Food',
        price: 0,
        salePrice: 0,
        stock: 0,
        weight: 0,  
        images: [],
        variants: [
          { sku: "", price: 0, salePrice: 0, stock: 0, weight: 0, isActive: true, attributes: {} }
        ]
      };
    }

    return {
      title: initialData.title || "",
      description: initialData.description || "",
      sku: initialData.sku || "",
      importedBy: initialData.importedBy || "",
      countryOfOrigin: initialData.countryOfOrigin || "",
      categoryId: initialData.categoryId?._id || "",
      subCategoryId: initialData.subCategoryId?._id || "",
      brandId: initialData.brandId?._id || "",
      breedIds: initialData.breedId?.map(breed => breed._id) || [],
      hsnCodeId: initialData.hsnCode?._id || "",
      isBestSeller: initialData.isBestSeller || false,
      isVeg: initialData.isVeg || false,
      lifeStage: initialData.lifeStage || 'Adult',
      breedSize: initialData.breedSize || 'Medium',
      productType: initialData.productType || 'Dry Food',
      price: initialData.price || 0,
      salePrice: initialData.salePrice || 0,
      stock: initialData.stock || 0,
      weight: initialData.weight || 0,
      images: [],
      variants: initialData.variants?.length > 0 
        ? initialData.variants.map(variant => ({
            ...variant,
            images: []
          }))
        : [{ sku: "", price: 0, salePrice: 0, stock: 0, weight: 0, isActive: true, attributes: {} }]
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

  const { data: breedListRes } = useQuery({
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

  // Fetch total product count for serial number generation
  const { data: productsCountRes } = useQuery({
    queryKey: ["products_count"],
    queryFn: () => fetchProducts({ params: { per_page: 1000 } }), // Fetch all products to get total count
    enabled: !isEdit, // Only fetch for new products
  });

  const categories = useMemo(() => categoryListRes?.data?.categories || [], [categoryListRes?.data?.categories]);
  const subCategories = useMemo(() => subCategoryListRes?.data || [], [subCategoryListRes?.data]);
  const breeds = breedListRes?.data || [];
  const brands = useMemo(() => brandListRes?.data || [], [brandListRes?.data]);
  const hsnCodes = hsnCodeListRes?.response?.data?.data || [];

  // Function to generate SKU based on format [CATEGORY]-[BRAND]-[SUBCAT]-[FLAVOUR/VARIANT]-[SIZE]-[SERIAL]
  const generateSKU = useCallback((categoryName, brandName, subCategoryName, variantName, breedSize) => {
    const skuParts = [];
    
    // Add category (first 3 letters)
    if (categoryName && categoryName.length >= 3) {
      skuParts.push(categoryName.substring(0, 3).toUpperCase());
    }
    
    // Add brand (first 3 letters)
    if (brandName && brandName.length >= 3) {
      skuParts.push(brandName.substring(0, 3).toUpperCase());
    }
    
    // Add subcategory (first 3 letters)
    if (subCategoryName && subCategoryName.length >= 3) {
      skuParts.push(subCategoryName.substring(0, 3).toUpperCase());
    }
    
    // Add variant/flavour (first 3 letters)
    if (variantName && variantName.length >= 3) {
      skuParts.push(variantName.substring(0, 3).toUpperCase());
    }
    
    // Add size (first 3 letters)
    if (breedSize && breedSize.length >= 3) {
      skuParts.push(breedSize.substring(0, 3).toUpperCase());
    }
    
    // Add serial number based on total product count + 1
    const totalProducts = productsCountRes?.data?.total || productsCountRes?.data?.length || 0;
    console.log('Product count response:', productsCountRes);
    console.log('Total products:', totalProducts);
    const serial = (totalProducts + 1).toString().padStart(4, '0');
    skuParts.push(serial);
    
    return skuParts.join('-');
  }, [productsCountRes]);

  // Function to generate variant SKU
  const generateVariantSKU = useCallback((categoryName, brandName, subCategoryName, variantAttributes, variantIndex) => {
    const skuParts = [];
    
    // Add category (first 3 letters)
    if (categoryName && categoryName.length >= 3) {
      skuParts.push(categoryName.substring(0, 3).toUpperCase());
    }
    
    // Add brand (first 3 letters)
    if (brandName && brandName.length >= 3) {
      skuParts.push(brandName.substring(0, 3).toUpperCase());
    }
    
    // Add subcategory (first 3 letters)
    if (subCategoryName && subCategoryName.length >= 3) {
      skuParts.push(subCategoryName.substring(0, 3).toUpperCase());
    }
    
    // Extract variant info and size from attributes
    if (variantAttributes && Object.keys(variantAttributes).length > 0) {
      // Get all attribute values and filter out empty ones
      const attributeValues = Object.values(variantAttributes).filter(value => 
        value && typeof value === 'string' && value.trim().length >= 3
      );
      
      console.log('Filtered attribute values:', attributeValues);
      
      // Add up to 2 attribute values to SKU (variant info and size)
      attributeValues.slice(0, 2).forEach(attrValue => {
        skuParts.push(attrValue.substring(0, 3).toUpperCase());
      });
    }
    
    // Add variant identifier (V for variant) and variant index
    const variantSerial = `VAR-${(variantIndex + 1).toString().padStart(3, '0')}`;
    skuParts.push(variantSerial);
    
    return skuParts.join('-');
  }, []);

  // Function to update all variant SKUs
  const updateVariantSKUs = useCallback(() => {
    if (brands.length === 0 || subCategories.length === 0) return;
    
    const formValues = form.getValues();
    const categoryName = categories.find(c => c._id === formValues.categoryId)?.name;
    const brandName = brands.find(b => b._id === formValues.brandId)?.name;
    const subCategoryName = subCategories.find(s => s._id === formValues.subCategoryId)?.name;
    
    if (categoryName && brandName && subCategoryName) {
      formValues.variants?.forEach((variant, index) => {
        // For new products, always update variant SKUs
        // For editing, only update if SKU is empty (manual override)
        if (!isEdit || !variant.sku) {
          const variantSKU = generateVariantSKU(categoryName, brandName, subCategoryName, variant.attributes || {}, index);
          form.setValue(`variants.${index}.sku`, variantSKU);
        }
      });
    }
  }, [categories, brands, subCategories, form, generateVariantSKU, isEdit]);

  const watchedFields = form.watch(['categoryId', 'brandId', 'subCategoryId', 'title', 'breedSize']);
  const watchedVariants = form.watch('variants');
  const [lastGeneratedSKU, setLastGeneratedSKU] = useState('');
  
  // For new products - always update SKU when fields change
  useEffect(() => {
    if (isEdit) return;
    
    if (categories.length > 0 && brands.length > 0 && subCategories.length > 0) {
      const formValues = form.getValues();
      const categoryName = categories.find(c => c._id === formValues.categoryId)?.name;
      const brandName = brands.find(b => b._id === formValues.brandId)?.name;
      const subCategoryName = subCategories.find(s => s._id === formValues.subCategoryId)?.name;
      const variantName = formValues.title;
      const breedSize = formValues.breedSize;
      
      if (categoryName && brandName && subCategoryName && variantName && breedSize) {
        const generatedSKU = generateSKU(categoryName, brandName, subCategoryName, variantName, breedSize);
        
        if (generatedSKU !== lastGeneratedSKU) {
          form.setValue('sku', generatedSKU);
          setLastGeneratedSKU(generatedSKU);
          
          updateVariantSKUs();
        }
      }
    }
  }, [watchedFields, categories, brands, subCategories, isEdit, generateSKU, updateVariantSKUs, lastGeneratedSKU, form, productsCountRes]);

  // For editing products - show warning every time SKU-affecting fields change
  useEffect(() => {
    if (!isEdit) return;
    
    // Check if any SKU-affecting fields have changed from initial values
    const formValues = form.getValues();
    const initialValues = initialData;
    
    const fieldsChanged = 
      (formValues.categoryId !== initialValues?.categoryId?._id) ||
      (formValues.brandId !== initialValues?.brandId?._id) ||
      (formValues.subCategoryId !== initialValues?.subCategoryId?._id) ||
      (formValues.title !== initialValues?.title) ||
      (formValues.breedSize !== initialValues?.breedSize);
    
    if (fieldsChanged) {
      toast.warning("Changing these fields might hamper your SKU. Please check your SKU and update manually.");
    }
  }, [watchedFields, isEdit, initialData, form]);

  // Watch for variant attribute changes and update variant SKUs
  useEffect(() => {
    console.log('Variant SKU update useEffect triggered');
    console.log('watchedVariants:', watchedVariants);
    console.log('isEdit:', isEdit);
    
    if (isEdit) return; // Only for new products
    
    if (categories.length > 0 && brands.length > 0 && subCategories.length > 0) {
      const formValues = form.getValues();
      console.log('Current form values:', formValues);
      
      const categoryName = categories.find(c => c._id === formValues.categoryId)?.name;
      const brandName = brands.find(b => b._id === formValues.brandId)?.name;
      const subCategoryName = subCategories.find(s => s._id === formValues.subCategoryId)?.name;
      
      console.log('Category/Brand/SubCategory names:', { categoryName, brandName, subCategoryName });
      
      if (categoryName && brandName && subCategoryName) {
        formValues.variants?.forEach((variant, index) => {
          console.log(`Processing variant ${index}:`, variant);
          console.log(`Variant ${index} attributes:`, variant.attributes);
          console.log(`Variant ${index} SKU:`, variant.sku);
          
          // Always generate new SKU when attributes change (for new products)
          const variantSKU = generateVariantSKU(categoryName, brandName, subCategoryName, variant.attributes || {}, index);
          console.log(`Generated SKU for variant ${index}:`, variantSKU);
          
          // Only update if the generated SKU is different from current SKU
          if (variantSKU !== variant.sku) {
            console.log(`Updating variant ${index} SKU from "${variant.sku}" to "${variantSKU}"`);
            form.setValue(`variants.${index}.sku`, variantSKU);
          }
        });
      }
    }
  }, [watchedVariants, categories, brands, subCategories, isEdit, form, generateVariantSKU]);

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
      payload.append("sku", data.sku);
      payload.append("importedBy", data.importedBy || "");
      payload.append("countryOfOrigin", data.countryOfOrigin || "");
      payload.append("categoryId", data.categoryId);
      payload.append("subCategoryId", data.subCategoryId);
      payload.append("price", data.price);
      payload.append("salePrice", data.salePrice);
      payload.append("stock", data.stock);
      payload.append("weight", data.weight);
      payload.append("brandId", data.brandId);
      payload.append("hsnCode", data.hsnCodeId);
      payload.append("isBestSeller", String(data.isBestSeller));
      payload.append("isVeg", String(data.isVeg));
      payload.append("lifeStage", data.lifeStage);
      payload.append("breedSize", data.breedSize);
      payload.append("productType", data.productType);

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
        const { images: _images, ...rest } = variant;
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

  const validateSalePrice = (salePrice, price) => {
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
                <Textarea placeholder="Enter product description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SKU */}
        <FormField
          name="sku"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter SKU or leave empty for auto-generation" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Imported By */}
        <FormField
          name="importedBy"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imported By</FormLabel>
              <FormControl>
                <Input placeholder="Enter importer name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Country of Origin */}
        <FormField
          name="countryOfOrigin"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country of Origin</FormLabel>
              <FormControl>
                <Input placeholder="Enter country of origin" {...field} />
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

        {/* Weight */}
        <FormField
          name="weight"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter weight in grams" {...field} />
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

        {/* isVeg */}
        <FormField
          control={form.control}
          name="isVeg"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Vegetarian</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* lifeStage */}
        <FormField
          name="lifeStage"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Life Stage</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                >
                  <option value="Puppy">Puppy</option>
                  <option value="Adult">Adult</option>
                  <option value="Starter">Starter</option>
                  <option value="Kitten">Kitten</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* breedSize */}
        <FormField
          name="breedSize"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breed Size</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                >
                  <option value="Mini">Mini</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Giant">Giant</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* productType */}
        <FormField
          name="productType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Type</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                >
                  <option value="Wet Food">Wet Food</option>
                  <option value="Dry Food">Dry Food</option>
                  <option value="Food Toppers">Food Toppers</option>
                  <option value="Treat">Treat</option>
                </select>
              </FormControl>
              <FormMessage />
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
                      <FormLabel>Variant SKU</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter variant SKU or leave empty for auto-generation"
                        />
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
                        <Input type="number" placeholder="Enter weight in grams" {...field} />
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
                            value={value}
                            onChange={(e) => {
                              const newAttributes = {
                                ...(field.value || {}),
                              };
                              newAttributes[key] = e.target.value;
                              field.onChange(newAttributes);
                              
                              // Trigger SKU update immediately when attributes change
                              if (!isEdit) {
                                setTimeout(() => {
                                  const formValues = form.getValues();
                                  const categoryName = categories.find(c => c._id === formValues.categoryId)?.name;
                                  const brandName = brands.find(b => b._id === formValues.brandId)?.name;
                                  const subCategoryName = subCategories.find(s => s._id === formValues.subCategoryId)?.name;
                                  
                                  if (categoryName && brandName && subCategoryName) {
                                    const variantSKU = generateVariantSKU(categoryName, brandName, subCategoryName, newAttributes, index);
                                    form.setValue(`variants.${index}.sku`, variantSKU);
                                  }
                                }, 100);
                              }
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
                              
                              // Trigger SKU update immediately when attributes change
                              if (!isEdit) {
                                setTimeout(() => {
                                  const formValues = form.getValues();
                                  const categoryName = categories.find(c => c._id === formValues.categoryId)?.name;
                                  const brandName = brands.find(b => b._id === formValues.brandId)?.name;
                                  const subCategoryName = subCategories.find(s => s._id === formValues.subCategoryId)?.name;
                                  
                                  if (categoryName && brandName && subCategoryName) {
                                    const variantSKU = generateVariantSKU(categoryName, brandName, subCategoryName, newAttributes, index);
                                    form.setValue(`variants.${index}.sku`, variantSKU);
                                  }
                                }, 100);
                              }
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
            onClick={() => {
              const formValues = form.getValues();
              const categoryName = categories.find(c => c._id === formValues.categoryId)?.name;
              const brandName = brands.find(b => b._id === formValues.brandId)?.name;
              const subCategoryName = subCategories.find(s => s._id === formValues.subCategoryId)?.name;
              const variantIndex = formValues.variants.length;
              
              // Generate SKU for the new variant only if we have required fields
              let variantSKU = "";
              if (categoryName && brandName && subCategoryName) {
                variantSKU = generateVariantSKU(categoryName, brandName, subCategoryName, {}, variantIndex);
              }
              
              const newVariant = {
                sku: variantSKU,
                price: 0,
                salePrice: 0,
                stock: 0,
                weight: 0,
                isActive: false,
                attributes: {},
              };
              append(newVariant);
            }}
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