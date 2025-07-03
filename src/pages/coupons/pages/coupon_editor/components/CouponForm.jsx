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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCoupon } from "../helper/updateCoupon";
import { createCoupon } from "../helper/createCoupon";
import { Checkbox } from "@/components/ui/checkbox";

const CouponFormSchema = (isEdit = false) =>
  z
    .object({
      code: z.string().min(2, "Code must be at least 2 characters"),
      discountType: z.enum(["percentage", "fixed"]),
      discountValue: z.number().min(0, "Discount value must be at least 0"),
      maxDiscount: z.number().nullable().optional(),
      minPurchase: z.number().min(0, "Minimum purchase must be at least 0"),
      startDate: z.string().nonempty("Start date is required"),
      endDate: z.string().nonempty("End date is required"),
      totalUseLimit: z.number().nullable(),
      active: z.boolean(),
      autoApply: z.boolean(),
    })
    .refine(
      (data) => {
        if (data.discountType === "percentage") {
          return data.discountValue >= 1 && data.discountValue <= 100;
        }
        return true; // skip validation if discount type is fixed
      },
      {
        message: "Percentage discount must be between 1 and 100",
        path: ["discountValue"],
      }
    )    
    .refine(
      (data) =>
        isEdit || new Date(data.startDate) > new Date(),
      {
        message: "Start date must be in the future",
        path: ["startDate"],
      }
    )
    .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
      message: "End date must be after start date",
      path: ["endDate"],
    });


const CouponForm = ({ isEdit = false, initialData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(CouponFormSchema(isEdit)),
    defaultValues: initialData
      ? {
          ...initialData,
          startDate: initialData.startDate
            ? new Date(initialData.startDate).toISOString().split("T")[0] // Convert ISO to YYYY-MM-DD
            : "",
          endDate: initialData.endDate
            ? new Date(initialData.endDate).toISOString().split("T")[0] // Convert ISO to YYYY-MM-DD
            : "",
        }
      : {
          code: "",
          discountType: "percentage",
          discountValue: null,
          maxDiscount: null,
          minPurchase: null,
          startDate: "",
          endDate: "",
          totalUseLimit: null,
          // userUseLimit: null,
          active: true,
          autoApply: false,
        },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) {
        return await updateCoupon({ id: initialData._id, payload: data });
      } else {
        return await createCoupon(data);
      }
    },
    onSuccess: (res) => {
      if (res?.response?.success) {
        queryClient.invalidateQueries(["coupons", initialData?._id]);
        toast.success(`Coupon ${isEdit ? "updated" : "created"} successfully`);
        navigate("/dashboard/coupons");
      } else {
        console.log(res?.response);
        toast.error(res?.response?.data?.message || "Failed to process coupon");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} coupon`);
    },
  });

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Code Field */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon Code*</FormLabel>
              <FormControl>
                <Input placeholder="Enter coupon code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Discount Type Field */}
        <FormField
          control={form.control}
          name="discountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Discount Value Field */}
        <FormField
          control={form.control}
          name="discountValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Value*</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter discount value"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Max Discount Field */}
        <FormField
          control={form.control}
          name="maxDiscount"
          render={({ field }) => {
            const discountType = form.watch("discountType");
            return (
              <FormItem>
                <FormLabel>Max Discount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter max discount"
                    {...field}
                    disabled={discountType === "fixed"}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Min Purchase Field */}
        <FormField
          control={form.control}
          name="minPurchase"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Purchase*</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter minimum purchase"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Date Field */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date*</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Date Field */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date*</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Total Use Limit Field */}
        <FormField
          control={form.control}
          name="totalUseLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Use Limit* </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter total use limit"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* User Use Limit Field */}
        {/* <FormField
          control={form.control}
          name="userUseLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Use Limit* </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter user use limit"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* Active Field */}
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row  gap-4">
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

        {/* Auto Apply Field */}
        <FormField
          control={form.control}
          name="autoApply"
          render={({ field }) => (
            <FormItem className="flex flex-row  gap-4">
              <FormLabel>Auto Apply</FormLabel>
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
            ? "Update Coupon"
            : "Create Coupon"}
        </Button>
      </form>
    </Form>
  );
};

export default CouponForm;
