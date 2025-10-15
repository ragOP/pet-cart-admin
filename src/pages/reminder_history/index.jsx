import NavbarItem from "@/components/navbar/navbar_items";
import CustomActionMenu from "@/components/custom_action";
import { useEffect, useState } from "react";
import ReminderHistoryTable from "./components/ReminderHistoryTable";
import { useDebounce } from "@uidotdev/usehooks";
import { DateRangePicker } from "@/components/date_filter";

const ReminderHistory = () => {
  const paramInitialState = {
    page: 1,
    per_page: 25,
    search: "",
  };
  
  const [historyLength, setHistoryLength] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState(paramInitialState);

  const debouncedSearch = useDebounce(searchText, 500);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const onRowsPerPageChange = (newRowsPerPage) => {
    setParams((prev) => ({
      ...prev,
      per_page: newRowsPerPage,
    }));
  };

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

  const breadcrumbs = [{ title: "Reminder History", isNavigation: false }];

  useEffect(() => {
    if (params.search !== debouncedSearch) {
      setParams((prev) => ({
        ...prev,
        search: debouncedSearch,
      }));
    }
  }, [debouncedSearch, params.search]);

  return (
    <div className="flex flex-col">
      <NavbarItem
        title="Reminder History"
        breadcrumbs={breadcrumbs}
        customBox={<DateRangePicker onChange={handleDateRangeChange} />}
      />

      <div className="py-1 px-4">
        <CustomActionMenu
          title="Reminder Campaigns"
          total={historyLength}
          handleSearch={handleSearch}
          searchText={searchText}
          onRowsPerPageChange={onRowsPerPageChange}
          showRowSelection={true}
          rowsPerPage={params.per_page}
          disableAdd
        />
        <ReminderHistoryTable
          setHistoryLength={setHistoryLength}
          params={params}
          setParams={setParams}
        />
      </div>
    </div>
  );
};

export default ReminderHistory;

