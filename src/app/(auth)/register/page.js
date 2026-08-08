// app/register/page.js
import RegisterClient from '@/components/auth/RegisterClient';

export const metadata = {
  title: 'Join the Community | Zuno',
  description: 'Create your distraction-free college community profile and match your vibe.',
};

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat bg-[url('/images/mobile_bg.png')] md:bg-[url('/images/desktop_bg.png')] flex items-center justify-center">
      {/* Subtle overlay matching the theme */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] pointer-events-none" />
      
      <RegisterClient />
    </main>
  );
}