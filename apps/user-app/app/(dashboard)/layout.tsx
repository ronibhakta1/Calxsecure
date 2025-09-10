import { Bell, CreditCard, Home, LogOut, Send, Settings, User, Wallet } from 'lucide-react';
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
      className="w-full justify-start px-4 py-2 text-left"
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

function TransactionsIcon() {
  return <Wallet className="w-6 h-6" />;
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
          <nav className="mt-6 flex-1">
            <SidebarItem href="/dashboard" icon={<HomeIcon />} title="Home" />
            <SidebarItem href="/transfer" icon={<TransferIcon />} title="Transfer" />
            <SidebarItem href="/transactions" icon={<TransactionsIcon />} title="Transactions" />
            <SidebarItem href="/cards" icon={<CreditCard className="w-6 h-6" />} title="Cards" />
            <SidebarItem href="/settings" icon={<Settings className="w-6 h-6" />} title="Settings" />
          </nav>
          <div className="p-4">
            <Separator className="mb-4" />
            <div className="flex items-center">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium">Nasir Nadaf</p>
                <p className="text-xs text-muted-foreground">nasir@gmail.com</p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="ml-auto" size="icon">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Log Out</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}