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
import { useTopProducts } from "@/hooks/use-stats"

const chartConfig = {
  totalStockSold: {
    label: "Units Sold",
    color: "var(--primary)",
  },
}

export function TopProductsChart() {
  const { data, isLoading: loading, isError } = useTopProducts()

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Units sold by product</CardDescription>
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
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Units sold by product</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>Failed to load product data</p>
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
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Units sold by product</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <p>No product data available</p>
            <p className="text-sm">Data will appear when products are sold</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalUnitsSold = data.reduce((sum, item) => sum + item.totalStockSold, 0)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Units sold by product</CardDescription>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums">
            {totalUnitsSold.toLocaleString('en-IN')}
          </div>
          <div className="text-sm text-muted-foreground">Total units sold</div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 4, right: 8, top: 4, bottom: 4 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="productName" 
              width={200} 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => value.length > 30 ? value.substring(0, 30) + "..." : value}
            />
            <Bar 
              dataKey="totalStockSold" 
              fill="var(--color-totalStockSold)" 
              radius={[0, 4, 4, 0]}
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent
                  formatter={(value) => [`${value} units`, "Sold"]}
                  indicator="dot"
                />
              }
            />
          </BarChart>
        </ChartContainer>
        <div className="mt-4 space-y-2 text-xs">
          {data.map((item, i) => (
            <div key={item.productId} className="flex items-center justify-between gap-2">
              <span className="truncate">#{i + 1} {item.productName.length > 40 ? item.productName.substring(0, 40) + "..." : item.productName}</span>
              <span className="font-mono">{item.totalStockSold}u</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
