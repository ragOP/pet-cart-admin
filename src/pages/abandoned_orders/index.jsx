import NavbarItem from "@/components/navbar/navbar_items";
import CustomActionMenu from "@/components/custom_action";
import { useEffect, useState } from "react";
import AbandonedOrdersTable from "./components/AbandonedOrdersTable";
import { useDebounce } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import { Mail, History, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { bulkSendReminders } from "./helpers/bulkSendReminders";
import SendReminderDialog from "@/components/send_reminder_dialog";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const AbandonedOrders = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        template: data.template?.id,
        notificationData: data.notificationData,
        subOption: data.subOption?.id,
        customers: selectedRows, // Pass the full customer data
      });
      
      let successMessage = `${data.channel.name}`;
      if (data.subOption) {
        successMessage += ` (${data.subOption.name})`;
      }
      successMessage += ` reminders sent to ${selectedRows.length} customers`;
      
      toast.success(successMessage);
      setSelectedRows([]);
      setReminderDialogOpen(false);
      
      // Navigate to reminder history after successful send
      navigate("/dashboard/reminder-history");
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries(["abandoned_orders"]);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
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
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={handleViewHistory}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              View History
            </Button>
          </div>
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

