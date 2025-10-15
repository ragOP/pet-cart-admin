import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, MessageSquare, CheckCircle, XCircle, Clock, User, Calendar, TrendingUp, CheckCheck } from "lucide-react";
import NavbarItem from "@/components/navbar/navbar_items";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Typography from "@/components/typography";
import { fetchReminderHistoryById } from "../helpers/fetchReminderHistoryById";
import { formatPrice } from "@/utils/format_price";
import { formatStandardDate } from "@/utils/format_date";
import { Badge } from "@/components/ui/badge";
import { CustomSpinner } from "@/components/loaders/CustomSpinner";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

const CHANNEL_ICONS = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: WhatsAppIcon,
};

const ReminderHistoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: historyDetail, isLoading, error } = useQuery({
    queryKey: ["ReminderHistoryDetail", id],
    queryFn: () => fetchReminderHistoryById({ id }),
  });

  const handleBack = () => {
    navigate("/dashboard/reminder-history");
  };

  const breadcrumbs = [
    { title: "Reminder History", url: "/dashboard/reminder-history", isNavigation: true },
    { title: "Campaign Detail", isNavigation: false },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <CustomSpinner />
      </div>
    );
  }

  if (error || !historyDetail) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h3" className="text-red-500">
            Error loading campaign details
          </Typography>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const ChannelIcon = CHANNEL_ICONS[historyDetail.channel] || Mail;
  const total = historyDetail.totalRecipients || 0;
  const successful = historyDetail.successCount || 0;
  const failed = historyDetail.failedCount || 0;
  const pending = historyDetail.pendingCount || 0;
  const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : 0;

  return (
    <div className="flex flex-col">
      <NavbarItem title="Campaign Details" breadcrumbs={breadcrumbs} />

      <div className="p-4 space-y-4">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>
          <div className="flex items-center gap-2">
            <Badge className="text-base px-4 py-2">
              Campaign #{historyDetail._id?.slice(-8).toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Campaign Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <ChannelIcon className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Channel</span>
                </div>
                <Typography className="text-xl font-bold capitalize">{historyDetail.channel}</Typography>
                <Typography className="text-xs text-gray-600">{historyDetail.templateName}</Typography>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Recipients</span>
                </div>
                <Typography className="text-xl font-bold mb-2">{total}</Typography>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600">Success:</span>
                    <span className="text-sm font-semibold text-green-600">{successful}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-gray-600">Failed:</span>
                    <span className="text-sm font-semibold text-red-600">{failed}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Success Rate</span>
                </div>
                <Typography className={`text-xl font-bold ${
                  successRate >= 90 ? 'text-green-600' : 
                  successRate >= 70 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {successRate}%
                </Typography>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      successRate >= 90 ? 'bg-green-500' : 
                      successRate >= 70 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${successRate}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Sent On</span>
                </div>
                <Typography className="text-sm font-medium">
                  {formatStandardDate(historyDetail.createdAt)}
                </Typography>
                <Typography className="text-xs text-gray-600">
                  By {historyDetail.sentBy?.name || "Admin"}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template & Message */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {historyDetail.subject && (
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</span>
                  <Typography className="text-sm font-medium mt-1">{historyDetail.subject}</Typography>
                </div>
              )}
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Template Name</span>
                <Typography className="text-sm font-medium mt-1">{historyDetail.templateName}</Typography>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Message Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded border text-xs leading-relaxed max-h-32 overflow-y-auto">
                {historyDetail.messagePreview || historyDetail.message || "No preview available"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="p-3 bg-green-500 rounded-full">
                  <CheckCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Typography className="text-sm text-gray-600 dark:text-gray-400">Success</Typography>
                  <Typography className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {successful}
                  </Typography>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="p-3 bg-red-500 rounded-full">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Typography className="text-sm text-gray-600 dark:text-gray-400">Failed</Typography>
                  <Typography className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {failed}
                  </Typography>
                </div>
              </div>

              {pending > 0 && (
                <div className="flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="p-3 bg-yellow-500 rounded-full">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <Typography className="text-sm text-gray-600 dark:text-gray-400">Pending</Typography>
                    <Typography className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {pending}
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 divide-x dark:divide-gray-700">
              <div className="px-4">
                <Typography className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Cart Value</Typography>
                <Typography className="text-lg font-bold text-primary">
                  {formatPrice((historyDetail.recipients || []).reduce((sum, r) => sum + (r.cartValue || 0), 0))}
                </Typography>
              </div>
              <div className="px-4">
                <Typography className="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg. Cart Value</Typography>
                <Typography className="text-lg font-bold">
                  {formatPrice(total > 0 ? (historyDetail.recipients || []).reduce((sum, r) => sum + (r.cartValue || 0), 0) / total : 0)}
                </Typography>
              </div>
              <div className="px-4">
                <Typography className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Items</Typography>
                <Typography className="text-lg font-bold">
                  {(historyDetail.recipients || []).reduce((sum, r) => sum + (r.itemCount || 0), 0)}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReminderHistoryDetail;

