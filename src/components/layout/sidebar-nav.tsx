
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Cpu,
  BookOpenText,
  Timer,
  ListChecks,
  Gamepad2,
  CodeXml, 
  TerminalSquare,
  Mail, // Added Mail icon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedule', label: 'Schedule Planner', icon: CalendarDays },
  { href: '/notes', label: 'Note Repository', icon: FileText },
  { href: '/resources', label: 'Resource Suggester', icon: Cpu },
  { href: '/tips', label: 'Time Management Tips', icon: BookOpenText },
  { href: '/gaming', label: 'Gaming Zone', icon: Gamepad2 },
  { href: '/coding', label: 'Coding Zone', icon: CodeXml },
  { href: '/ide', label: 'IDE', icon: TerminalSquare },
  { href: '/contact', label: 'Contact Us', icon: Mail }, // New "Contact Us" item
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              className={cn(
                pathname === item.href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50',
                'w-full justify-start'
              )}
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
