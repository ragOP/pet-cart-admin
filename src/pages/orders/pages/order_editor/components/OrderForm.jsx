import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { updateOrderStatus } from "../helper/updateOrder";

const OrderFormSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"]),
  note: z.string().optional(),
  transactionStatus: z.enum(["pending", "paid", "failed", "refunded"]),
  transactionId: z.string().optional(),
});

const OrderForm = ({ isEdit = false, initialData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(OrderFormSchema),
    defaultValues: {
      status: initialData?.status || "pending",
      note: initialData?.note || "",
      transactionStatus: initialData?.transcation?.status || "pending",
      transactionId: initialData?.transcation?.transactionId || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        status: data.status,
        note: data.note,
        transcation: {
          status: data.transactionStatus,
          transactionId: data.transactionId,
        },
      };
      return await updateOrderStatus({ id: initialData._id, payload });
    },
    onSuccess: (res) => {
      if (res?.response?.success) {
        queryClient.invalidateQueries({ queryKey: ['order', initialData._id] });
        toast.success("Order updated successfully");
        navigate("/dashboard/orders");
      } else {
        toast.error(res?.response?.message || "Failed to update order");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update order");
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">

        {/* Order Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"].map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Input placeholder="Internal note or delivery instruction" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transaction Status */}
        <FormField
          control={form.control}
          name="transactionStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["pending", "paid", "failed", "refunded"].map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Transaction ID */}
        <FormField
          control={form.control}
          name="transactionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g. TXN123456ABC" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Updating..." : "Update Order"}
        </Button>
      </form>
    </Form>
  );
};

export default OrderForm;
