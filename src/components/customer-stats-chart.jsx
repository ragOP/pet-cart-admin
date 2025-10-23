"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CustomSpinner } from "@/components/loaders/CustomSpinner"
import { useCustomerStats } from "@/hooks/use-stats"

const chartConfig = {
  totalCustomers: {
    label: "Total Customers",
    color: "var(--primary)",
  },
}

export function CustomerStatsChart() {
  const isMobile = useIsMobile()
  const { data, isLoading: loading, isError } = useCustomerStats()

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Customer Growth</CardTitle>
          <CardDescription>Weekly new customer registrations</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <CustomSpinner />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Customer Growth</CardTitle>
          <CardDescription>Weekly new customer registrations</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>Failed to load customer data</p>
            <p className="text-sm">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.length) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Customer Growth</CardTitle>
          <CardDescription>Weekly new customer registrations</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>No customer data available</p>
            <p className="text-sm">Data will appear when customers register</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate total customers for display
  const totalCustomers = data.reduce((sum, item) => sum + item.totalCustomers, 0)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Customer Growth</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Weekly new customer registrations for current month
          </span>
          <span className="@[540px]/card:hidden">New customers this month</span>
        </CardDescription>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">
            {totalCustomers.toLocaleString('en-IN')}
          </div>
          <div className="text-sm text-muted-foreground">New customers</div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toLocaleString('en-IN')}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 1}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Week ${value}`}
                  formatter={(value) => [`${value.toLocaleString('en-IN')}`, "Customers"]}
                  indicator="dot"
                />
              }
            />
            <Bar
              dataKey="totalCustomers"
              fill="var(--color-totalCustomers)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
