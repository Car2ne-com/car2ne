import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { getLocale } from "@/lib/i18n";

export default async function SegnalaUnProblemaPage() {
  const locale = await getLocale();

  if (locale === "en") {
    return (
      <>
        <Navbar />

        <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
          <h1 className="text-4xl font-black text-slate-900">
            Report a problem
          </h1>

          <p className="mt-4 text-slate-600">
            If you&apos;ve encountered a technical
            issue, inappropriate behavior from another
            user, inappropriate content in chat or in a
            review, or any other difficulty with
            Car2ne, write to us and we&apos;ll get back
            to you as soon as possible.
          </p>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              What helps us respond faster
            </h2>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
              <li>
                A clear description of the problem
              </li>

              <li>
                If it concerns a specific ride or user:
                the event, the date and, if possible,
                the name of the other user involved
              </li>

              <li>
                Any relevant screenshots
              </li>
            </ul>

            <a
              href="mailto:report@car2ne.com"
              className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 px-8 text-base font-semibold text-white transition hover:bg-emerald-600"
            >
              Email report@car2ne.com
            </a>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        <h1 className="text-4xl font-black text-slate-900">
          Segnala un problema
        </h1>

        <p className="mt-4 text-slate-600">
          Se hai riscontrato un problema tecnico,
          un comportamento scorretto da parte di
          un altro utente, un contenuto
          inappropriato in chat o in una
          recensione, oppure qualsiasi altra
          difficoltà con Car2ne, scrivici e ti
          risponderemo il prima possibile.
        </p>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Cosa ci aiuta a risponderti prima
          </h2>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
            <li>
              Una descrizione chiara del
              problema
            </li>

            <li>
              Se riguarda un passaggio o un
              utente specifico: l&apos;evento,
              la data e, se possibile, il nome
              dell&apos;altro utente coinvolto
            </li>

            <li>
              Eventuali screenshot, se
              pertinenti
            </li>
          </ul>

          <a
            href="mailto:report@car2ne.com"
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 px-8 text-base font-semibold text-white transition hover:bg-emerald-600"
          >
            Scrivi a report@car2ne.com
          </a>
        </div>
      </main>

      <Footer />
    </>
  );
}
