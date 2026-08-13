import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <>
      <Navbar />

      <main className="mx-auto flex min-h-screen max-w-md items-center px-6 pt-28 pb-16">
        <div className="w-full">
          <div className="mb-10 text-center">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              👋 Bentornato
            </span>

            <h1 className="mt-6 text-4xl font-black text-slate-900">
              Accedi a Car2ne
            </h1>

            <p className="mt-4 text-slate-600">
              Accedi per offrire o prenotare un passaggio.
            </p>
          </div>

          <LoginForm />
        </div>
      </main>

      <Footer />
    </>
  );
}