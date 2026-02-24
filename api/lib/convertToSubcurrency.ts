/**
 * Converte un importo decimale (es: 49.99) in subunità (es: 4999 centesimi)
 * Usato per Stripe PaymentIntent
 */
export default function convertToSubcurrency(amount: number): number {
  return Math.round(amount * 100);
}
