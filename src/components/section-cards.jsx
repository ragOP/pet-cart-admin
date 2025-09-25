import * as React from "react"
import { 
  TrendingDown as IconTrendingDown, 
  TrendingUp as IconTrendingUp 
} from 'lucide-react';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis, LabelList } from 'recharts'

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

const sparkData = [
  { label: "W1", value: 120 },
  { label: "W2", value: 180 },
  { label: "W3", value: 160 },
  { label: "W4", value: 220 },
  { label: "W5", value: 260 },
  { label: "W6", value: 300 },
]

const customersData = [
  { label: "W1", value: 40 },
  { label: "W2", value: 32 },
  { label: "W3", value: 28 },
  { label: "W4", value: 36 },
  { label: "W5", value: 30 },
  { label: "W6", value: 24 },
]

const growthData = [
  { label: "M1", value: 1.2 },
  { label: "M2", value: 1.6 },
  { label: "M3", value: 2.1 },
  { label: "M4", value: 2.6 },
  { label: "M5", value: 3.1 },
  { label: "M6", value: 3.8 },
]

// visitorsSeries is generated dynamically based on selected range

const pieColors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"]

const topCategory = [
  { name: "Food", value: 35 },
  { name: "Toys", value: 22 },
  { name: "Care", value: 18 },
  { name: "Accessories", value: 15 },
  { name: "Health", value: 10 },
]

const topSubCategory = [
  { name: "Dry Food", value: 30 },
  { name: "Wet Food", value: 22 },
  { name: "Chew", value: 18 },
  { name: "Grooming", value: 16 },
  { name: "Vitamins", value: 14 },
]

const topProducts = [
  { name: "Kibble X", units: 320, revenue: 12800 },
  { name: "Shampoo A", units: 210, revenue: 6300 },
  { name: "Chew Z", units: 180, revenue: 3600 },
  { name: "Leash Pro", units: 160, revenue: 5600 },
  { name: "Vitamix", units: 140, revenue: 7000 },
]

const chartConfig = {
  value: { label: "Value", color: "var(--primary)" },
  desktop: { label: "Desktop", color: "var(--primary)" },
  mobile: { label: "Mobile", color: "var(--primary)" },
}

export function SectionCards() {
  const [revenueRange, setRevenueRange] = React.useState("1m")
  const [visitorsRange, setVisitorsRange] = React.useState("1m")

  function generateRevenueSeries(range) {
    const points = range === "1d" ? 24 : range === "1w" ? 7 : range === "1m" ? 30 : 12
    const labelsPrefix = range === "1y" ? "M" : range === "1d" ? "H" : "D"
    const data = []
    for (let i = 1; i <= points; i++) {
      const seasonal = Math.sin(i / (points / 3))
      const baseline = range === "1y" ? 8000 : range === "1m" ? 400 : range === "1w" ? 90 : 12
      const noise = (i % 5) * (range === "1y" ? 200 : range === "1m" ? 8 : range === "1w" ? 3 : 0.6)
      data.push({ label: `${labelsPrefix}${i}`, value: Math.round(baseline + seasonal * baseline * 0.15 + noise) })
    }
    return data
  }

  function generateVisitorsSeries(range) {
    const points = range === "1d" ? 24 : range === "1w" ? 7 : range === "1m" ? 30 : 12
    const labelsPrefix = range === "1y" ? "M" : range === "1d" ? "H" : "D"
    const data = []
    for (let i = 1; i <= points; i++) {
      const seasonal = Math.cos(i / (points / 4))
      const desktop = Math.round(100 + seasonal * 40 + (i % 3) * 6)
      const mobile = Math.round(80 + seasonal * 35 + (i % 4) * 5)
      data.push({ date: `${labelsPrefix}${i}`, desktop, mobile })
    }
    return data
  }

  const revenueData = React.useMemo(() => generateRevenueSeries(revenueRange), [revenueRange])
  const visitorsSeries = React.useMemo(() => generateVisitorsSeries(visitorsRange), [visitorsRange])
  return (
    (<>
      <div
      className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3">
      {/* Total Sales */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Sales</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $124,500
          </CardTitle>
          <CardAction>
            <Badge variant="outline"><IconTrendingUp />+8.2%</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-20 w-full">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" hide />
              <Area dataKey="value" type="natural" fill="url(#fillSales)" stroke="var(--color-value)" />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Trending up this month <IconTrendingUp className="size-4" /></div>
          <div className="text-muted-foreground">Weekly sales over last 6 weeks</div>
        </CardFooter>
      </Card>

      {/* New Customers */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">1,234</CardTitle>
          <CardAction>
            <Badge variant="outline"><IconTrendingDown />-4.1%</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-20 w-full">
            <BarChart data={customersData}>
              <XAxis dataKey="label" hide />
              <Bar dataKey="value" fill="var(--color-value)" radius={[3,3,0,0]} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Slight dip this period <IconTrendingDown className="size-4" /></div>
          <div className="text-muted-foreground">New signups by week</div>
        </CardFooter>
      </Card>

      {/* Growth Rate */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">4.5%</CardTitle>
          <CardAction>
            <Badge variant="outline"><IconTrendingUp />+0.6%</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-20 w-full">
            <LineChart data={growthData}>
              <XAxis dataKey="label" hide />
              <Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={false} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Steady increase <IconTrendingUp className="size-4" /></div>
          <div className="text-muted-foreground">MoM compounded rate</div>
        </CardFooter>
      </Card>


      {/* Top Selling Category */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Top 5 Categories</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">Food</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-auto h-40 w-full">
            <PieChart>
              <Pie data={topCategory} dataKey="value" nameKey="name" innerRadius={34} outerRadius={54} paddingAngle={2}>
                {topCategory.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            </PieChart>
          </ChartContainer>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {topCategory.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">Share of sales by category</CardFooter>
      </Card>

      {/* Top Selling Subcategory */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Top 5 Subcategories</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">Dry Food</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-auto h-40 w-full">
            <PieChart>
              <Pie data={topSubCategory} dataKey="value" nameKey="name" innerRadius={34} outerRadius={54} paddingAngle={2}>
                {topSubCategory.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            </PieChart>
          </ChartContainer>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {topSubCategory.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">Share within top category</CardFooter>
      </Card>

      {/* Top Selling Product */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Top Selling Product</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">Kibble X</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-auto h-44 w-full">
            <BarChart data={topProducts} layout="vertical" margin={{ left: 4, right: 8, top: 4, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={100} tickLine={false} axisLine={false} />
              <Bar dataKey="units" fill="var(--color-value)" radius={[0,4,4,0]}
              >
                <LabelList dataKey="units" position="right" className="text-[10px]" />
              </Bar>
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            </BarChart>
          </ChartContainer>
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between gap-2">
                <span className="truncate">#{i + 1} {p.name}</span>
                <span className="font-mono">{p.units}u · ${p.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">Top 5 products · units and revenue</CardFooter>
      </Card>

      </div>

      {/* Standalone: Total Revenue */}
      <div className="px-4 lg:px-6 mt-2">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Last 6 weeks trend</CardDescription>
            <CardAction className="flex items-center gap-2">
              <ToggleGroup type="single" value={revenueRange} onValueChange={(v)=> v && setRevenueRange(v)} variant="outline" className="hidden @[767px]/card:flex *:data-[slot=toggle-group-item]:!px-3">
                <ToggleGroupItem value="1d">1D</ToggleGroupItem>
                <ToggleGroupItem value="1w">1W</ToggleGroupItem>
                <ToggleGroupItem value="1m">1M</ToggleGroupItem>
                <ToggleGroupItem value="1y">1Y</ToggleGroupItem>
              </ToggleGroup>
              <Badge variant="outline"><IconTrendingUp />+12.5%</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="fillRevenueLarge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" />
                <Area dataKey="value" type="natural" fill="url(#fillRevenueLarge)" stroke="var(--color-value)" />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Standalone: Visitors */}
      <div className="px-4 lg:px-6 mt-2">
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>Visitors</CardTitle>
            <CardDescription>Desktop vs Mobile (last 6 days)</CardDescription>
            <CardAction className="flex items-center gap-2">
              <ToggleGroup type="single" value={visitorsRange} onValueChange={(v)=> v && setVisitorsRange(v)} variant="outline" className="hidden @[767px]/card:flex *:data-[slot=toggle-group-item]:!px-3">
                <ToggleGroupItem value="1d">1D</ToggleGroupItem>
                <ToggleGroupItem value="1w">1W</ToggleGroupItem>
                <ToggleGroupItem value="1m">1M</ToggleGroupItem>
                <ToggleGroupItem value="1y">1Y</ToggleGroupItem>
              </ToggleGroup>
              <Badge variant="outline"><IconTrendingUp />+12.5%</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
              <AreaChart data={visitorsSeries}>
                <defs>
                  <linearGradient id="fillDesktopStandalone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillMobileStandalone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <Area dataKey="mobile" type="natural" fill="url(#fillMobileStandalone)" stroke="var(--color-mobile)" stackId="a" />
                <Area dataKey="desktop" type="natural" fill="url(#fillDesktopStandalone)" stroke="var(--color-desktop)" stackId="a" />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>)
  );
}
