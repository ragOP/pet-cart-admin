"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CustomSpinner } from "@/components/loaders/CustomSpinner"
import { useTopSubcategories } from "@/hooks/use-stats"

const chartConfig = {
  totalSales: {
    label: "Total Sales",
    color: "var(--primary)",
  },
}

export function TopSubcategoriesChart() {
  const { data, isLoading: loading, isError } = useTopSubcategories()

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Top Subcategories</CardTitle>
          <CardDescription>Sales by subcategory</CardDescription>
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
          <CardTitle>Top Subcategories</CardTitle>
          <CardDescription>Sales by subcategory</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>Failed to load subcategory data</p>
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
          <CardTitle>Top Subcategories</CardTitle>
          <CardDescription>Sales by subcategory</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>No subcategory data available</p>
            <p className="text-sm">Data will appear when sales are recorded</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const topSubcategory = data[0]?.subCategoryName || "N/A"

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Top Subcategories</CardTitle>
        <CardDescription>Sales by subcategory</CardDescription>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">
            {topSubcategory}
          </div>
          <div className="text-sm text-muted-foreground">Top performing subcategory</div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 4, right: 8, top: 4, bottom: 4 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="subCategoryName" 
              width={120} 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <Bar 
              dataKey="totalSales" 
              fill="var(--color-totalSales)" 
              radius={[0, 4, 4, 0]}
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, "Sales"]}
                  indicator="dot"
                />
              }
            />
          </BarChart>
        </ChartContainer>
        <div className="mt-4 space-y-2 text-sm">
          {data.map((item, i) => (
            <div key={item.subCategoryId} className="flex items-center justify-between gap-2">
              <span className="truncate">#{i + 1} {item.subCategoryName}</span>
              <span className="font-mono">₹{item.totalSales.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
