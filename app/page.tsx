export default function Home() {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <main className="row-start-2 flex flex-col items-center justify-center gap-[32px] text-center">
        <h1 className="max-w-3xl text-center text-4xl font-black leading-snug">
          Looking for a Dentist in Malaysia? We’ve Got You Covered.
        </h1>

        <p className="max-w-xl text-center text-lg text-gray-500 dark:text-gray-300">
          We’re launching a smarter way to find nearby dental clinics — with verified listings, real
          reviews, and easy appointment booking.
        </p>

        <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            className="md:w-fit-content flex h-10 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-4 text-sm font-medium transition-colors hover:border-transparent hover:bg-[#f2f2f2] sm:h-12 sm:w-auto sm:px-5 sm:text-base dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            href="https://www.yuurrific.com/projects?ref=aestheticclinic.my"
            target="_blank"
            rel="noopener noreferrer">
            Check out our projects
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex flex-wrap items-center justify-center gap-[24px]">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.clinicgeek.com/?ref=aestheticclinic.my"
          target="_blank"
          rel="noopener noreferrer">
          Go to clinicgeek.com →
        </a>
      </footer>
    </div>
  );
}
