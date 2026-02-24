"use client";

import React, { useEffect, useRef, useState } from "react";

// Usa il tuo client-id PayPal fornito
const PAYPAL_CLIENT_ID = "AVggN8-bj-gG7OpJ1v5YsJs9F8OzeGD251_vlqGM3HkgsMKPWgdEzW6L0uhBEvG6U1hQITpRGU0FCBZQ";

const CheckoutPage = ({ amount }: { amount: number }) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.paypal && paypalRef.current) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR`;
      script.async = true;
      script.onload = () => renderPayPalButton();
      paypalRef.current.appendChild(script);
    } else {
      renderPayPalButton();
    }
    // eslint-disable-next-line
  }, [name, email, amount]);

  function renderPayPalButton() {
    if (
      window.paypal &&
      paypalRef.current &&
      paypalRef.current.childElementCount === 0
    ) {
      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toFixed(2),
                  currency_code: "EUR",
                },
                payee: {
                  email_address: "ouremailel@gmail.com", // ← tua email PayPal
                },
                description: `Acquisto SbobinaMente - ${name}`,
              },
            ],
            payer: {
              name: { given_name: name },
              email_address: email,
            },
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then(() => {
            setSubmitted(true);
          });
        },
        onError: (err: any) => {
          alert("Errore PayPal: " + err);
        },
      }).render(paypalRef.current);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white p-4 rounded-md text-center">
        <h2 className="text-xl font-bold mb-4">Pagamento completato!</h2>
        <p className="mb-2 text-gray-700">
          Grazie per il tuo acquisto.<br />
          Riceverai una email di conferma.
        </p>
        <div className="mt-4 font-bold text-lg">
          Totale: €{amount}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md text-center">
      <h2 className="text-xl font-bold mb-4">Checkout PayPal</h2>
      <p className="mb-2 text-gray-700">
        Compila i dati e paga con PayPal.<br />
        Riceverai conferma via email.
      </p>
      <div className="mt-4 font-bold text-lg">
        Totale: €{amount}
      </div>
      <input
        type="text"
        name="name"
        placeholder="Nome e Cognome"
        className="mt-4 p-2 rounded border w-full"
        required
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="mt-2 p-2 rounded border w-full"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <div ref={paypalRef} className="mt-4 flex justify-center"></div>
    </div>
  );
};

export default CheckoutPage;
