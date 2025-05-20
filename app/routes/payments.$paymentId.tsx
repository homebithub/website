import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const paymentId = params.paymentId;
  if (!paymentId) {
    throw new Response("Payment ID is required", { status: 400 });
  }
  const cookie = request.headers.get("cookie") || "";
  const res = await fetch(`http://localhost:8080/payments/${paymentId}`, {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Response("Failed to fetch payment details", { status: res.status });
  }
  const payment = await res.json();
  return json({ payment });
};

export default function PaymentDetailsPage() {
  const { payment } = useLoaderData<typeof loader>();

  if (!payment) {
    return <Error message="Payment not found." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Payment Details</h1>
          <div className="space-y-4">
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Amount</span>
              <span className="block text-lg text-slate-900 dark:text-white">{payment.amount} {payment.currency}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Status</span>
              <span className="block text-lg text-slate-900 dark:text-white">{payment.status}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Date</span>
              <span className="block text-lg text-slate-900 dark:text-white">{new Date(payment.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 