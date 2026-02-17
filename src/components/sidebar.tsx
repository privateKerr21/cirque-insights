"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Sparkles,
  FileText,
  LogOut,
} from "lucide-react";

const links = [
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/generate", label: "Generate", icon: Sparkles },
  { href: "/drafts", label: "Drafts", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col z-30">
      <div className="p-6 flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Cirque"
          width={40}
          height={40}
          className="rounded-xl invert"
        />
        <div>
          <h1 className="font-bold text-lg text-white">Cirque</h1>
          <p className="text-xs text-slate-500">@cirqueoutside</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
