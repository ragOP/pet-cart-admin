import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { exportUsers } from "../helpers/exportUsers";

const ExportUserDialog = ({
  openDialog,
  onClose,
  params,
}) => {
  const { mutate: exportMutation, isPending } = useMutation({
    mutationFn: async (type) => {
      const updatedParams = {
        ...params,
        fileType: type,
      };
      const apiResponse = await exportUsers({ params: updatedParams });
      if (apiResponse?.response?.success) {
        const data = apiResponse?.response?.data;

        const link = document.createElement("a");
        link.href = data.url;
        link.setAttribute(
          "download",
          data.filename || (type === "csv" ? "user.csv" : "user.xlsx")
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        toast.success("File downloaded!");
      } else {
        const data = apiResponse?.response?.data;
        toast.error(`Download failed: ${data?.message}`);
      }
    },
  });

  const handleDownload = (type) => {
    exportMutation(type);
  };

  return (
    <Dialog
      open={openDialog}
      onOpenChange={onClose}
    >
      <DialogContent className="p-6 rounded-xl shadow-lg border border-gray-400">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Export Users
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button
            className="flex items-center gap-2 w-full"
            onClick={() => handleDownload("csv")}
            disabled={isPending}
            variant="outline"
          >
            <FileDown size={18} />
            Download as CSV
          </Button>
          <Button
            className="flex items-center gap-2 w-full"
            onClick={() => handleDownload("xlsx")}
            disabled={isPending}
          >
            <FileSpreadsheet size={18} />
            Download as Excel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportUserDialog;
