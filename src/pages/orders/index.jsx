import NavbarItem from "@/components/navbar/navbar_items";
import CustomActionMenu from "@/components/custom_action";
import { useEffect, useState } from "react";
import OrdersTable from "./components/OrderTable";
import { useDebounce } from "@uidotdev/usehooks";
import { DateRangePicker } from "@/components/date_filter";
// import ExportUserDialog from "./components/ExportUserDialog";

const Orders = () => {
  const paramInitialState = {
    page: 1,
    per_page: 25,
    search: "",
  };
  const [ordersLength, setOrdersLength] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState(paramInitialState);
  // const [openBulkExportDialog, setOpenBulkExportDialog] = useState(false);

  const debouncedSearch = useDebounce(searchText, 500);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // const onOpenBulkExportDialog = () => {
  //   setOpenBulkExportDialog(true);
  // };

  // const onCloseBulkExportDialog = () => {
  //   setOpenBulkExportDialog(false);
  // };

  const onRowsPerPageChange = (newRowsPerPage) => {
    setParams((prev) => ({
      ...prev,
      per_page: newRowsPerPage,
    }));
  };

  const breadcrumbs = [{ title: "Orders", isNavigation: false }];

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
  return (
    <div className="flex flex-col">
      <NavbarItem
        title="Orders"
        breadcrumbs={breadcrumbs}
        customBox={<DateRangePicker onChange={handleDateRangeChange} />}
      />

      <div className="py-1 px-4">
        <CustomActionMenu
          title="Orders"
          total={ordersLength}
          handleSearch={handleSearch}
          searchText={searchText}
          onRowsPerPageChange={onRowsPerPageChange}
          showRowSelection={true}
          rowsPerPage={params.per_page}
          disableBulkExport={false}
          disableAdd
          // onBulkExport={onOpenBulkExportDialog}
        />
        <OrdersTable
          setOrdersLength={setOrdersLength}
          params={params}
          setParams={setParams}
        />
        {/* <ExportOrdersDialog
          openDialog={openBulkExportDialog}
          onClose={onCloseBulkExportDialog}
          params={params}
        /> */}
      </div>
    </div>
  );
};

export default Orders;
