import NavbarItem from "@/components/navbar/navbar_items";
import CustomActionMenu from "@/components/custom_action";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import CollectionTable from "./components/CollectionTable";
import { useDebounce } from "@uidotdev/usehooks";
import { DateRangePicker } from "@/components/date_filter";
import ExportCollectionDialog from "./components/ExportCollectionDialog";
import ChipFilterDrawer from "@/components/cutom_filter/chip_drawer";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/pages/category/helpers/fetchCategories";
import { fetchSubCategories } from "@/pages/sub_category/helpers/fetchSubCategories";
import { Filter } from "lucide-react";

const Collection = () => {
  const navigate = useNavigate();
  console.log("Collection");

  const paramInitialState = {
    page: 1,
    per_page: 50,
    search: "",
  };
  const [collectionsLength, setCollectionLength] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState(paramInitialState);
  const [openBulkExportDialog, setOpenBulkExportDialog] = useState(false);
  const [subCategoryId, setSubCategoryId] = useState("");

  //----Flters state------//
  const [chipOpen, setChipOpen] = useState(false);
  const [chipValues, setChipValues] = useState({
    categoryIds: [],
    subCategoryIds: [],
  });

  //----Flters data------//
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

 
  const sections = [
    {
      key: "categoryIds",
      title: "Category",
      options: categories.map((c) => ({
        value: String(c._id),
        label: c.name,
      })),
    },
    {
      key: "subCategoryIds",
      title: "Sub Category",
      options: subCategories.map((s) => ({
        value: String(s._id),
        label: s.name,
      })),
    },
  ];

  const debouncedSearch = useDebounce(searchText, 500);

  const onAdd = () => {
    navigate("/dashboard/collection/add");
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

  const onFilterSelect = ({ key, value }) => {
    const mapper = {
      "Sub Category": "subCategoryId",
      Category: "categoryId",
      Product: "productId",
      Collection: "collectionId",
    };
    
    setParams((prev) => {
      const paramKey = mapper[key];
      if (!value || value === '') {
        const { [paramKey]: _removed, ...rest } = prev;
        return rest;
      } else {
        return {
          ...prev,
          [paramKey]: value,
        };
      }
    });
  };
  const handleClearAllFilters = () => {
    setChipValues({
      categoryIds: [],
      subCategoryIds: [],
      productIds: [],
      collectionIds: [],
    });
    setParams((prev) => {
      const { categoryId: _categoryId, subCategoryId: _subCategoryId, productId: _productId, collectionId: _collectionId, ...rest } =
        prev;
      return rest;
    });
  };

  const breadcrumbs = [{ title: "Collection", isNavigation: false }];

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
        title="Collection"
        breadcrumbs={breadcrumbs}
        customBox={<DateRangePicker onChange={handleDateRangeChange} />}
      />

      <div className="py-1 px-4">
        <CustomActionMenu
          title="Collection"
          total={collectionsLength}
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
        <CollectionTable
          setCollectionLength={setCollectionLength}
          params={params}
          setParams={setParams}
        />
        <ExportCollectionDialog
          openDialog={openBulkExportDialog}
          onClose={onCloseBulkExportDialog}
          params={params}
        />
      </div>
    </div>
  );
};

export default Collection;
