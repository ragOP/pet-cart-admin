import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { updateOrderStatus } from "../helper/updateOrder";
import { generateAndSendBill } from "../helper/generateBill";
import { createShiprocketOrder } from "../helper/createShiprocketOrder";
import {
  Package2,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Hash,
  IndianRupee,
  Tag,
  Truck,
  Phone,
  Mail,
  FileText,
  Send,
  Receipt,
  TrendingUp,
} from "lucide-react";

const OrderFormSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
});

const ShiprocketSchema = z.object({
  length: z.number().min(1, "Length must be at least 1"),
  width: z.number().min(1, "Width must be at least 1"),
  height: z.number().min(1, "Height must be at least 1"),
});

const OrderForm = ({ initialData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showShiprocketForm, setShowShiprocketForm] = useState(!initialData?.shipRocketOrderId);

  const form = useForm({
    resolver: zodResolver(OrderFormSchema),
    defaultValues: {
      status: initialData?.status || "pending",
    },
  });

  const shiprocketForm = useForm({
    resolver: zodResolver(ShiprocketSchema),
    defaultValues: {
      length: 0,
      width: 0,
      height: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        status: data.status,
        note: initialData?.note || "",
        transcation: initialData?.transcation || null,
      };
      return await updateOrderStatus({ id: initialData._id, payload });
    },
    onSuccess: (res) => {
      if (res?.response?.success) {
        queryClient.invalidateQueries({ queryKey: ["order", initialData._id] });
        toast.success("Order status updated successfully");
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

  const billMutation = useMutation({
    mutationFn: async () => {
      return await generateAndSendBill({
        orderId: initialData?.orderId,
        customerEmail: initialData?.address?.email,
      });
    },
    onSuccess: (res) => {
      if (res?.success) {
        toast.success("Bill generated and sent to customer successfully!");
      } else {
        toast.error(res?.message || "Failed to generate bill");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to generate and send bill");
    },
  });

  const shiprocketMutation = useMutation({
    mutationFn: async (data) => {
      return await createShiprocketOrder({
        orderId: initialData?._id,
        dimensions: data,
      });
    },
    onSuccess: (res) => {
      if (res?.response?.success) {
        toast.success("Shiprocket order created successfully!");
        setShowShiprocketForm(false);
      } else {
        toast.error(res?.response?.message || "Failed to create shiprocket order");
      }
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create shiprocket order");
    },
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      shipped: "bg-purple-100 text-purple-800 border-purple-300",
      delivered: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      refunded: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || colors.pending;
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cod: "Cash on Delivery",
      card: "Card Payment",
      upi: "UPI Payment",
      netbanking: "Net Banking",
      wallet: "Wallet Payment",
    };
    return methods[method] || (method ? method.toUpperCase() : "N/A");
  };

  const handleGenerateBill = () => {
    billMutation.mutate();
  };

  if (!initialData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No order data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track order information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerateBill}
            disabled={billMutation.isPending}
            variant="outline"
            className="flex items-center gap-2"
          >
            {billMutation.isPending ? (
              <>
                <Receipt className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Generate & Send Bill
              </>
            )}
          </Button>
          <Badge
            className={`${getStatusColor(
              initialData?.status || "pending"
            )} border`}
          >
            {(initialData?.status || "pending").charAt(0).toUpperCase() +
              (initialData?.status || "pending").slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Order ID
                  </p>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {initialData?.orderId || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    User ID
                  </p>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {initialData?.userId || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Order Date
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {initialData?.createdAt
                      ? new Date(initialData.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {getPaymentMethodLabel(initialData?.paymentMethod || "N/A")}
                  </p>
                </div>
                {initialData?.couponCode && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Coupon Applied
                    </p>
                    <p className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      {initialData.couponCode}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package2 className="h-5 w-5" />
                Order Items ({initialData?.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>After Discount</TableHead>
                    <TableHead>GST Components</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(initialData?.items || []).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {item?.productId?.title || "N/A"}
                          </p>
                          {item?.variantId && (
                            <p className="text-sm text-muted-foreground">
                              Variant: {item.variantId.weight} -{" "}
                              {item.variantId.sku}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item?.quantity || 0}</Badge>
                      </TableCell>
                      <TableCell>{formatPrice(item?.price || 0)}</TableCell>

                      <TableCell>
                        <div className="text-green-600 text-sm">
                          {formatPrice(item?.couponDiscount || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {(item?.cgstAmount || 0) > 0 && (
                            <div className="text-xs">
                              CGST: {formatPrice(item?.cgstAmount || 0)}
                            </div>
                          )}
                          {(item?.sgstAmount || 0) > 0 && (
                            <div className="text-xs">
                              SGST: {formatPrice(item?.sgstAmount || 0)}
                            </div>
                          )}
                          {(item?.igstAmount || 0) > 0 && (
                            <div className="text-xs">
                              IGST: {formatPrice(item?.igstAmount || 0)}
                            </div>
                          )}
                          {(item?.cessAmount || 0) > 0 && (
                            <div className="text-xs">
                              Cess: {formatPrice(item?.cessAmount || 0)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(item?.total || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Name
                    </p>
                    <p className="font-medium">
                      {initialData?.address?.name || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Phone
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {initialData?.address?.mobile || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {initialData?.address?.email || "N/A"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </p>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      {initialData?.address?.address || "N/A"}
                      <br />
                      {initialData?.address?.city || "N/A"},{" "}
                      <span className="font-medium">
                        {initialData?.address?.state || "N/A"}
                      </span>{" "}
                      {initialData?.address?.pincode || "N/A"}
                      <br />
                      {initialData?.address?.country || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Update Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              "pending",
                              "confirmed",
                              "shipped",
                              "delivered",
                              "cancelled",
                              "refunded",
                            ].map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full"
                  >
                    {mutation.isPending ? "Updating..." : "Update Status"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Shiprocket Order Creation */}
          {showShiprocketForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Create Shiprocket Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...shiprocketForm}>
                  <form
                    onSubmit={shiprocketForm.handleSubmit((data) => shiprocketMutation.mutate(data))}
                    className="space-y-4"
                  >
                    <FormField
                      control={shiprocketForm.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length (cm)</FormLabel>
                          <FormControl>
                            <input
                              type="number"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Enter length"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shiprocketForm.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width (cm)</FormLabel>
                          <FormControl>
                            <input
                              type="number"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Enter width"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={shiprocketForm.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <input
                              type="number"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Enter height"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={shiprocketMutation.isPending}
                      className="w-full"
                    >
                      {shiprocketMutation.isPending ? "Creating..." : "Create Shiprocket Order"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Raw Price</span>
                  <span>{formatPrice(initialData?.rawPrice || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">
                    -{formatPrice(initialData?.discountedAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">After Discount</span>
                  <span>
                    {formatPrice(initialData?.discountedAmountAfterCoupon || 0)}
                  </span>
                </div>
                <Separator />
                {(() => {
                  const totalCess = (initialData?.items || []).reduce(
                    (sum, item) => sum + (item?.cessAmount || 0),
                    0
                  );
                  const totalCgst = (initialData?.items || []).reduce(
                    (sum, item) => sum + (item?.cgstAmount || 0),
                    0
                  );
                  const totalSgst = (initialData?.items || []).reduce(
                    (sum, item) => sum + (item?.sgstAmount || 0),
                    0
                  );
                  const totalIgst = (initialData?.items || []).reduce(
                    (sum, item) => sum + (item?.igstAmount || 0),
                    0
                  );
                  return (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        GST Breakdown
                      </div>
                      {initialData?.address?.state === "gujarat" ||
                      initialData?.address?.state === "Gujarat" ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              CGST (Central GST)
                            </span>
                            <span>{formatPrice(totalCgst)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              SGST (State GST)
                            </span>
                            <span>{formatPrice(totalSgst)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            IGST (Integrated GST)
                          </span>
                          <span>{formatPrice(totalIgst)}</span>
                        </div>
                      )}
                      {totalCess > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cess</span>
                          <span>{formatPrice(totalCess)}</span>
                        </div>
                      )}
                      {totalCess > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping Cost</span>
                          <span>{formatPrice(initialData.totalAmount - initialData.amountAfterTax)}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Amount</span>
                  <span>{formatPrice(initialData?.totalAmount || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">Weight Breakdown</div>
                <div className="space-y-2 border-b divide-dotted">
                  {initialData.items && initialData.items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.productId.title.slice(0, 30) + "..."}</span>
                      <span>{item.productId.weight} kg</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </p>
                  <p className="text-sm">
                    {initialData?.updatedAt
                      ? new Date(initialData.updatedAt).toLocaleDateString(
                          "en-IN",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "N/A"}
                  </p>
                </div>
                {initialData?.note && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Note
                    </p>
                    <p className="text-sm bg-muted p-2 rounded">
                      {initialData.note}
                    </p>
                  </div>
                )}
                {initialData?.transcation && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Transaction Status
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {initialData.transcation?.status || "N/A"}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
