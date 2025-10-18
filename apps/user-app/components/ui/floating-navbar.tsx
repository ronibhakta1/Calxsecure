"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./dropdown-menu";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { TextHoverEffect } from "./text-hover-effect";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {

    const { data: session, status } = useSession();
      const router = useRouter();
    
      const handleLogout = async () => {
        try {
          console.log("Attempting to sign out...");
          await signOut({ redirect: false }); // Prevent default redirect
          router.push("/auth/signup"); // Redirect to signup page
        } catch (error) {
          console.error("Logout failed:", error);
        }
      };
  function handleSignin() {
    window.location.href = "/api/auth/signin";
  }
  return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-black/80 bg-white/80 backdrop-blur-lg shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-2 pl-2  items-center justify-center space-x-4",
          className
        )}
      >
        <TextHoverEffect text="CalxSecure" />
        {navItems.map((navItem, idx) => (
          <a
            key={`link-${idx}`}
            href={navItem.link}
            className={cn(
              "relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-800"
            )}
          >
            {navItem.icon && <span className="block sm:hidden">{navItem.icon}</span>}
            <span className="hidden sm:block text-sm">{navItem.name}</span>
          </a>
        ))}

        { status === "unauthenticated" && (
          <button className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        onClick={handleSignin}>
            <span>Login</span>
            <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
          </button>
        )}
        { status === "authenticated" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer"> 
                  <AvatarImage src={session?.user?.image || "https://github.com/shadcn.png"} alt="@user" />
                  <AvatarFallback>{session?.user?.name?.[0] || "US"}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40 bg-white">
              <DropdownMenuItem className="flex items-center cursor-pointer p-2 bg-gray-200 hover:bg-gray-300 " onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>

          </DropdownMenu>
          
        )}
        
        
      </motion.div>
  );
};
