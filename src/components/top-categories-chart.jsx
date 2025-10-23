"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CustomSpinner } from "@/components/loaders/CustomSpinner"
import { useTopCategories } from "@/hooks/use-stats"

const pieColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]

const chartConfig = {
  totalSales: {
    label: "Total Sales",
    color: "var(--primary)",
  },
}

export function TopCategoriesChart() {
  const { data, isLoading: loading, isError } = useTopCategories()

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
          <CardDescription>Sales by category</CardDescription>
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
          <CardTitle>Top Categories</CardTitle>
          <CardDescription>Sales by category</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>Failed to load category data</p>
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
          <CardTitle>Top Categories</CardTitle>
          <CardDescription>Sales by category</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>No category data available</p>
            <p className="text-sm">Data will appear when sales are recorded</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate total sales for percentage calculation
  const totalSales = data.reduce((sum, item) => sum + item.totalSales, 0)
  const topCategory = data[0]?.categoryName || "N/A"

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Top Categories</CardTitle>
        <CardDescription>Sales by category</CardDescription>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">
            {topCategory}
          </div>
          <div className="text-sm text-muted-foreground">Top performing category</div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
          <PieChart>
            <Pie 
              data={data} 
              dataKey="totalSales" 
              nameKey="categoryName" 
              innerRadius={40} 
              outerRadius={80} 
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={pieColors[i % pieColors.length]} />
              ))}
            </Pie>
            <ChartTooltip 
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    `₹${value.toLocaleString('en-IN')}`, 
                    name
                  ]}
                  indicator="dot"
                />
              }
            />
          </PieChart>
        </ChartContainer>
        <div className="mt-4 space-y-2 text-sm">
          {data.map((item, i) => {
            const percentage = ((item.totalSales / totalSales) * 100).toFixed(1)
            return (
              <div key={item.categoryId} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: pieColors[i % pieColors.length] }} 
                  />
                  <span className="truncate">{item.categoryName}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">₹{item.totalSales.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-muted-foreground">{percentage}%</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
