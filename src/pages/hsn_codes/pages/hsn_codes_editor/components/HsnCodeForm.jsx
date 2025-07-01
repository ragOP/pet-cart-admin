import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { updateHsnCode } from "../helper/updateHsnCode";
import { createHsnCode } from "../helper/createHsnCode";
import { useSelector } from "react-redux";
import { selectAdminId } from "@/redux/admin/adminSelector";

const HsnCodeFormSchema = z.object({
  hsn_code: z.string().min(2, "HSN Code is required"),
  description: z.string().min(2, "Description is required"),
  cgst_rate: z
    .number({ invalid_type_error: "CGST Rate must be a number" })
    .min(0, "Min 0%")
    .max(100, "Max 100%")
    .nullable()
    .or(z.string().transform((val) => (val === "" ? null : Number(val)))),
  sgst_rate: z
    .number({ invalid_type_error: "SGST Rate must be a number" })
    .min(0, "Min 0%")
    .max(100, "Max 100%")
    .nullable()
    .or(z.string().transform((val) => (val === "" ? null : Number(val)))),
  igst_rate: z
    .number({ invalid_type_error: "IGST Rate must be a number" })
    .min(0, "Min 0%")
    .max(100, "Max 100%")
    .nullable()
    .or(z.string().transform((val) => (val === "" ? null : Number(val)))),
  cess: z
    .number({ invalid_type_error: "Cess must be a number" })
    .min(0, "Min 0%")
    .max(100, "Max 100%")
    .nullable()
    .or(z.string().transform((val) => (val === "" ? null : Number(val)))),
  is_active: z.boolean().default(true),
});

const HsnCodeForm = ({ isEdit = false, initialData }) => {
  const navigate = useNavigate();

  const reduxAdminId = useSelector(selectAdminId);

  const form = useForm({
    resolver: zodResolver(HsnCodeFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          cgst_rate: initialData.cgst_rate ?? "",
          sgst_rate: initialData.sgst_rate ?? "",
          igst_rate: initialData.igst_rate ?? "",
          cess: initialData.cess ?? "",
          is_active: initialData.is_active ?? true,
        }
      : {
          hsn_code: "",
          description: "",
          cgst_rate: "",
          sgst_rate: "",
          igst_rate: "",
          cess: "",
          is_active: true,
        },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const adminId = reduxAdminId;
      const payload = {
        ...data,
        cgst_rate: data.cgst_rate === "" ? null : Number(data.cgst_rate),
        sgst_rate: data.sgst_rate === "" ? null : Number(data.sgst_rate),
        igst_rate: data.igst_rate === "" ? null : Number(data.igst_rate),
        cess: data.cess === "" ? null : Number(data.cess),
        ...(isEdit
          ? { updated_by_admin: adminId }
          : { created_by_admin: adminId }),
      };
      if (isEdit) {
        return await updateHsnCode({ id: initialData._id, payload });
      } else {
        return await createHsnCode(payload);
      }
    },
    onSuccess: (res) => {
      if (res?.response?.success) {
        toast.success(
          `HSN Code ${isEdit ? "updated" : "created"} successfully`
        );
        navigate("/dashboard/hsn_codes");
      } else {
        toast.error(
          res?.response?.data?.message || "Failed to process HSN Code"
        );
      }
    },
    onError: (error) => {
      toast.error(`Failed to ${isEdit ? "update" : "create"} HSN Code`, error);
    },
  });

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* HSN Code */}
        <FormField
          control={form.control}
          name="hsn_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HSN Code*</FormLabel>
              <FormControl>
                <Input placeholder="Enter HSN code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description*</FormLabel>
              <FormControl>
                <Input placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CGST Rate */}
        <FormField
          control={form.control}
          name="cgst_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CGST Rate (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={100}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SGST Rate */}
        <FormField
          control={form.control}
          name="sgst_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SGST Rate (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={100}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* IGST Rate */}
        <FormField
          control={form.control}
          name="igst_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IGST Rate (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={100}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cess */}
        <FormField
          control={form.control}
          name="cess"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cess (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={100}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row gap-4 items-center">
              <FormLabel>Active</FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Processing..."
            : isEdit
            ? "Update HSN Code"
            : "Create HSN Code"}
        </Button>
      </form>
    </Form>
  );
};

export default HsnCodeForm;
