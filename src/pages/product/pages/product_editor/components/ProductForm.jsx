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
import { RichTextEditor } from "@/components/ui/rich-text-editor";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/gif",
  "image/webp",
];

const imageArrayValidator = z
  .any()
  .optional()
  .refine(
    (files) => {
      if (!files || files.length === 0) return true;
      if (!Array.isArray(files)) return false;
      return files.every(
        (file) => file?.type && allowedTypes.includes(file.type)
      );
    },
    {
      message: "Only JPEG, PNG, JPG, GIF, or WEBP images are allowed",
    }
  );

const VariantSchema = z.object({
  sku: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  salePrice: z.coerce.number().optional(),
  stock: z.coerce.number().nonnegative().optional(),
  weight: z.coerce.number().optional(),
  images: imageArrayValidator,
  attributes: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
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
  lifeStage: z.enum(["Puppy", "Adult", "Starter", "Kitten"]).default("Adult"),
  breedSize: z.enum(["Mini", "Medium", "Large", "Giant"]).default("Medium"),
  productType: z
    .enum(["Wet Food", "Dry Food", "Food Toppers", "Treat"])
    .default("Dry Food"),
  images: imageArrayValidator,
  variants: z.array(VariantSchema).min(1, "At least one variant is required"),
});

const ProductForm = ({ isEdit = false, initialData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialData?.categoryId || ""
  );
  const [imageFiles, setImageFiles] = useState([]);
  const [varientImagefiles, setVarientImagefiles] = useState([]);
  const [commonImagefiles, setCommonImagefiles] = useState([]);
  const [mainWeightUnit, setMainWeightUnit] = useState("grams"); // 'grams' or 'kg'
  const [variantWeightUnits, setVariantWeightUnits] = useState({}); // Store weight units for each variant

  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState("");
  const variantImageMap = useRef({});

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
        lifeStage: "Adult",
        breedSize: "Medium",
        productType: "Dry Food",
        price: 0,
        salePrice: 0,
        stock: 0,
        weight: 0,
        images: [],
        variants: [
          {
            sku: "",
            price: 0,
            salePrice: 0,
            stock: 0,
            weight: 0,
            isActive: true,
            attributes: {},
          },
        ],
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
      breedIds: initialData.breedId?.map((breed) => breed._id) || [],
      hsnCodeId: initialData.hsnCode?._id || "",
      isBestSeller: initialData.isBestSeller || false,
      isVeg: initialData.isVeg || false,
      lifeStage: initialData.lifeStage || "Adult",
      breedSize: initialData.breedSize || "Medium",
      productType: initialData.productType || "Dry Food",
      price: initialData.price || 0,
      salePrice: initialData.salePrice || 0,
      stock: initialData.stock || 0,
      weight: initialData.weight || 0,
      images: [],
      variants:
        initialData.variants?.length > 0
          ? initialData.variants.map((variant) => ({
              ...variant,
              images: [],
            }))
          : [
              {
                sku: "",
                price: 0,
                salePrice: 0,
                stock: 0,
                weight: 0,
                isActive: true,
                attributes: {},
              },
            ],
    };
  };

  const form = useForm({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: getDefaultValues(),
  });

  // Set category ID when initial data changes
  useEffect(() => {
    if (initialData?.categoryId?._id) {
      setSelectedCategoryId(initialData.categoryId._id);
    }
  }, [initialData]);

  // Initialize variant weight units when variants are loaded
  useEffect(() => {
    if (initialData?.variants?.length > 0) {
      const initialVariantUnits = {};
      initialData.variants.forEach((_, index) => {
        initialVariantUnits[index] = "grams"; // Default to grams
      });
      setVariantWeightUnits(initialVariantUnits);
    }
  }, [initialData]);

  const {
    fields: variantFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const { data: categoryListRes } = useQuery({
    queryKey: ["all_categories"],
    queryFn: fetchCategories,
  });

  const { data: subCategoryListRes } = useQuery({
    queryKey: ["subcategories", selectedCategoryId],
    queryFn: () =>
      fetchSubCategoriesByCategoryId({
        params: { categoryId: selectedCategoryId },
      }),
    enabled: !!selectedCategoryId,
  });

  const { data: breedListRes } = useQuery({
    queryKey: ["breeds"],
    queryFn: fetchBreeds,
  });

  const { data: brandListRes } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });

  const { data: hsnCodeListRes } = useQuery({
    queryKey: ["hsn_codes"],
    queryFn: fetchHsnCodes,
  });

  // Fetch total product count for serial number generation
  const { data: productsCountRes } = useQuery({
    queryKey: ["products_count"],
    queryFn: () => fetchProducts({ params: { per_page: 1000 } }), // Fetch all products to get total count
    enabled: !isEdit, // Only fetch for new products
  });

  const categories = useMemo(
    () => categoryListRes?.data?.categories || [],
    [categoryListRes?.data?.categories]
  );
  const subCategories = useMemo(
    () => subCategoryListRes?.data || [],
    [subCategoryListRes?.data]
  );
  const breeds = breedListRes?.data || [];
  const brands = useMemo(() => brandListRes?.data || [], [brandListRes?.data]);
  const hsnCodes = hsnCodeListRes?.response?.data?.data || [];

  // Function to generate SKU based on format [CATEGORY]-[BRAND]-[SUBCAT]-[FLAVOUR/VARIANT]-[WEIGHT]-[SERIAL]
  const generateSKU = useCallback(
    (categoryName, brandName, subCategoryName, variantName, weightInKgs) => {
      const skuParts = [];

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

      // Add weight in kgs (formatted as W + weight value, e.g., W1.5 for 1.5kg)
      if (weightInKgs && weightInKgs > 0) {
        const weightStr = `${weightInKgs}KG`.replace(".", ""); // Remove decimal point for cleaner SKU
        skuParts.push(weightStr);
      }

      // Add serial number based on total product count + 1
      const totalProducts =
        productsCountRes?.data?.total || productsCountRes?.data?.length || 0;
      const serial = (totalProducts + 1).toString().padStart(4, "0");
      skuParts.push(serial);

      return skuParts.join("-");
    },
    [productsCountRes]
  );

  // Function to generate variant SKU
  const generateVariantSKU = useCallback(
    (
      categoryName,
      brandName,
      subCategoryName,
      variantAttributes,
      variantIndex,
      weightInKgs
    ) => {
      const skuParts = [];

      console.log("generateVariantSKU called with:", {
        categoryName,
        brandName,
        subCategoryName,
        variantAttributes,
        variantIndex,
        weightInKgs,
      });

      // Add brand (first 3 letters)
      if (brandName && brandName.length >= 3) {
        skuParts.push(brandName.substring(0, 3).toUpperCase());
      }

      // Add subcategory (first 3 letters)
      if (subCategoryName && subCategoryName.length >= 3) {
        skuParts.push(subCategoryName.substring(0, 3).toUpperCase());
      }

      // Extract variant info from attributes (excluding weight-related attributes)
      if (variantAttributes && Object.keys(variantAttributes).length > 0) {
        console.log("All variant attributes:", variantAttributes);

        // Get all attribute values and filter out empty ones and weight-related attributes
        const attributeValues = Object.entries(variantAttributes)
          .filter(
            ([key, value]) =>
              value &&
              typeof value === "string" &&
              value.trim().length >= 3 &&
              !key.toLowerCase().includes("weight") // Exclude weight-related attributes only
          )
          .map(([, value]) => value);

        console.log("Filtered attribute values:", attributeValues);

        // Add up to 2 attribute values to SKU (flavor, variant info, etc.)
        attributeValues.slice(0, 2).forEach((attrValue) => {
          const shortValue = attrValue.substring(0, 3).toUpperCase();
          skuParts.push(shortValue);
          console.log("Added attribute to SKU:", shortValue);
        });
      }

      // Add weight in kgs (formatted as W + weight value, e.g., W1.5 for 1.5kg)
      if (weightInKgs && weightInKgs > 0) {
        const weightStr = `${weightInKgs}KG`.replace(".", ""); // Remove decimal point for cleaner SKU
        skuParts.push(weightStr);
        console.log("Added weight to SKU:", weightStr);
      }

      const variantSerial = `${(variantIndex + 1).toString().padStart(3, "0")}`;
      skuParts.push(variantSerial);

      const finalSKU = skuParts.join("-");
      console.log("Generated variant SKU:", finalSKU);

      return finalSKU;
    },
    []
  );

  // Function to update all variant SKUs
  const updateVariantSKUs = useCallback(() => {
    if (brands.length === 0 || subCategories.length === 0) return;

    const formValues = form.getValues();
    const categoryName = categories.find(
      (c) => c._id === formValues.categoryId
    )?.name;
    const brandName = brands.find((b) => b._id === formValues.brandId)?.name;
    const subCategoryName = subCategories.find(
      (s) => s._id === formValues.subCategoryId
    )?.name;

    if (categoryName && brandName && subCategoryName) {
      formValues.variants?.forEach((variant, index) => {
        // For new products, always update variant SKUs
        // For editing, only update if SKU is empty (manual override)
        if (!isEdit || !variant.sku) {
          // Convert variant weight to kgs
          const variantWeight = variant.weight || 0;
          const variantWeightInKgs =
            (variantWeightUnits[index] || "grams") === "kg"
              ? variantWeight
              : variantWeight / 1000;

          const variantSKU = generateVariantSKU(
            categoryName,
            brandName,
            subCategoryName,
            variant.attributes || {},
            index,
            variantWeightInKgs
          );
          form.setValue(`variants.${index}.sku`, variantSKU);
        }
      });
    }
  }, [
    categories,
    brands,
    subCategories,
    form,
    generateVariantSKU,
    isEdit,
    variantWeightUnits,
  ]);

  const watchedFields = form.watch([
    "categoryId",
    "brandId",
    "subCategoryId",
    "title",
    "weight",
  ]);
  const watchedVariants = form.watch("variants");

  // Watch for variant weight unit changes to trigger SKU updates
  const watchedVariantWeightUnits = JSON.stringify(variantWeightUnits);

  // Debug: Log when variants change
  useEffect(() => {
    console.log("Variants changed:", watchedVariants);
  }, [watchedVariants]);

  // Debug: Log when variant weight units change
  useEffect(() => {
    console.log("Variant weight units changed:", variantWeightUnits);
  }, [variantWeightUnits]);
  const [lastGeneratedSKU, setLastGeneratedSKU] = useState("");

  // For new products - always update SKU when fields change
  useEffect(() => {
    if (isEdit) return;

    if (
      categories.length > 0 &&
      brands.length > 0 &&
      subCategories.length > 0
    ) {
      const formValues = form.getValues();
      const categoryName = categories.find(
        (c) => c._id === formValues.categoryId
      )?.name;
      const brandName = brands.find((b) => b._id === formValues.brandId)?.name;
      const subCategoryName = subCategories.find(
        (s) => s._id === formValues.subCategoryId
      )?.name;
      const variantName = formValues.title;
      const weightInKgs =
        mainWeightUnit === "kg" ? formValues.weight : formValues.weight / 1000;

      if (
        categoryName &&
        brandName &&
        subCategoryName &&
        variantName &&
        weightInKgs
      ) {
        const generatedSKU = generateSKU(
          categoryName,
          brandName,
          subCategoryName,
          variantName,
          weightInKgs
        );

        if (generatedSKU !== lastGeneratedSKU) {
          form.setValue("sku", generatedSKU);
          setLastGeneratedSKU(generatedSKU);

          updateVariantSKUs();
        }
      }
    }
  }, [
    watchedFields,
    categories,
    brands,
    subCategories,
    isEdit,
    generateSKU,
    updateVariantSKUs,
    lastGeneratedSKU,
    form,
    productsCountRes,
    mainWeightUnit,
  ]);

  // For editing products - show warning every time SKU-affecting fields change
  useEffect(() => {
    if (!isEdit) return;

    // Check if any SKU-affecting fields have changed from initial values
    const formValues = form.getValues();
    const initialValues = initialData;

    const fieldsChanged =
      formValues.categoryId !== initialValues?.categoryId?._id ||
      formValues.brandId !== initialValues?.brandId?._id ||
      formValues.subCategoryId !== initialValues?.subCategoryId?._id ||
      formValues.title !== initialValues?.title ||
      formValues.weight !== initialValues?.weight;

    if (fieldsChanged) {
      toast.warning(
        "Changing these fields might hamper your SKU. Please check your SKU and update manually."
      );
    }
  }, [watchedFields, isEdit, initialData, form]);

  // Watch for variant attribute changes and update variant SKUs
  useEffect(() => {
    console.log("Variant watching useEffect triggered");

    if (isEdit) return; // Only for new products

    if (
      categories.length > 0 &&
      brands.length > 0 &&
      subCategories.length > 0
    ) {
      const formValues = form.getValues();
      console.log("Current form values:", formValues);

      const categoryName = categories.find(
        (c) => c._id === formValues.categoryId
      )?.name;
      const brandName = brands.find((b) => b._id === formValues.brandId)?.name;
      const subCategoryName = subCategories.find(
        (s) => s._id === formValues.subCategoryId
      )?.name;

      console.log("Category/Brand/SubCategory names:", {
        categoryName,
        brandName,
        subCategoryName,
      });

      if (categoryName && brandName && subCategoryName) {
        formValues.variants?.forEach((variant, index) => {
          // Always generate new SKU when attributes change (for new products)
          // Convert variant weight to kgs
          const variantWeight = variant.weight || 0;
          const variantWeightInKgs =
            (variantWeightUnits[index] || "grams") === "kg"
              ? variantWeight
              : variantWeight / 1000;

          const variantSKU = generateVariantSKU(
            categoryName,
            brandName,
            subCategoryName,
            variant.attributes || {},
            index,
            variantWeightInKgs
          );

          // Only update if the generated SKU is different from current SKU
          if (variantSKU !== variant.sku) {
            form.setValue(`variants.${index}.sku`, variantSKU);
          }
        });
      }
    }
  }, [
    watchedVariants,
    categories,
    brands,
    subCategories,
    isEdit,
    form,
    generateVariantSKU,
    variantWeightUnits,
  ]);

  // Watch for variant weight unit changes and update SKUs
  useEffect(() => {
    console.log("Variant weight unit useEffect triggered");
    if (isEdit) return; // Only for new products

    if (
      categories.length > 0 &&
      brands.length > 0 &&
      subCategories.length > 0
    ) {
      const formValues = form.getValues();
      const categoryName = categories.find(
        (c) => c._id === formValues.categoryId
      )?.name;
      const brandName = brands.find((b) => b._id === formValues.brandId)?.name;
      const subCategoryName = subCategories.find(
        (s) => s._id === formValues.subCategoryId
      )?.name;

      if (categoryName && brandName && subCategoryName) {
        formValues.variants?.forEach((variant, index) => {
          // Convert variant weight to kgs
          const variantWeight = variant.weight || 0;
          const variantWeightInKgs =
            (variantWeightUnits[index] || "grams") === "kg"
              ? variantWeight
              : variantWeight / 1000;

          const variantSKU = generateVariantSKU(
            categoryName,
            brandName,
            subCategoryName,
            variant.attributes || {},
            index,
            variantWeightInKgs
          );

          // Only update if the generated SKU is different from current SKU
          if (variantSKU !== variant.sku) {
            form.setValue(`variants.${index}.sku`, variantSKU);
          }
        });
      }
    }
  }, [
    watchedVariantWeightUnits,
    categories,
    brands,
    subCategories,
    isEdit,
    form,
    generateVariantSKU,
    variantWeightUnits,
  ]);

  // Additional effect to watch for variant weight changes specifically
  useEffect(() => {
    if (isEdit) return; // Only for new products

    console.log("Variant weight change effect triggered");

    if (
      categories.length > 0 &&
      brands.length > 0 &&
      subCategories.length > 0
    ) {
      const formValues = form.getValues();
      const categoryName = categories.find(
        (c) => c._id === formValues.categoryId
      )?.name;
      const brandName = brands.find((b) => b._id === formValues.brandId)?.name;
      const subCategoryName = subCategories.find(
        (s) => s._id === formValues.subCategoryId
      )?.name;

      if (categoryName && brandName && subCategoryName) {
        formValues.variants?.forEach((variant, index) => {
          // Convert variant weight to kgs
          const variantWeight = variant.weight || 0;
          const variantWeightInKgs =
            (variantWeightUnits[index] || "grams") === "kg"
              ? variantWeight
              : variantWeight / 1000;

          console.log(`Variant ${index} weight:`, {
            variantWeight,
            variantWeightInKgs,
            unit: variantWeightUnits[index],
          });

          const variantSKU = generateVariantSKU(
            categoryName,
            brandName,
            subCategoryName,
            variant.attributes || {},
            index,
            variantWeightInKgs
          );

          // Always update SKU when weight changes (for new products)
          if (variantSKU !== variant.sku) {
            console.log(
              `Updating variant ${index} SKU from ${variant.sku} to ${variantSKU}`
            );
            form.setValue(`variants.${index}.sku`, variantSKU);
          }
        });
      }
    }
  }, [
    watchedVariants,
    categories,
    brands,
    subCategories,
    isEdit,
    form,
    generateVariantSKU,
    variantWeightUnits,
  ]);

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
                setVarientImagefiles(files);
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

  // Helper function to convert weight to grams
  const convertWeightToGrams = (weight, unit) => {
    if (unit === "kg") {
      return weight * 1000; // Convert kg to grams
    }
    return weight; // Already in grams
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = new FormData();

      // Convert main weight to grams before adding to payload
      const mainWeightInGrams = convertWeightToGrams(
        data.weight || 0,
        mainWeightUnit
      );

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
      payload.append("weight", mainWeightInGrams);
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

        // Convert variant weight to grams before adding to payload
        const variantWeightInGrams = convertWeightToGrams(
          variant.weight || 0,
          variantWeightUnits[i] || "grams"
        );
        const variantWithConvertedWeight = {
          ...rest,
          weight: variantWeightInGrams,
        };

        payload.append(
          "variants[]",
          JSON.stringify(variantWithConvertedWeight)
        );

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
        toast.error(
          res?.response?.message ||
            `Failed to ${isEdit ? "update" : "create"} product`
        );
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} product`);
    },
  });

  const validateSalePrice = (salePrice, price) => {
    if (salePrice && price && Number(salePrice) > Number(price)) {
      toast.warning("Sale price cannot be greater than the regular price");
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
    const hasInvalidVariant = data.variants.some((variant) => {
      if (
        variant.salePrice &&
        !validateSalePrice(variant.salePrice, variant.price)
      ) {
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
    console.log("removeImage");
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    form.setValue("images", newFiles);
  };
  const removeVarientImage = (index) => {
    console.log("removeVarientImage");
    const newFiles = [...varientImagefiles];
    newFiles.splice(index, 1);
    setVarientImagefiles(newFiles);
    form.setValue(`variants.${index}.images`, newFiles);
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
        <div className="grid grid-cols-2 md:grid-cols-3 sm:grid-cols-2  gap-6">
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
          <div className="flex flex-col space-y-1">
            {/* isBestSeller */}
            <span className="font-medium ">Tags</span>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-6 sm:space-y-0">
              <FormField
                control={form.control}
                name="isBestSeller"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-1 space-y-0">
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
                  <FormItem className="flex flex-row items-start space-x-1 space-y-0">
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
            </div>
          </div>
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
        </div>

        {/* Description */}
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter product description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

          {/* HSN Code */}
          <FormField
            name="GST Percentage"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST Percentage</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded px-3 py-2 text-sm text-gray-700"
                  >
                    <option value="">Select GST Code</option>
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
        </div>

        {/* Main Section */}
        <div className="space-y-4 ">
          <FormLabel className="block text-lg font-semibold">Main</FormLabel>
          <div className="border p-3 rounded grid grid-cols-2 md:grid-cols-3 gap-4">
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
                        const price = form.getValues("price");
                        if (
                          e.target.value &&
                          price &&
                          Number(e.target.value) > Number(price)
                        ) {
                          toast.warning(
                            "Sale price cannot be greater than the regular price"
                          );
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
                  <div className="relative flex">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={`Enter weight`}
                        {...field}
                        className="pr-20"
                      />
                    </FormControl>
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <select
                        value={mainWeightUnit}
                        onChange={(e) => {
                          const newUnit = e.target.value;
                          setMainWeightUnit(newUnit);

                          if (field.value) {
                            if (newUnit === "kg") {
                              form.setValue("weight", field.value / 1000);
                            } else {
                              form.setValue("weight", field.value * 1000);
                            }
                          }
                        }}
                        className="h-full px-2 text-sm text-gray-700 rounded-r-md focus:outline-none"
                      >
                        <option value="grams">Grams</option>
                        <option value="kg">KG</option>
                      </select>
                    </div>
                  </div>
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
          </div>
        </div>
        {/* Image Previews */}
        {imageFiles?.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4">
            {imageFiles.map((file, index) => (
              <div key={index} className="relative z-30">
                <ProductImage
                  image={
                    file instanceof File ? URL.createObjectURL(file) : file
                  }
                  alt={`preview-${index}`}
                  className="w-34 h-34 object-cover rounded"
                />
                <button
                  type="button"
                  className="absolute z-50 top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  onClick={() => removeImage(index)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Variants */}
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
                            const price = form.getValues(
                              `variants.${index}.price`
                            );
                            if (
                              e.target.value &&
                              price &&
                              Number(e.target.value) > Number(price)
                            ) {
                              toast.warning(
                                "Variant sale price cannot be greater than the variant price"
                              );
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

                      {/* Input with embedded dropdown */}
                      <div className="relative w-full">
                        <Input
                          type="number"
                          placeholder={`Enter weight`}
                          {...field}
                          className="pr-16" // space for dropdown
                          onChange={(e) => {
                            field.onChange(e);
                            // Trigger SKU update immediately when weight changes
                            if (!isEdit) {
                              setTimeout(() => {
                                const formValues = form.getValues();
                                const categoryName = categories.find(
                                  (c) => c._id === formValues.categoryId
                                )?.name;
                                const brandName = brands.find(
                                  (b) => b._id === formValues.brandId
                                )?.name;
                                const subCategoryName = subCategories.find(
                                  (s) => s._id === formValues.subCategoryId
                                )?.name;

                                if (
                                  categoryName &&
                                  brandName &&
                                  subCategoryName
                                ) {
                                  const variantWeight = e.target.value || 0;
                                  const variantWeightInKgs =
                                    (variantWeightUnits[index] || "grams") ===
                                    "kg"
                                      ? variantWeight
                                      : variantWeight / 1000;

                                  const variantSKU = generateVariantSKU(
                                    categoryName,
                                    brandName,
                                    subCategoryName,
                                    formValues.variants[index]?.attributes ||
                                      {},
                                    index,
                                    variantWeightInKgs
                                  );
                                  form.setValue(
                                    `variants.${index}.sku`,
                                    variantSKU
                                  );
                                }
                              }, 100);
                            }
                          }}
                        />

                        {/* Dropdown inside input */}
                        <select
                          value={variantWeightUnits[index] || "grams"}
                          onChange={(e) => {
                            const newUnit = e.target.value;
                            const newVariantUnits = { ...variantWeightUnits };
                            newVariantUnits[index] = newUnit;
                            setVariantWeightUnits(newVariantUnits);

                            // Convert weight value when switching units
                            if (field.value) {
                              if (newUnit === "kg") {
                                form.setValue(
                                  `variants.${index}.weight`,
                                  field.value / 1000
                                );
                              } else {
                                form.setValue(
                                  `variants.${index}.weight`,
                                  field.value * 1000
                                );
                              }
                            }

                            // Trigger SKU update on unit change
                            if (!isEdit) {
                              setTimeout(() => {
                                const formValues = form.getValues();
                                const categoryName = categories.find(
                                  (c) => c._id === formValues.categoryId
                                )?.name;
                                const brandName = brands.find(
                                  (b) => b._id === formValues.brandId
                                )?.name;
                                const subCategoryName = subCategories.find(
                                  (s) => s._id === formValues.subCategoryId
                                )?.name;

                                if (
                                  categoryName &&
                                  brandName &&
                                  subCategoryName
                                ) {
                                  const variantWeight =
                                    formValues.variants[index]?.weight || 0;
                                  const variantWeightInKgs =
                                    newUnit === "kg"
                                      ? variantWeight
                                      : variantWeight / 1000;

                                  const variantSKU = generateVariantSKU(
                                    categoryName,
                                    brandName,
                                    subCategoryName,
                                    formValues.variants[index]?.attributes ||
                                      {},
                                    index,
                                    variantWeightInKgs
                                  );
                                  form.setValue(
                                    `variants.${index}.sku`,
                                    variantSKU
                                  );
                                }
                              }, 100);
                            }
                          }}
                          className="absolute right-0 top-0 h-full px-2 text-xs text-gray-700 rounded-r-md focus:outline-none"
                        >
                          <option value="grams">Grams</option>
                          <option value="kg">KG</option>
                        </select>
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
                      <FormLabel>Attributes</FormLabel>
                      {Object.entries(field.value || {}).map(
                        ([key, value], idx) => (
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
                                    const categoryName = categories.find(
                                      (c) => c._id === formValues.categoryId
                                    )?.name;
                                    const brandName = brands.find(
                                      (b) => b._id === formValues.brandId
                                    )?.name;
                                    const subCategoryName = subCategories.find(
                                      (s) => s._id === formValues.subCategoryId
                                    )?.name;

                                    if (
                                      categoryName &&
                                      brandName &&
                                      subCategoryName
                                    ) {
                                      // Convert variant weight to kgs
                                      const variantWeight =
                                        formValues.variants[index]?.weight || 0;
                                      const variantWeightInKgs =
                                        (variantWeightUnits[index] ||
                                          "grams") === "kg"
                                          ? variantWeight
                                          : variantWeight / 1000;

                                      const variantSKU = generateVariantSKU(
                                        categoryName,
                                        brandName,
                                        subCategoryName,
                                        newAttributes,
                                        index,
                                        variantWeightInKgs
                                      );
                                      form.setValue(
                                        `variants.${index}.sku`,
                                        variantSKU
                                      );
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
                                    const categoryName = categories.find(
                                      (c) => c._id === formValues.categoryId
                                    )?.name;
                                    const brandName = brands.find(
                                      (b) => b._id === formValues.brandId
                                    )?.name;
                                    const subCategoryName = subCategories.find(
                                      (s) => s._id === formValues.subCategoryId
                                    )?.name;

                                    if (
                                      categoryName &&
                                      brandName &&
                                      subCategoryName
                                    ) {
                                      // Convert variant weight to kgs
                                      const variantWeight =
                                        formValues.variants[index]?.weight || 0;
                                      const variantWeightInKgs =
                                        (variantWeightUnits[index] ||
                                          "grams") === "kg"
                                          ? variantWeight
                                          : variantWeight / 1000;

                                      const variantSKU = generateVariantSKU(
                                        categoryName,
                                        brandName,
                                        subCategoryName,
                                        newAttributes,
                                        index,
                                        variantWeightInKgs
                                      );
                                      form.setValue(
                                        `variants.${index}.sku`,
                                        variantSKU
                                      );
                                    }
                                  }, 100);
                                }
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )
                      )}

                      <Dialog
                        open={isAttributeDialogOpen === index}
                        onOpenChange={(open) =>
                          setIsAttributeDialogOpen(open ? index : false)
                        }
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
                              Enter the name of the new attribute for variant{" "}
                              {index + 1}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Attribute name"
                              value={newAttributeName}
                              onChange={(e) =>
                                setNewAttributeName(e.target.value)
                              }
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setNewAttributeName("");
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
                                  setNewAttributeName("");
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
                            setVarientImagefiles(files);
                            variantImageMap.current[index] = files; // 👈 attach files by variant index
                            field.onChange(files);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name={`variants.${index}.isActive`}
                  control={form.control}
                  render={({ field }) => (
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
                  )}
                />
              </div>
              {/* Image Previews */}
              {varientImagefiles?.length > 0 &&
                varientImagefiles?.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    {varientImagefiles.map((file, index) => (
                      <div key={index} className="relative z-30">
                        <ProductImage
                          image={
                            file instanceof File
                              ? URL.createObjectURL(file)
                              : file
                          }
                          alt={`preview-${index}`}
                          className="w-34 h-34 object-cover rounded"
                        />
                        <button
                          type="button"
                          className="absolute z-50 top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          onClick={() => removeVarientImage(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              <button
                type="button"
                onClick={() => {
                  // Clean up variant weight unit when removing variant
                  const newVariantUnits = { ...variantWeightUnits };
                  delete newVariantUnits[index];
                  setVariantWeightUnits(newVariantUnits);
                  remove(index);
                }}
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
              const categoryName = categories.find(
                (c) => c._id === formValues.categoryId
              )?.name;
              const brandName = brands.find(
                (b) => b._id === formValues.brandId
              )?.name;
              const subCategoryName = subCategories.find(
                (s) => s._id === formValues.subCategoryId
              )?.name;
              const variantIndex = formValues.variants.length;

              // Generate SKU for the new variant only if we have required fields
              let variantSKU = "";
              if (categoryName && brandName && subCategoryName) {
                // For new variants, weight will be 0 initially, so no weight in SKU
                variantSKU = generateVariantSKU(
                  categoryName,
                  brandName,
                  subCategoryName,
                  {},
                  variantIndex,
                  0
                );
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

              // Initialize weight unit for the new variant
              const newVariantUnits = { ...variantWeightUnits };
              newVariantUnits[variantIndex] = "grams"; // Default to grams
              setVariantWeightUnits(newVariantUnits);

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
