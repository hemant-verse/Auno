import Link from 'next/link';

export const metadata = {
  title: 'Guidelines & Terms | Auno',
  description: 'Understand how Auno works, the listing approval process, and safe trading practices.',
};

const sections = [
  {
    number: '01',
    title: 'Auno is a marketplace mediator',
    tone: 'emerald',
    body: [
      'Auno provides a platform for verified college users to discover listings and connect. We are a communication interface, not a party to transactions between buyers and sellers.',
      'We do not own, inspect, store, ship, price, certify, or guarantee any listed item. Buyers and sellers are entirely responsible for negotiating and completing their trades.',
    ],
  },
  {
    number: '02',
    title: 'Listing submission & approval process',
    tone: 'amber',
    body: [
      'To maintain community quality and safety, all new listings must undergo a verification review before becoming visible on the public feed.',
      'Approval means a listing meets basic platform guidelines—it does NOT mean Auno has physically verified the item, guaranteed its quality, or authenticated the seller.',
      'Sellers must provide accurate descriptions and prices. Listings violating platform guidelines will be rejected or removed.',
    ],
  },
  {
    number: '03',
    title: 'Payments and direct transactions',
    tone: 'rose',
    body: [
      'Auno does not process, hold, protect, or refund payments. There is no integrated checkout, escrow, or dispute resolution system.',
      'Payment methods, delivery, and refunds are negotiated directly between buyer and seller. Auno is not liable for payment fraud, chargebacks, non-payment, or delivery issues.',
    ],
  },
  {
    number: '04',
    title: 'Meet and communicate safely',
    tone: 'sky',
    body: [
      'Approved listings may provide direct contact channels (e.g., WhatsApp, email). Only share details necessary to coordinate the trade.',
      'Always meet in a well-lit, public campus spot. Inspect the item thoroughly before transferring money. Never share your passwords, OTPs, or sensitive banking details.',
    ],
  },
  {
    number: '05',
    title: 'Community standards & content rules',
    tone: 'violet',
    body: [
      'Only genuine college marketplace items are permitted. Prohibited content includes stolen, illegal, hazardous, counterfeit, offensive, or prohibited digital materials.',
      'Attempting to bypass approval, spamming, impersonation, or abusing users will lead to immediate listing rejection and account suspension.',
    ],
  },
  {
    number: '06',
    title: 'Reporting and platform moderation',
    tone: 'zinc',
    body: [
      'If you notice suspicious listings or behavior, stop communication and submit a report via our support channels immediately.',
      'Auno reserves the right to reject, edit, or remove any listing at any time without prior notice if it fails to comply with safety standards.',
    ],
  },
];

const toneClasses = {
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  rose: 'bg-rose-50 text-rose-800 border-rose-200',
  sky: 'bg-sky-50 text-sky-800 border-sky-200',
  violet: 'bg-violet-50 text-violet-800 border-violet-200',
  zinc: 'bg-zinc-100 text-zinc-700 border-zinc-200',
};

export default function GuidelinesPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F6] text-zinc-950">
      <div 
        className="pointer-events-none fixed inset-0 -z-0 opacity-50" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 10% 10%, #A7F3D0 0%, transparent 35%), radial-gradient(circle at 90% 25%, #FDE68A 0%, transparent 32%), radial-gradient(circle at 50% 100%, #FCA5A5 0%, transparent 40%)' 
        }} 
      />

      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/feed" className="text-xl font-black tracking-tight">
            A<span className="text-emerald-700">uno</span>
          </Link>
          <Link href="/feed" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 transition-colors hover:text-zinc-950">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Marketplace
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <section className="max-w-3xl">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-800">The Auno rulebook</p>
          <h1 className="max-w-2xl text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">Buy and sell with clarity.</h1>
          <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-zinc-700 sm:text-base">
            Auno helps college buyers and sellers find each other safely. Every listing undergoes moderation prior to public display to maintain a safe campus marketplace.
          </p>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="Marketplace responsibilities">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-2xl font-black text-amber-900">1. Submit</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-amber-800">Post your item details for approval.</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-2xl font-black text-emerald-900">2. Get Approved</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-emerald-800">Listings go live once verified by our system.</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <p className="text-2xl font-black text-rose-900">3. Trade Directly</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-rose-800">Payments and delivery happen outside Auno.</p>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.number} className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-black ${toneClasses[section.tone]}`}>
                  {section.number}
                </span>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-zinc-950">{section.title}</h2>
                  <div className="mt-3 space-y-3 text-sm font-medium leading-6 text-zinc-600">
                    {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl border border-zinc-200/80 bg-zinc-950 p-6 text-white sm:flex-row sm:items-center sm:p-7">
          <div>
            <p className="text-base font-black">Ready to browse?</p>
            <p className="mt-1 text-xs font-medium text-zinc-300">Keep the basics in mind: inspect, communicate clearly, and transact directly.</p>
          </div>
          <Link href="/feed" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black text-zinc-950 transition-colors hover:bg-emerald-100">
            Explore Marketplace
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14m-6-6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}