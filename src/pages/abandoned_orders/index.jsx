import NavbarItem from "@/components/navbar/navbar_items";
import CustomActionMenu from "@/components/custom_action";
import { useEffect, useState } from "react";
import AbandonedOrdersTable from "./components/AbandonedOrdersTable";
import { useDebounce } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import { Mail, History } from "lucide-react";
import { toast } from "sonner";
import { bulkSendReminders } from "./helpers/bulkSendReminders";
import SendReminderDialog from "@/components/send_reminder_dialog";
import { useNavigate } from "react-router-dom";

const AbandonedOrders = () => {
  const navigate = useNavigate();
  const paramInitialState = {
    page: 1,
    per_page: 25,
    search: "",
  };
  const [abandonedOrdersLength, setAbandonedOrdersLength] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState(paramInitialState);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);

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

  const handleBulkSend = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one abandoned order");
      return;
    }
    setReminderDialogOpen(true);
  };

  const handleSendReminder = async (data) => {
    setIsSending(true);
    try {
      const cartIds = selectedRows.map((row) => row._id);
      await bulkSendReminders({ 
        cartIds,
        channel: data.channel.id,
        template: data.template.id,
      });
      toast.success(`${data.channel.name} reminders sent to ${selectedRows.length} customers`);
      setSelectedRows([]);
      setReminderDialogOpen(false);
    } catch (error) {
      toast.error("Failed to send reminders");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const breadcrumbs = [{ title: "Abandoned Orders", isNavigation: false }];

  const handleViewHistory = () => {
    navigate("/dashboard/reminder-history");
  };

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
        title="Abandoned Orders" 
        breadcrumbs={breadcrumbs}
        customBox={
          <Button 
            variant="outline" 
            onClick={handleViewHistory}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            View History
          </Button>
        }
      />

      <div className="py-1 px-4">
        <CustomActionMenu
          title="Abandoned Orders"
          total={abandonedOrdersLength}
          handleSearch={handleSearch}
          searchText={searchText}
          onRowsPerPageChange={onRowsPerPageChange}
          showRowSelection={true}
          rowsPerPage={params.per_page}
          disableAdd
          rightSlot={
            <Button
              onClick={handleBulkSend}
              disabled={selectedRows.length === 0 || isSending}
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>
                {isSending
                  ? "Sending..."
                  : `Send Reminders ${selectedRows.length > 0 ? `(${selectedRows.length})` : ""}`}
              </span>
            </Button>
          }
        />
        <AbandonedOrdersTable
          setAbandonedOrdersLength={setAbandonedOrdersLength}
          params={params}
          setParams={setParams}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />

        <SendReminderDialog
          open={reminderDialogOpen}
          onClose={() => setReminderDialogOpen(false)}
          customers={selectedRows}
          onSend={handleSendReminder}
          isSending={isSending}
        />
      </div>
    </div>
  );
};

export default AbandonedOrders;

