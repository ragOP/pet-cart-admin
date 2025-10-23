import { AppSidebar } from "../../components/app-sidebar"
import { ChartAreaInteractive } from "../../components/chart-area-interactive"
import { DataTable } from "../../components/data-table"
import { SectionCards } from "../../components/section-cards"
import { SiteHeader } from "../../components/site-header"
import { MonthlySalesChart } from "../../components/monthly-sales-chart"
import { CustomerStatsChart } from "../../components/customer-stats-chart"
import { TopCategoriesChart } from "../../components/top-categories-chart"
import { TopSubcategoriesChart } from "../../components/top-subcategories-chart"
import { TopProductsChart } from "../../components/top-products-chart"
import { TotalSalesChart } from "../../components/total-sales-chart"
import {
  SidebarInset,
  SidebarProvider,
} from "../../components/ui/sidebar"
import { CustomSpinner } from "@/components/loaders/CustomSpinner"

export default function Page() {
  return (
    // <SidebarProvider
    //   style={
    //     {
    //       "--sidebar-width": "calc(var(--spacing) * 72)",
    //       "--header-height": "calc(var(--spacing) * 12)",
    //     } 
    //   }
    // >
    //   <AppSidebar variant="inset" />
    //   <SidebarInset>
    <>

      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Section Cards - Commented out */}
            {/* <SectionCards /> */}
            
            {/* Monthly Sales and Customer Growth */}
            <div className="px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MonthlySalesChart />
              <CustomerStatsChart />
            </div>

            {/* Total Sales Trend */}
            <div className="px-4 lg:px-6">
              <TotalSalesChart />
            </div>

            {/* Top Categories and Subcategories */}
            <div className="px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TopCategoriesChart />
              <TopSubcategoriesChart />
            </div>

            {/* Top Products */}
            <div className="px-4 lg:px-6">
              <TopProductsChart />
            </div>
            {/* <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div> */}
            {/* {data ? (
                <div className="px-4 lg:px-6">
                  <DataTable data={data} loading={loading} />
                </div>
              ) : (
                <>
                <CustomSpinner />
                </>
              )} */}
          </div>
        </div>
      </div>
    </>
    //   </SidebarInset>
    // </SidebarProvider>
  )
}
