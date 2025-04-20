"use client";

import * as React from "react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbResponsiveProps {
  items: BreadcrumbItem[];
  itemsToDisplay?: number;
  ellipsisText?: string;
  drawerTitle?: string;
  drawerDescription?: string;
  closeButtonText?: string;
}

export function BreadcrumbResponsive({
  items = [],
  itemsToDisplay = 3,
  ellipsisText = "...",
  drawerTitle = "Navegar a",
  drawerDescription = "Selecciona una página para navegar.",
  closeButtonText = "Cerrar",
}: BreadcrumbResponsiveProps) {
  const [open, setOpen] = React.useState(false);

  if (!items || items.length === 0) {
    return null;
  }

  const displayedItems =
    items.length <= itemsToDisplay
      ? items
      : [items[0], ...items.slice(-itemsToDisplay + 1)];
  const hiddenItems =
    items.length > itemsToDisplay ? items.slice(1, -itemsToDisplay + 1) : [];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {displayedItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink
                  asChild
                  className="max-w-[100px] truncate md:max-w-none"
                >
                  <Link className="hover:text-orange" href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="max-w-[100px] truncate md:max-w-none">
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index === 0 && hiddenItems.length > 0 && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <div className="hidden md:block">
                    <DropdownMenu open={open} onOpenChange={setOpen}>
                      <DropdownMenuTrigger
                        className="flex items-center gap-1"
                        aria-label={`Mostrar ${hiddenItems.length} elementos ocultos`}
                      >
                        <BreadcrumbEllipsis className="h-4 w-4" />
                        <span className="sr-only">{ellipsisText}</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {hiddenItems.map((item, index) => (
                          <DropdownMenuItem key={index}>
                            <Link href={item.href ?? "#"} className="hover:text-orange w-full">
                              {item.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="md:hidden">
                    <Drawer open={open} onOpenChange={setOpen}>
                      <DrawerTrigger
                        aria-label={`Mostrar ${hiddenItems.length} elementos ocultos`}
                      >
                        <BreadcrumbEllipsis className="h-4 w-4" />
                        <span className="sr-only">{ellipsisText}</span>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader className="text-left">
                          <DrawerTitle>{drawerTitle}</DrawerTitle>
                          <DrawerDescription>
                            {drawerDescription}
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="grid gap-1 px-4">
                          {hiddenItems.map((item, index) => (
                            <Link
                              key={index}
                              href={item.href ?? "#"}
                              className="hover:text-orange py-1 text-sm"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                        <DrawerFooter className="pt-4">
                          <DrawerClose asChild>
                            <Button variant="outline">{closeButtonText}</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  </div>
                </BreadcrumbItem>
              </>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
