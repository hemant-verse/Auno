import VerifyClient from '@/components/auth/VerifyClient';

export const metadata = {
  title: 'Check Your Email | Zuno',
  description: 'Verify your student email address to unlock your campus ecosystem.',
};

export default function VerifyPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat bg-[url('/images/mobile_bg.png')] md:bg-[url('/images/desktop_bg.png')] flex items-center justify-center">
      {/* Visual background overlay matching the core ecosystem theme */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] pointer-events-none" />
      
      <VerifyClient />
    </main>
  );
}