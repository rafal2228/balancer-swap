import { Logo } from '@/components/Logo';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <div className="flex flex-row grow justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 self-center font-medium"
          >
            <Logo />
          </Link>

          <ConnectButton />
        </div>
      </div>
    </div>
  );
}
