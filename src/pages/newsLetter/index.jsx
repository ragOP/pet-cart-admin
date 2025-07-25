import React from "react";
import { useQuery } from "@tanstack/react-query";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { fetchSubscribers } from "./fetchSubscribers";

const columns = [
  {
    key: "name",
    label: "Name",
    render: (value) => (
      <Typography variant="p" className="font-medium">
        {value || "No Name Provided"}
      </Typography>
    ),
  },
  {
    key: "email",
    label: "Email",
    render: (value) => (
      <Typography variant="p" className="text-gray-600">
        {value || "No Email Provided"}
      </Typography>
    ),
  },
  {
    key: "isActive",
    label: "Active",
    render: (value) => (
      <span className={value ? "text-green-600" : "text-red-500"}>
        {value ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Subscribed On",
    render: (value) => (
      <Typography variant="p">
        {value ? new Date(value).toLocaleDateString() : "N/A"}
      </Typography>
    ),
  },
];

const NewsLetter = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: () => fetchSubscribers(),
  });

  return (
    <div className="p-4 mt-6">
      <h1 className="text-2xl font-bold">News Letter Subscribers</h1>
      <div className="text-sm text-gray-500 mb-4">
        Details of people who have subscribed to the News Letter
      </div>
      <CustomTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        error={error}
        emptyStateMessage="No subscribers found."
      />
    </div>
  );
};

export default NewsLetter;
