import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <Navbar />

      <main className="mx-auto flex min-h-screen max-w-md items-center px-6 pt-40 pb-16">
        <div className="w-full">
          <div className="mb-10 text-center">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              🚀 Benvenuto
            </span>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900">
              Crea il tuo account
            </h1>

            <p className="mt-4 text-slate-600">
              Registrati per offrire o prenotare passaggi verso i tuoi eventi preferiti.
            </p>
          </div>

          <RegisterForm />
        </div>
      </main>

      <Footer />
    </>
  );
}