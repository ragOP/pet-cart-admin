"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
import { useMonthlyStats } from "@/hooks/use-stats"

const chartConfig = {
  totalSales: {
    label: "Total Sales",
    color: "var(--primary)",
  },
}

export function MonthlySalesChart() {
  const isMobile = useIsMobile()
  const { data, isLoading: loading, isError } = useMonthlyStats()

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Monthly Sales</CardTitle>
          <CardDescription>Weekly sales breakdown for current month</CardDescription>
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
          <CardTitle>Monthly Sales</CardTitle>
          <CardDescription>Weekly sales breakdown for current month</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>Failed to load sales data</p>
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
          <CardTitle>Monthly Sales</CardTitle>
          <CardDescription>Weekly sales breakdown for current month</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>No sales data available</p>
            <p className="text-sm">Data will appear when sales are recorded</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate total sales for display
  const totalSales = data.reduce((sum, item) => sum + item.totalSales, 0)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Monthly Sales</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Weekly sales breakdown for current month
          </span>
          <span className="@[540px]/card:hidden">Current month sales</span>
        </CardDescription>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">
            ₹{totalSales.toLocaleString('en-IN')}
          </div>
          <div className="text-sm text-muted-foreground">Total this month</div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-totalSales)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-totalSales)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 1}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Week ${value}`}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, "Sales"]}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="totalSales"
              type="natural"
              fill="url(#fillSales)"
              stroke="var(--color-totalSales)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
