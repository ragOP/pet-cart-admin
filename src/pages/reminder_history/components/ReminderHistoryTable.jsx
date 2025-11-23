import { useQuery } from "@tanstack/react-query";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { useEffect } from "react";
import { fetchReminderHistory } from "../helpers/fetchReminderHistory";
import { useNavigate } from "react-router-dom";
import { Eye, Mail, MessageSquare, CheckCircle, XCircle, Bell } from "lucide-react";
import { formatDateWithAgo } from "@/utils/format_date";
import { Button } from "@/components/ui/button";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

const CHANNEL_ICONS = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: WhatsAppIcon,
  push_notification: Bell,
  android: Bell,
  ios: Bell,
};

const ReminderHistoryTable = ({ setHistoryLength, params, setParams }) => {
  const navigate = useNavigate();

  const {
    data: HistoryRes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ReminderHistory", params],
    queryFn: () => fetchReminderHistory({ params }),
  });

  const total = HistoryRes?.total || 0;
  const history = HistoryRes?.history || [];

  useEffect(() => {
    setHistoryLength(HistoryRes?.history?.length || 0);
  }, [HistoryRes?.history, setHistoryLength]);

  const onViewDetails = (row) => {
    navigate(`/dashboard/reminder-history/${row._id}`);
  };

  const columns = [
    {
      key: "campaignId",
      label: "Campaign ID",
      render: (value, row) => (
        <Typography className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300">
          #{row._id?.slice(-6).toUpperCase()}
        </Typography>
      ),
    },
    {
      key: "type",
      label: "Channel",
      render: (value, row) => {
        const Icon = CHANNEL_ICONS[row.type] || Mail;
        const channelConfig = {
          email: { color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          sms: { color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
          whatsapp: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          push_notification: { color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
          android: { color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
          ios: { color: "text-gray-600", bg: "bg-gray-50 dark:bg-gray-900/20" },
        };
        const config = channelConfig[row.type] || channelConfig.email;
        
        return (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${config.bg}`}>
            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
            <span className={`text-xs font-medium capitalize ${config.color}`}>{row.type}</span>
          </div>
        );
      },
    },
    {
      key: "name",
      label: "Campaign",
      render: (value, row) => (
        <div className="max-w-xs">
          <Typography className="text-sm font-medium truncate">
            {row.name || "N/A"}
          </Typography>
          {row.subject && (
            <Typography className="text-xs text-gray-500 truncate">
              {row.subject}
            </Typography>
          )}
        </div>
      ),
    },
    {
      key: "stats",
      label: "Delivery Stats",
      render: (value, row) => {
        const total = row.totalCount || 0;
        const successful = row.successCount || 0;
        const failed = row.failureCount || 0;
        const rate = row.successRate.toFixed(2) || (total > 0 ? ((successful / total) * 100).toFixed(2) : 0);
        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-600">{successful}</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-medium text-red-600">{failed}</span>
              </div>
              <span className="text-xs text-gray-400">/</span>
              <span className="text-xs font-semibold">{total}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${rate >= 90 ? 'bg-green-500' : rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${rate}%` }}
                />
              </div>
              <span className={`text-xs font-semibold ${
                rate >= 90 ? 'text-green-600' : rate >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {rate}%
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "startedBy",
      label: "Sent By",
      render: (value, row) => (
        <Typography className="text-xs text-gray-600 dark:text-gray-400">
          {row.startedBy || "Admin"}
        </Typography>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (value, row) => {
        const { display, subtext, isRecent } = formatDateWithAgo(row.createdAt);
        return (
          <div>
            <Typography className="text-xs font-medium">{display}</Typography>
            <Typography className={`text-xs ${isRecent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
              {subtext}
            </Typography>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "",
      render: (value, row) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewDetails(row)}
          className="h-7 px-2"
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          <span className="text-xs">View</span>
        </Button>
      ),
    },
  ];

  const onPageChange = (page) => {
    setParams((prev) => ({
      ...prev,
      page: page + 1,
    }));
  };

  const perPage = params.per_page;
  const currentPage = params.page;
  const totalPages = Math.ceil(total / perPage);

  return (
    <CustomTable
      columns={columns}
      data={history}
      isLoading={isLoading}
      error={error}
      emptyStateMessage="No reminder history found"
      perPage={perPage}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  );
};

export default ReminderHistoryTable;

