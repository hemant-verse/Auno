
import HomePageClient from '@/components/home/HomePageClient';

export const metadata = {
  title: 'Zuno',
  description: 'Collage market place for students to buy and sell items',
};



export default async function HomePage() {

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden  bg-cover bg-center bg-no-repeat transition-all duration-300 bg-[url('/images/mobile_bg.png')] md:bg-[url('/images/desktop_bg.png')]">
      {/* Soft overlay to ensure copy stays readable over colorful background artwork */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] pointer-events-none" />
      
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between">
        <HomePageClient />
      </div>
    </main>
  );
}