import ForgotPasswordClient from '@/components/auth/ForgotPasswordClient';
import Background from '@/components/Background';

export const metadata = {
  title: 'Reset Password | Zuno',
  description: 'Recover access to your Zuno account.',
};

export default function ForgotPasswordPage() {
  return (
    <main className="relative min-h-screen w-full  flex items-center justify-center">
    <Background />
      <ForgotPasswordClient />
    </main>
  );
}