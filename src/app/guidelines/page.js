import Link from 'next/link';

export const metadata = {
  title: 'Guidelines & Terms | Zuno',
  description: 'Understand how Zuno works and how buyers and sellers should use the marketplace.',
};

const sections = [
  {
    number: '01',
    title: 'Zuno is a marketplace mediator',
    tone: 'emerald',
    body: [
      'Zuno provides a place for verified college users to discover listings and connect with one another. We are a communication platform, not a party to the transaction between a buyer and a seller.',
      'We do not own, inspect, store, ship, price, certify, or guarantee any listed product. The buyer and seller are responsible for deciding whether and how to complete a transaction.',
    ],
  },
  {
    number: '02',
    title: 'Product quality and listing accuracy',
    tone: 'amber',
    body: [
      'Listings, photos, descriptions, prices, conditions, availability, and contact details are provided by users. Zuno does not verify that every detail is accurate, complete, current, or suitable for a particular purpose.',
      'Sellers must describe items honestly and update or remove listings when an item is no longer available. Buyers should ask questions, inspect the item, and confirm its condition before agreeing to buy.',
    ],
  },
  {
    number: '03',
    title: 'Payments and transactions',
    tone: 'rose',
    body: [
      'Zuno does not process, hold, protect, refund, or guarantee payments. There is no Zuno checkout, escrow, buyer protection, or payment dispute service.',
      'Any payment method, amount, timing, delivery arrangement, refund, exchange, or cancellation is agreed directly between the buyer and seller. Zuno is not responsible for payment fraud, non-payment, chargebacks, counterfeit money, delivery problems, or disputes after users connect.',
    ],
  },
  {
    number: '04',
    title: 'Meet and communicate safely',
    tone: 'sky',
    body: [
      'Product pages may provide direct WhatsApp or email contact with the seller. Share only the information needed to arrange a transaction, and be careful with phone numbers, addresses, passwords, OTPs, and financial details.',
      'For in-person exchanges, choose a public campus location, tell someone where you are going, inspect the item before paying, and leave if the situation feels unsafe. Never share your Zuno password or an email verification code with another person.',
    ],
  },
  {
    number: '05',
    title: 'Community standards',
    tone: 'violet',
    body: [
      'Use Zuno only for genuine college marketplace activity. Do not post misleading, stolen, illegal, dangerous, counterfeit, abusive, discriminatory, or sexually explicit content. Do not impersonate another person, scrape contact details, spam users, or use the platform to harass or scam anyone.',
      'Keep communication respectful and use accurate contact information. Accounts and listings may be restricted or removed when they violate these guidelines or create a risk for the community.',
    ],
  },
  {
    number: '06',
    title: 'Report concerns and use your judgment',
    tone: 'zinc',
    body: [
      'If a listing or user appears suspicious, stop communicating and do not send money or personal information. Save relevant messages or listing details and contact the Zuno team through the support channel provided by the platform.',
      'These guidelines explain the current role of Zuno and do not replace your own judgment. By using the marketplace, you acknowledge that transactions are made directly between users and that you use the service at your own risk.',
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
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 10% 10%, #A7F3D0 0%, transparent 35%), radial-gradient(circle at 90% 25%, #FDE68A 0%, transparent 32%), radial-gradient(circle at 50% 100%, #FCA5A5 0%, transparent 40%)' }} />

      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/feed" className="text-xl font-black tracking-tight">
            Z<span className="text-emerald-700">uno</span>
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
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-800">The Zuno rulebook</p>
          <h1 className="max-w-2xl text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">Buy and sell with clarity.</h1>
          <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-zinc-700 sm:text-base">
            Zuno helps college buyers and sellers find each other. These guidelines explain what we provide, what we do not provide, and how to keep transactions safer for everyone.
          </p>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="Marketplace responsibilities">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-2xl font-black text-emerald-900">Connect</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-emerald-800">Find listings and contact sellers directly.</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-2xl font-black text-amber-900">Decide</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-amber-800">Check the item, seller, price, and details yourself.</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <p className="text-2xl font-black text-rose-900">Trade directly</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-rose-800">Payments and delivery happen outside Zuno.</p>
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
