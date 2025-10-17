import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, User, Package, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import NavbarItem from "@/components/navbar/navbar_items";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Typography from "@/components/typography";
import { fetchAbandonedOrderById } from "../helpers/fetchAbandonedOrderById";
import { formatPrice } from "@/utils/format_price";
import { toast } from "sonner";
import { bulkSendReminders } from "../helpers/bulkSendReminders";
import { useState } from "react";
import SendReminderDialog from "@/components/send_reminder_dialog";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";

const AbandonedOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);

  const { data: abandonedOrder, isLoading, error } = useQuery({
    queryKey: ["AbandonedOrder", id],
    queryFn: () => fetchAbandonedOrderById({ id }),
  });

  const handleBack = () => {
    navigate("/dashboard/abandoned-orders");
  };

  const handleSendReminder = async (data) => {
    setIsSending(true);
    try {
      await bulkSendReminders({ 
        channel: data.channel.id,
        customers: abandonedOrder ? [abandonedOrder] : [],
      });
      toast.success(`${data.channel.name} reminder sent successfully`);
      setReminderDialogOpen(false);
    } catch (error) {
      toast.error("Failed to send reminder");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const breadcrumbs = [
    { title: "Abandoned Orders", url: "/dashboard/abandoned-orders", isNavigation: true },
    { title: "Order Detail", isNavigation: false },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <CustomSpinner />
      </div>
    );
  }

  if (error || !abandonedOrder) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h3" className="text-red-500">
            Error loading abandoned order
          </Typography>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <NavbarItem title="Abandoned Order Detail" breadcrumbs={breadcrumbs} />

      <div className="p-4 space-y-4">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <Button onClick={() => setReminderDialogOpen(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Send Reminder
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Typography className="text-sm text-gray-500">Name</Typography>
                <Typography className="font-medium">
                  {abandonedOrder?.userId?.name || "N/A"}
                </Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </Typography>
                <Typography className="font-medium">
                  {abandonedOrder?.userId?.phoneNumber || "N/A"}
                </Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </Typography>
                <Typography className="font-medium">
                  {abandonedOrder?.userId?.email || "N/A"}
                </Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">User Status</Typography>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs ${
                    abandonedOrder?.userId?.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {abandonedOrder?.userId?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Cart Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Cart Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Typography className="text-sm text-gray-500">Cart ID</Typography>
                <Typography className="font-medium font-mono text-xs">
                  {abandonedOrder?._id}
                </Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">Total Items</Typography>
                <Typography className="font-medium text-lg">
                  {abandonedOrder?.items?.length || 0}
                </Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">Total Amount</Typography>
                <Typography className="font-bold text-xl text-primary">
                  {formatPrice(abandonedOrder?.total_price)}
                </Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">Cart Status</Typography>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs ${
                    abandonedOrder?.is_active
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {abandonedOrder?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Typography className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Abandoned On
                </Typography>
                <Typography className="font-medium">
                  {format(new Date(abandonedOrder?.createdAt), "dd MMM yyyy, hh:mm a")}
                </Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last Updated
                </Typography>
                <Typography className="font-medium">
                  {format(new Date(abandonedOrder?.updatedAt), "dd MMM yyyy, hh:mm a")}
                </Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">User Last Login</Typography>
                <Typography className="font-medium">
                  {abandonedOrder?.userId?.lastLogin
                    ? format(new Date(abandonedOrder.userId.lastLogin), "dd MMM yyyy, hh:mm a")
                    : "N/A"}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Items */}
        <Card>
          <CardHeader>
            <CardTitle>Cart Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {abandonedOrder?.items?.map((item, index) => {
                // Use variant data if available, otherwise use product data
                const hasVariant = item?.variantId && typeof item.variantId === 'object';
                const displayImage = hasVariant 
                  ? (item.variantId.images?.[0] || item?.productId?.images?.[0])
                  : item?.productId?.images?.[0];
                const displayLabel = hasVariant
                  ? item.variantId.variantName
                  : item?.productId?.productLabel;
                
                return (
                  <div
                    key={index}
                    className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={item?.productId?.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <Typography className="font-semibold">
                        {item?.productId?.title || "Product"}
                      </Typography>
                      <div className="flex items-center gap-2">
                        <Typography className="text-sm text-gray-600">
                          {displayLabel || ""}
                        </Typography>
                        {hasVariant && (
                          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
                            Variant
                          </span>
                        )}
                      </div>
                    <div className="flex gap-4 mt-2">
                      <div>
                        <Typography className="text-xs text-gray-500">Price</Typography>
                        <Typography className="font-medium">
                          {formatPrice(item?.price)}
                        </Typography>
                      </div>
                      <div>
                        <Typography className="text-xs text-gray-500">Quantity</Typography>
                        <Typography className="font-medium">{item?.quantity}</Typography>
                      </div>
                      <div>
                        <Typography className="text-xs text-gray-500">Total</Typography>
                        <Typography className="font-medium">
                          {formatPrice(item?.total)}
                        </Typography>
                      </div>
                      <div>
                        <Typography className="text-xs text-gray-500">Weight</Typography>
                        <Typography className="font-medium">{item?.weight}g</Typography>
                      </div>
                    </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Total Summary */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <Typography className="text-lg font-semibold">Cart Total:</Typography>
                <Typography className="text-2xl font-bold text-primary">
                  {formatPrice(abandonedOrder?.total_price)}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        <SendReminderDialog
          open={reminderDialogOpen}
          onClose={() => setReminderDialogOpen(false)}
          customers={abandonedOrder ? [abandonedOrder] : []}
          onSend={handleSendReminder}
          isSending={isSending}
        />
      </div>
    </div>
  );
};

export default AbandonedOrderDetail;

