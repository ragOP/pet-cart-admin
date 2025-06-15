import * as React from "react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { data } from "@/utils/sidebar";
import { filterItemsByRole } from "@/utils/sidebar/filterItemsByRole";

import { useSelector } from "react-redux";
import {
  selectAdminEmail,
  selectAdminName,
  selectAdminRole,
} from "@/redux/admin/adminSelector";
import { useLocation } from "react-router";

export function AppSidebar({ ...props }) {
  const location = useLocation();
  const role = useSelector(selectAdminRole);
  const name = useSelector(selectAdminName);
  const email = useSelector(selectAdminEmail);

  const filteredNavMain = filterItemsByRole(data.navMain, role);
  const filteredMore = filterItemsByRole(data.more, role);
  const userInfo = {
    name,
    email,
    avatar: "/image.png",
  };
  const pathname = location.pathname;
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <img src="/logo-light.jpg" className="!size-10" />
                <span className="text-base font-semibold">Pet Caart</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain}  />
        <NavDocuments items={filteredMore} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo} />
      </SidebarFooter>
    </Sidebar>
  );
}
