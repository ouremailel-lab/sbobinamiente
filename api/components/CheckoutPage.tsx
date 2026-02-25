"use client";

import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    paypal?: any;
  }
}

const PAYPAL_CLIENT_ID = "AVggN8-bj-gG7OpJ1v5YsJs9F8OzeGD251_vlqGM3HkgsMKPWgdEzW6L0uhBEvG6U1hQITpRGU0FCBZQ";

const CheckoutPage = ({ amount }: { amount: number }) => {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPaypalScript = () => {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR`;
      script.async = true;
      script.onload = () => {
        if (!paypalRef.current) return;
        window.paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount.toFixed(2)
                }
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            const details = await actions.order.capture();
            window.location.href = "/grazie.html";
          },
          onError: (err: any) => {
            console.error(err);
            alert("Errore pagamento");
          }
        }).render(paypalRef.current);
      };
      document.body.appendChild(script);
    };

    if (!window.paypal) {
      loadPaypalScript();
    }
  }, []);

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
      {/* Container per il bottone PayPal */}
      <div id="paypal-button-container" ref={paypalRef} className="mt-4 flex justify-center"></div>
    </div>
  );
};

export default CheckoutPage;
