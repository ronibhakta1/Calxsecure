"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {  Home, LogOut, Repeat, Send, User, Wallet } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// SidebarItem component
function SidebarItem({
  href,
  icon,
  title,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start px-4 py-2 text-left hover:bg-zinc-600 text-zinc-100"
      asChild
    >
      <a href={href}>
        {icon}
        <span className="ml-2">{title}</span>
      </a>
    </Button>
  );
}

// Icons
function HomeIcon() {
  return <Home className="w-6 h-6" />;
}

function TransferIcon() {
  return <Send className="w-6 h-6" />;
}

function P2PIcon() {
  return <Repeat className="w-6 h-6" />;
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log("Attempting to sign out...");
      await signOut({ redirect: false }); // Prevent default redirect
      console.log("Sign out successful, redirecting to /auth/signup");
      router.push("/auth/signup"); // Redirect to signup page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex bg-zinc-800 text-zinc-100 h-screen">
        {/* Sidebar */}
        <aside className="w-72 border-r border-slate-200 flex flex-col">
          <nav className="mt-6 flex-1">
            <SidebarItem href="/dashboard" icon={<HomeIcon />} title="Home" />
            <SidebarItem href="/transfer" icon={<TransferIcon />} title="Transfer" />
            <SidebarItem href="/p2p" icon={<P2PIcon />} title="P2P Transfer" />
          </nav>
          <div className="p-4">
            <Separator className="mb-4" />
            <div className="flex items-center">
              <Avatar>
                <AvatarImage src={session?.user?.image || "https://github.com/shadcn.png"} alt="@user" />
                <AvatarFallback>{session?.user?.name?.[0] || "US"}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium">{session?.user?.name || "Nasir Nadaf"}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email || "nasir@gmail.com"}</p>
              </div>
              {status === "authenticated" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="ml-auto"
                      size="icon"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Log Out</TooltipContent>
                </Tooltip>
              )}
              {status === "unauthenticated" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="ml-auto"
                      size="icon"
                      onClick={() => signIn()}
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sign In</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto  ">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}