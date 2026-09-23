'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LayoutDashboard, Terminal, Trophy, Settings, LogIn, LogOut } from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const pathname = usePathname();
  const currentTeam = useChallengeStore((state) => state.currentTeam);
  const currentUser = useChallengeStore((state) => state.currentUser);

  const navItems = [
    { href: '/', label: 'Briefing', icon: Shield },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/challenges', label: 'Challenges', icon: Terminal },
    { href: '/scoreboard', label: 'Scoreboard', icon: Trophy },
    { href: '/admin', label: 'Command Center', icon: Settings },
  ];

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8">
        <div className="mr-8 flex items-center space-x-2">
          <Shield className="h-6 w-6 text-[#00629B] dark:text-[#00B4D8]" />
          <span className="font-bold tracking-wider uppercase text-sm md:text-base hidden sm:inline-block">
            IEEE CyberOps <span className="text-[#00629B] dark:text-[#00B4D8]">UD × UR</span>
          </span>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`transition-colors hover:text-foreground/80 flex items-center gap-2 ${
                      pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                    }`}
                  >
                    <Icon className="h-4 w-4 hidden md:block" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentTeam ? (
              <Badge variant="outline" className="border-[#00B4D8] text-[#00B4D8] bg-[#00B4D8]/10 hidden sm:flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {currentTeam.name}
              </Badge>
            ) : currentUser ? (
              <Badge variant="outline" className="hidden sm:flex">
                {currentUser.name} (No Team)
              </Badge>
            ) : null}
            
            {(!currentUser || !currentTeam) ? (
              <Link href="/auth">
                <Button variant="default" size="sm" className="bg-[#00629B] hover:bg-[#00629B]/90 text-white">
                  <LogIn className="w-4 h-4 mr-2 hidden sm:block" />
                  Join
                </Button>
              </Link>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                onClick={() => {
                  useChallengeStore.getState().logoutUser();
                  window.location.href = '/';
                }}
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline-block">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
