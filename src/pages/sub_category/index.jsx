import NavbarItem from "@/components/navbar/navbar_items";
import CustomActionMenu from "@/components/custom_action";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import SubCategoryTable from "./components/SubCategoryTable";
import { useDebounce } from "@uidotdev/usehooks";
import { DateRangePicker } from "@/components/date_filter";
import ExportSubCategoryDialog from "./components/ExportSubCategoryDialog";
import ChipFilterDrawer from "@/components/cutom_filter/chip_drawer";
import { Button } from "@/components/ui/button";
import { fetchSubCategories } from "@/pages/sub_category/helpers/fetchSubCategories";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../category/helpers/fetchCategories";
import { Filter } from "lucide-react";

const SubCategory = () => {
  const navigate = useNavigate();
  console.log("SubCategory");

  const paramInitialState = {
    page: 1,
    per_page: 50,
    search: "",
  };
  const [subCategoriesLength, setSubCategoryLength] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState(paramInitialState);
  const [openBulkExportDialog, setOpenBulkExportDialog] = useState(false);

  const [chipOpen, setChipOpen] = useState(false);
  const [chipValues, setChipValues] = useState({
    categoryIds: [],
  });

  const { data: categoryRes } = useQuery({
    queryKey: ["all_categories"],
    queryFn: () => fetchCategories({ params: { per_page: 200 } }),
  });
  const categories = categoryRes?.data?.categories || [];

  const sections = [
    {
      key: "categoryIds",
      title: "Category",
      options: categories.map((c) => ({
        value: String(c._id),
        label: c.name,
      })),
    },
  ];

  const onFilterSelect = ({ key, value }) => {
    const mapper = {
      Category: "categoryId",
    };
    
    setParams((prev) => {
      const paramKey = mapper[key];
      if (!value || value === '') {
        // Remove the parameter when value is empty (unselecting)
        const { [paramKey]: _removed, ...rest } = prev;
        return rest;
      } else {
        // Set the parameter when value is provided (selecting)
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
    });
    setParams((prev) => {
      const { categoryId: _categoryId, ...rest } = prev;
      return rest;
    });
  };
  const debouncedSearch = useDebounce(searchText, 500);

  const onAdd = () => {
    navigate("/dashboard/sub_category/add");
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

  const breadcrumbs = [{ title: "Sub Category", isNavigation: false }];

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
        title="Sub Category"
        breadcrumbs={breadcrumbs}
        customBox={<DateRangePicker onChange={handleDateRangeChange} />}
      />

      <div className="py-1 px-4">
        <CustomActionMenu
          title="Sub Category"
          total={subCategoriesLength}
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
        <SubCategoryTable
          setSubCategoryLength={setSubCategoryLength}
          params={params}
          setParams={setParams}
        />
        <ExportSubCategoryDialog
          openDialog={openBulkExportDialog}
          onClose={onCloseBulkExportDialog}
          params={params}
        />
      </div>
    </div>
  );
};

export default SubCategory;
