import NavbarItem from "@/components/navbar/navbar_items";
import CustomActionMenu from "@/components/custom_action";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ProductTable from "./components/ProductTable";
import { useDebounce } from "@uidotdev/usehooks";
import { DateRangePicker } from "@/components/date_filter";
import ExportProductDialog from "./components/ExportProductDialog";
import ChipFilterDrawer from "@/components/cutom_filter/chip_drawer";
import { Button } from "@/components/ui/button";
import { fetchCategories } from "@/pages/category/helpers/fetchCategories";
import { fetchSubCategories } from "@/pages/sub_category/helpers/fetchSubCategories";
import { fetchBrands } from "@/pages/brand/helpers/fetchBrand";
import { fetchBreeds } from "@/pages/breed/helpers/fetchBreeds";
import { useQuery } from "@tanstack/react-query";
import {
  lifeStage,
  breedSize,
  isVeg,
  productType,
} from "@/utils/product_filters";
import { Filter } from "lucide-react";

const Product = () => {
  const navigate = useNavigate();
  console.log("Product");

  const paramInitialState = {
    page: 1,
    per_page: 50,
    search: "",
  };
  const [productsLength, setProductLength] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState(paramInitialState);
  const [openBulkExportDialog, setOpenBulkExportDialog] = useState(false);
  const [chipOpen, setChipOpen] = useState(false);
  const [chipValues, setChipValues] = useState({
    categoryIds: [],
    subCategoryIds: [],
    brandIds: [],
    breedIds: [],
    lifeStage: [],
    breedSize: [],
    isVeg: [],
    productType: [],
  });

  const { data: categoryRes } = useQuery({
    queryKey: ["all_categories"],
    queryFn: () => fetchCategories({ params: { per_page: 200 } }),
  });
  const categories = categoryRes?.data?.categories || [];

  const { data: subCatRes } = useQuery({
    queryKey: ["all_sub_categories"],
    queryFn: () => fetchSubCategories({ params: { per_page: 500 } }),
  });
  const subCategories = subCatRes?.data || [];

  const { data: brandRes } = useQuery({
    queryKey: ["all_brands"],
    queryFn: () => fetchBrands({ params: { per_page: 500 } }),
  });
  const brands = brandRes?.data || [];

  const { data: breedRes } = useQuery({
    queryKey: ["all_breeds"],
    queryFn: () => fetchBreeds({ params: { per_page: 500 } }),
  });
  const breeds = breedRes?.data || [];

  const filteredSubs = chipValues.categoryIds.length
    ? subCategories.filter((s) => {
        const selectedCategorySlug = chipValues.categoryIds[0];
        const matchingCategory = categories.find(
          (cat) => cat.slug === selectedCategorySlug
        );
        return (
          matchingCategory &&
          String(s.categoryId) === String(matchingCategory._id)
        );
      })
    : subCategories;

  const sections = [
    {
      key: "categoryIds",
      title: "Category",
      options: categories
        .map((p) => ({
          value: String(p.slug),
          label: p.name ?? p.categoryId ?? "Unknown",
        }))
        .filter((o) => o.value),
    },
    {
      key: "subCategoryIds",
      title: "Sub Category",
      options: filteredSubs
        .map((p) => ({
          value: String(p.slug),
          label: p.name ?? p.subCategoryId ?? "Unknown",
        }))
        .filter((o) => o.value),
    },
    {
      key: "brandIds",
      title: "Brand",
      options: brands
        .map((p) => ({
          value: String(p.slug),
          label: p.name ?? p.brandId ?? "Unknown",
        }))
        .filter((o) => o.value),
    },
    {
      key: "breedIds",
      title: "Breed",
      options: breeds
        .map((p) => ({
          value: String(p.slug),
          label: p.name ?? p.breedId ?? "Unknown",
        }))
        .filter((o) => o.value),
    },
    {
      key: "lifeStage",
      title: "Life Stage",
      options: lifeStage.map((p) => ({
        value: String(p.value),
        label: p.label,
      })),
    },
    {
      key: "breedSize",
      title: "Breed Size",
      options: breedSize.map((p) => ({
        value: String(p.value),
        label: p.label,
      })),
    },
    {
      key: "isVeg",
      title: "Veg/Non Veg",
      options: isVeg.map((p) => ({
        value: String(p.value),
        label: p.label,
      })),
    },
    {
      key: "productType",
      title: "Product Type",
      options: productType.map((p) => ({
        value: String(p.value),
        label: p.label,
      })),
    },
  ];

  const debouncedSearch = useDebounce(searchText, 500);

  const onAdd = () => {
    navigate("/dashboard/product/add");
  };

  const onFilterSelect = ({ key, value }) => {
    const mapper = {
      Category: "categorySlug",
      "Sub Category": "subCategorySlug",
      Brand: "brandSlug",
      Breed: "breedSlug",
      "Life Stage": "lifeStage",
      "Breed Size": "breedSize",
      "Veg/Non Veg": "isVeg",
      "Product Type": "productType",
    };
    setParams((prev) => ({
      ...prev,
      [mapper[key]]: value,
    }));
  };
  const handleClearAllFilters = () => {
    setChipValues({
      categoryIds: [],
      subCategoryIds: [],
      brandIds: [],
      breedIds: [],
      lifeStage: [],
      breedSize: [],
      isVeg: [],
      productType: [],
    });
    setParams((prev) => {
      const {
        categorySlug,
        subCategorySlug,
        brandSlug,
        breedSlug,
        lifeStage,
        breedSize,
        isVeg,
        productType,

        ...rest
      } = prev;
      return rest;
    });
  };
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const onOpenBulkExportDialog = () => {
    setOpenBulkExportDialog(true);
  };

  const onCloseBulkExportDialog = () => {
    setOpenBulkExportDialog(false);
  };

  const onRowsPerPageChange = (newRowsPerPage) => {
    setParams((prev) => ({
      ...prev,
      per_page: newRowsPerPage,
    }));
  };

  const breadcrumbs = [{ title: "Product", isNavigation: false }];

  const handleDateRangeChange = (range) => {
    if (!range || !range.from || !range.to) {
      setParams((prev) => {
        if (prev.start_date === undefined && prev.end_date === undefined) {
          return prev;
        }
        return { ...prev, start_date: undefined, end_date: undefined };
      });
      return;
    }

    setParams((prev) => {
      const isSame =
        prev.start_date?.toString() === range.from.toString() &&
        prev.end_date?.toString() === range.to.toString();

      if (isSame) return prev;

      return { ...prev, start_date: range.from, end_date: range.to };
    });
  };

  useEffect(() => {
    if (params.search !== debouncedSearch) {
      setParams((prev) => ({
        ...prev,
        search: debouncedSearch,
      }));
    }
  }, [debouncedSearch]);

  console.log("Component will load now ");
  return (
    <div className="flex flex-col">
      <NavbarItem
        title="Product"
        breadcrumbs={breadcrumbs}
        customBox={<DateRangePicker onChange={handleDateRangeChange} />}
      />

      <div className="py-1 px-4">
        <CustomActionMenu
          title="Product"
          total={productsLength}
          onAdd={onAdd}
          handleSearch={handleSearch}
          searchText={searchText}
          onRowsPerPageChange={onRowsPerPageChange}
          showRowSelection={true}
          rowsPerPage={params.per_page}
          disableBulkExport={false}
          onBulkExport={onOpenBulkExportDialog}
          rightSlot={
            <Button variant="outline" onClick={() => setChipOpen(true)}>
              <Filter />
              Filters
            </Button>
          }
        />
        <ChipFilterDrawer
          open={chipOpen}
          onOpenChange={setChipOpen}
          title="Filters"
          sections={sections}
          values={chipValues}
          onChange={setChipValues}
          onClear={handleClearAllFilters}
          onFilterSelect={onFilterSelect}
        />
        <ProductTable
          setProductLength={setProductLength}
          params={params}
          setParams={setParams}
        />
        <ExportProductDialog
          openDialog={openBulkExportDialog}
          onClose={onCloseBulkExportDialog}
          params={params}
        />
      </div>
    </div>
  );
};

export default Product;
