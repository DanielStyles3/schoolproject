"use client";

import BrandLockup from "@/components/global/BrandLockup";
import { SidebarMenu, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

/**
 * Sidebar brand block: college lockup over the active academic session.
 * Collapsed rail shows the crest alone.
 */
export function BrandHeader({ yearName }: { yearName: string }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {collapsed ? (
          <div className="flex justify-center py-1">
            <img
              src="/yabatech-crest.png"
              alt="YABATECH crest"
              width={49}
              height={50}
              className="h-7 w-7 shrink-0 object-contain"
            />
          </div>
        ) : (
          <div className="space-y-3 px-1 py-1.5">
            <BrandLockup tone="light" size="sm" compact />
            <div className="rounded-md bg-white/10 px-2.5 py-1.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/55">
                Session
              </p>
              <p className="truncate text-xs font-semibold text-white">
                {yearName || "Not set"}
              </p>
            </div>
          </div>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
