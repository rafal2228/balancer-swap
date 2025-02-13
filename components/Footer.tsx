'use client';
import { Button } from '@/ui/button';
import { Dot, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function Footer() {
  const theme = useTheme();

  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-4 p-4">
      <span>
        Made with ❤ by{' '}
        <a
          className="underline underline-offset-4"
          href="https://github.com/rafal2228"
          target="_blank"
          rel="noreferrer noopener"
        >
          rafal2228
        </a>
      </span>

      <Dot className="hidden md:inline-block" />

      <Button
        variant="outline"
        onClick={() =>
          theme.setTheme(theme.resolvedTheme === 'dark' ? 'light' : 'dark')
        }
      >
        <Sun className="inline-block dark:hidden" />
        <Moon className="hidden dark:inline-block" />
        <span>{theme.resolvedTheme === 'dark' ? 'Dark' : 'Light'} theme</span>
      </Button>
    </div>
  );
}
