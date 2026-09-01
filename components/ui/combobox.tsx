"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"

import { cn } from "@/lib/utils"

function Combobox<Value, Multiple extends boolean | undefined = false>({
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple>) {
  return <ComboboxPrimitive.Root data-slot="combobox" {...props} />
}

function ComboboxPortal({ ...props }: ComboboxPrimitive.Portal.Props) {
  return <ComboboxPrimitive.Portal data-slot="combobox-portal" {...props} />
}

function ComboboxPositioner({
  align = "start",
  sideOffset = 8,
  className,
  ...props
}: ComboboxPrimitive.Positioner.Props) {
  return (
    <ComboboxPrimitive.Positioner
      data-slot="combobox-positioner"
      className={cn("isolate z-50 outline-none", className)}
      align={align}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function ComboboxPopup({ className, ...props }: ComboboxPrimitive.Popup.Props) {
  return (
    <ComboboxPrimitive.Popup
      data-slot="combobox-popup"
      className={cn(
        "z-50 w-(--anchor-width) overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className
      )}
      {...props}
    />
  )
}

function ComboboxInputGroup({
  className,
  ...props
}: ComboboxPrimitive.InputGroup.Props) {
  return (
    <ComboboxPrimitive.InputGroup
      data-slot="combobox-input-group"
      className={cn("relative", className)}
      {...props}
    />
  )
}

function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn("max-h-64 overflow-auto py-2 outline-none", className)}
      {...props}
    />
  )
}

function ComboboxItem({ className, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "flex w-full cursor-default items-center justify-between gap-3 px-4 py-2.5 text-left text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function ComboboxItemIndicator({
  className,
  ...props
}: ComboboxPrimitive.ItemIndicator.Props) {
  return (
    <ComboboxPrimitive.ItemIndicator
      data-slot="combobox-item-indicator"
      className={cn("flex items-center justify-center text-primary", className)}
      {...props}
    />
  )
}

function ComboboxTrigger({
  className,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border bg-background text-sm font-medium whitespace-nowrap outline-none select-none transition-all hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export {
  Combobox,
  ComboboxPortal,
  ComboboxPositioner,
  ComboboxPopup,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxTrigger,
}
