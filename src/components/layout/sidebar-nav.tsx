
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
  Mail,
  Smile,
  FlaskConical,
  HelpCircle,
  MessageSquare,
  Leaf,
  ImageIcon,
  Newspaper, // Keep if other 'science news' might be added, or remove if truly unused
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
  { href: '/jokes', label: 'Jokes', icon: Smile },
  { href: '/science-facts', label: 'Science Facts', icon: FlaskConical },
  // { href: '/science-news', label: 'Science Highlights', icon: Newspaper }, // Removed this line
  { href: '/custom-quiz-generator', label: 'Custom Q-Generator', icon: HelpCircle },
  { href: '/query-handler', label: 'Query Handler', icon: MessageSquare },
  { href: '/jurassic-world', label: 'Jurassic World', icon: Leaf },
  { href: '/image-analysis', label: 'Image Analysis', icon: ImageIcon },
  { href: '/contact', label: 'Contact Us', icon: Mail },
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
