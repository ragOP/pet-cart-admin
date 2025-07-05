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
import { updateOrderStatus } from "../helper/updateOrder";
import { generateAndSendBill } from "../helper/generateBill";
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

const OrderForm = ({ initialData }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(OrderFormSchema),
    defaultValues: {
      status: initialData?.status || "pending",
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const calculateGST = (taxAmount, customerState, companyState = "Delhi") => {
    const isIntraState = customerState === companyState;

    if (isIntraState) {
      // For intrastate transactions: CGST + SGST
      const cgst = taxAmount / 2;
      const sgst = taxAmount / 2;
      return {
        cgst,
        sgst,
        igst: 0,
        isIntraState: true,
      };
    } else {
      // For interstate transactions: IGST only
      return {
        cgst: 0,
        sgst: 0,
        igst: taxAmount,
        isIntraState: false,
      };
    }
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
                          {(() => {
                            const gstBreakdown = calculateGST(
                              item?.taxAmount || 0,
                              initialData?.address?.state
                            );
                            return (
                              <>
                                {gstBreakdown.isIntraState ? (
                                  <>
                                    <div className="text-xs">
                                      CGST: {formatPrice(gstBreakdown.cgst)}
                                    </div>
                                    <div className="text-xs">
                                      SGST: {formatPrice(gstBreakdown.sgst)}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-xs">
                                    IGST: {formatPrice(gstBreakdown.igst)}
                                  </div>
                                )}
                                {(item?.cessAmount || 0) > 0 && (
                                  <div className="text-xs">
                                    Cess: {formatPrice(item?.cessAmount || 0)}
                                  </div>
                                )}
                              </>
                            );
                          })()}
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
                    <div className="mt-2 text-xs text-muted-foreground">
                      GST Type:{" "}
                      {(() => {
                        const gstBreakdown = calculateGST(
                          100,
                          initialData?.address?.state
                        );
                        return gstBreakdown.isIntraState
                          ? "Intrastate (CGST + SGST)"
                          : "Interstate (IGST)";
                      })()}
                    </div>
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
                  const totalTax = (initialData?.items || []).reduce(
                    (sum, item) => sum + (item?.taxAmount || 0),
                    0
                  );
                  const totalCess = (initialData?.items || []).reduce(
                    (sum, item) => sum + (item?.cessAmount || 0),
                    0
                  );
                  const gstBreakdown = calculateGST(
                    totalTax,
                    initialData?.address?.state
                  );

                  return (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        GST Breakdown
                      </div>
                      {gstBreakdown.isIntraState ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              CGST (Central GST)
                            </span>
                            <span>{formatPrice(gstBreakdown.cgst)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              SGST (State GST)
                            </span>
                            <span>{formatPrice(gstBreakdown.sgst)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            IGST (Integrated GST)
                          </span>
                          <span>{formatPrice(gstBreakdown.igst)}</span>
                        </div>
                      )}
                      {totalCess > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cess</span>
                          <span>{formatPrice(totalCess)}</span>
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
