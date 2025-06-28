import { useEffect, useState } from "react"
import { AppSidebar } from "../../components/app-sidebar"
import { ChartAreaInteractive } from "../../components/chart-area-interactive"
import { DataTable } from "../../components/data-table"
import { SectionCards } from "../../components/section-cards"
import { SiteHeader } from "../../components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "../../components/ui/sidebar"
import { CustomSpinner } from "@/components/loaders/CustomSpinner"

export default function Page() {
  // const [data, setData] = useState(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   fetch('./data.json')
  //     .then(res => res.json())
  //     .then(setData);

  //   setLoading(false);
  // })
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
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
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
