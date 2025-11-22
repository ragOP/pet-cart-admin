import NavbarItem from "@/components/navbar/navbar_items";
import CustomActionMenu from "@/components/custom_action";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import UsersTable from "./components/UserTable";
import { useDebounce } from "@uidotdev/usehooks";
import { DateRangePicker } from "@/components/date_filter";
import ExportUserDialog from "./components/ExportUserDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SendCustomMessageDialog from "@/components/send_custom_message_dialog";
import { sendCustomMessage } from "./helpers/sendCustomMessage";

const Users = () => {
  const navigate = useNavigate();

  const paramInitialState = {
    page: 1,
    per_page: 50,
    search: "",
  };
  const [usersLength, setUsersLength] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState(paramInitialState);
  const [openBulkExportDialog, setOpenBulkExportDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [openCustomMessageDialog, setOpenCustomMessageDialog] = useState(false);
  const [isSendingCustomMessage, setIsSendingCustomMessage] = useState(false);

  const debouncedSearch = useDebounce(searchText, 500);

  const onAdd = () => {
    navigate("/dashboard/users/add");
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

  const breadcrumbs = [{ title: "Users", isNavigation: false }];

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

  const selectedCount = selectedUsers.length;
  const hasSelection = selectedCount > 0;

  const handleOpenCustomMessageDialog = () => {
    if (!hasSelection) {
      toast.error("Select at least one user to send a message.");
      return;
    }
    setOpenCustomMessageDialog(true);
  };

  const handleSendCustomMessage = async (data) => {
    setIsSendingCustomMessage(true);
    try {
      await sendCustomMessage({
        channel: data.channel,
        title: data.title,
        body: data.body,
        users: selectedUsers,
      });
      
      toast.success(
        `Custom ${data.channel.name} sent successfully to ${selectedUsers.length} ${selectedUsers.length === 1 ? 'user' : 'users'}.`
      );
      setSelectedUsers([]);
      setOpenCustomMessageDialog(false);
    } catch (error) {
      const message = error?.message || "Failed to send custom message.";
      toast.error(message);
      console.error(error);
    } finally {
      setIsSendingCustomMessage(false);
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
        title="Users"
        breadcrumbs={breadcrumbs}
        customBox={
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleOpenCustomMessageDialog}
              disabled={!hasSelection || isSendingCustomMessage}
            >
              Send Message
            </Button>
            {hasSelection && (
              <span className="text-sm text-muted-foreground">
                {selectedCount} selected
              </span>
            )}
            <DateRangePicker onChange={handleDateRangeChange} />
          </div>
        }
      />

      <div className="py-1 px-4">
        <CustomActionMenu
          title="Users"
          total={usersLength}
          onAdd={onAdd}
          handleSearch={handleSearch}
          searchText={searchText}
          onRowsPerPageChange={onRowsPerPageChange}
          showRowSelection={true}
          rowsPerPage={params.per_page}
          disableBulkExport={false}
          onBulkExport={onOpenBulkExportDialog}
        />
        <UsersTable
          setUsersLength={setUsersLength}
          params={params}
          setParams={setParams}
          onSelectedUsersChange={setSelectedUsers}
        />
        <ExportUserDialog
          openDialog={openBulkExportDialog}
          onClose={onCloseBulkExportDialog}
          params={params}
        />
        <SendCustomMessageDialog
          open={openCustomMessageDialog}
          onClose={() => setOpenCustomMessageDialog(false)}
          users={selectedUsers}
          onSend={handleSendCustomMessage}
          isSending={isSendingCustomMessage}
        />
      </div>
    </div>
  );
};

export default Users;
