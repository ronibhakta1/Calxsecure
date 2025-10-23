"use client";
import { useSession } from "next-auth/react";
import { BrickWallFire, Home, LayoutDashboard, Repeat, Send,} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../components/ui/avatar';
import {  TooltipProvider, } from '../../components/ui/tooltip';
import { Sidebar, SidebarBody, SidebarLink, SignupBtn } from '../../components/ui/sidebar';

// Your Links Interface
interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

const sidebarLinks: Links[] = [
  { label: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Transfer", href: "/transfer", icon: <Send className="w-5 h-5" /> },
  { label: "P2P Transfer", href: "/p2p", icon: <Repeat className="w-5 h-5" /> },
  { label: "Bills", href: "/bills", icon: <BrickWallFire className="w-5 h-5" /> },
];

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const { data: session } = useSession();
  return (
    <TooltipProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarBody className="h-screen bg-zinc-800 flex flex-col ">
            <nav className="flex flex-col  gap-2 flex-1">
              {sidebarLinks.map((link) => (
                <SidebarLink key={link.href} link={link} />
              ))}
            </nav>

            <div className=" border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 ">
                  <AvatarImage src={session?.user?.image ?? undefined} alt="@user" />
                  <AvatarFallback>{session?.user?.name?.[0] || "US"}</AvatarFallback>
                </Avatar>
                
                <div className="min-w-0 flex-1 ">
                  <p className="text-sm font-medium truncate  text-zinc-100 dark:text-white">
                    {session?.user?.name || "Nasir Nadaf"}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {session?.user?.email || "nasir@gmail.com"}
                  </p>
                </div>

                {/* LOGOUT/SIGNIN */}
                <SignupBtn />
              </div>
            </div>
          </SidebarBody>
        </Sidebar>

        <main className="flex-1 overflow-y-auto bg-zinc-700 dark:bg-neutral-100 ">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}