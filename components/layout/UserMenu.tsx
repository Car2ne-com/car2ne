"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ChevronDown,
  LayoutDashboard,
  MessageCircle,
  Car,
  Ticket,
  Bell,
  User,
  CalendarDays,
  ClipboardCheck,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import LogoutButton from "./LogoutButton";

import { isBetaChecklistEnabled } from "@/lib/betaChecklist/config";

type UserMenuDict = {
  welcomeBack: string;
  accountLabel: string;
  dashboard: string;
  myChats: string;
  myRides: string;
  myBookings: string;
  myWatchlist: string;
  myProfile: string;
  betaChecklist: string;
  admin: string;
  logout: string;
};

type Props = {
  name: string;
  surname: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  dict: UserMenuDict;
};

export default function UserMenu({
  name,
  surname,
  avatarUrl,
  isAdmin,
  dict,
}: Props) {
  const displayName =
    `${name} ${surname}`.trim();

  const initials =
    `${name.charAt(0)}${surname.charAt(0)}`
      .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={displayName}
        className="
          flex
          h-10
          shrink-0
          items-center
          gap-2
          rounded-full
          border
          border-border
          bg-card
          pr-1
          pl-1
          shadow-sm
          transition
          hover:border-primary/40
          hover:shadow-md
          md:pr-3
        "
      >
        {/* Avatar */}

        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={40}
            height={40}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-accent"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {initials}
          </div>
        )}

        {/* Nome — solo su desktop, riga singola */}

        <span className="hidden max-w-[10ch] truncate text-sm font-semibold text-foreground md:inline">
          {name}
        </span>

        <ChevronDown className="hidden h-4 w-4 shrink-0 text-muted-foreground md:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex items-center gap-3">

              {/* Avatar dropdown */}

              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground">
                  {initials}
                </div>
              )}

              <div className="flex flex-col">
                <span className="font-semibold">
                  {displayName}
                </span>

                <span className="text-xs text-muted-foreground">
                  {dict.accountLabel}
                </span>
              </div>

            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Dashboard */}

        <DropdownMenuItem
          render={
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {dict.dashboard}
            </Link>
          }
        />

        {/* Le mie chat */}

        <DropdownMenuItem
          render={
            <Link href="/chat">
              <MessageCircle className="mr-2 h-4 w-4 text-primary" />
              {dict.myChats}
            </Link>
          }
        />

        {/* I miei passaggi */}

        <DropdownMenuItem
          render={
            <Link href="/dashboard/rides">
              <Car className="mr-2 h-4 w-4" />
              {dict.myRides}
            </Link>
          }
        />

        {/* Prenotazioni */}

        <DropdownMenuItem
          render={
            <Link href="/dashboard/bookings">
              <Ticket className="mr-2 h-4 w-4" />
              {dict.myBookings}
            </Link>
          }
        />

        {/* Eventi seguiti */}

        <DropdownMenuItem
          render={
            <Link href="/dashboard/watchlist">
              <Bell className="mr-2 h-4 w-4" />
              {dict.myWatchlist}
            </Link>
          }
        />

        {/* Profilo */}

        <DropdownMenuItem
          render={
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              {dict.myProfile}
            </Link>
          }
        />

        {/* Beta checklist */}

        {isBetaChecklistEnabled && (
          <DropdownMenuItem
            render={
              <Link href="/dashboard/beta-checklist">
                <ClipboardCheck className="mr-2 h-4 w-4 text-primary" />
                {dict.betaChecklist}
              </Link>
            }
          />
        )}

        {/* Admin */}

        {isAdmin && (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              render={
                <Link href="/admin/events">
                  <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                  {dict.admin}
                </Link>
              }
            />
          </>
        )}

        <DropdownMenuSeparator />

        <LogoutButton label={dict.logout} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}