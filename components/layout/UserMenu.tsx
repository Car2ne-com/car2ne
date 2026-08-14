"use client";

import Link from "next/link";

import {
  ChevronDown,
  LayoutDashboard,
  MessageCircle,
  Car,
  Ticket,
  User,
  CalendarDays,
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

type Props = {
  name: string;
  surname: string;
  avatarUrl: string | null;
  isAdmin: boolean;
};

export default function UserMenu({
  name,
  surname,
  avatarUrl,
  isAdmin,
}: Props) {
  const displayName =
    `${name} ${surname}`.trim();

  const initials =
    `${name.charAt(0)}${surname.charAt(0)}`
      .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="
          flex
          shrink-0
          items-center
          gap-2
          rounded-2xl
          border
          border-slate-200
          bg-white
          px-2
          py-1.5
          shadow-sm
          transition
          hover:border-emerald-300
          hover:shadow-md
          sm:gap-3
          sm:px-3
          sm:py-2
          md:px-4
        "
      >
        {/* Avatar */}

        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="
              h-9
              w-9
              rounded-full
              object-cover
              ring-2
              ring-emerald-50
              sm:h-11
              sm:w-11
            "
          />
        ) : (
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-emerald-100
              text-sm
              font-bold
              text-emerald-600
              sm:h-11
              sm:w-11
              sm:text-lg
            "
          >
            {initials}
          </div>
        )}

        {/* Nome */}

        <div className="text-left">
          <p className="text-[10px] text-slate-500 sm:text-xs">
            Bentornato
          </p>

          <p className="max-w-[80px] truncate text-sm font-semibold text-slate-900 sm:max-w-none sm:text-base">
            {name}
          </p>
        </div>

        <ChevronDown
          className="
            h-3.5
            w-3.5
            shrink-0
            text-slate-500
            sm:h-4
            sm:w-4
          "
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex items-center gap-3">

              {/* Avatar dropdown */}

              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-600">
                  {initials}
                </div>
              )}

              <div className="flex flex-col">
                <span className="font-semibold">
                  {displayName}
                </span>

                <span className="text-xs text-slate-500">
                  Account Car2ne
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
              Dashboard
            </Link>
          }
        />

        {/* Le mie chat */}

        <DropdownMenuItem
          render={
            <Link href="/chat">
              <MessageCircle className="mr-2 h-4 w-4 text-emerald-600" />
              Le mie chat
            </Link>
          }
        />

        {/* I miei passaggi */}

        <DropdownMenuItem
          render={
            <Link href="/dashboard/rides">
              <Car className="mr-2 h-4 w-4" />
              I miei passaggi
            </Link>
          }
        />

        {/* Prenotazioni */}

        <DropdownMenuItem
          render={
            <Link href="/dashboard/bookings">
              <Ticket className="mr-2 h-4 w-4" />
              Le mie prenotazioni
            </Link>
          }
        />

        {/* Profilo */}

        <DropdownMenuItem
          render={
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Il mio profilo
            </Link>
          }
        />

        {/* Admin */}

        {isAdmin && (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              render={
                <Link href="/admin/events">
                  <CalendarDays className="mr-2 h-4 w-4 text-emerald-600" />
                  Admin
                </Link>
              }
            />
          </>
        )}

        <DropdownMenuSeparator />

        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}