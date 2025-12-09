/**
 * API Client - Netlify Functions Handler
 * Centralizza tutte le operazioni backend sicure
 * NON usare più window.supabaseClient per ordini/utenti
 */

const API = {
  /**
   * Crea un nuovo ordine tramite Netlify Function
   * @param {Object} orderData - Dati ordine
   * @returns {Promise<Object>} Risposta API
   */
  async createOrder(orderData) {
    try {
      const response = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Errore nella creazione ordine');
      }

      console.log('✅ Ordine creato via API:', result.order);
      return result;
    } catch (error) {
      console.error('❌ Errore API createOrder:', error);
      throw error;
    }
  },

  /**
   * Recupera ordini utente tramite Netlify Function
   * @param {String} userEmail - Email utente
   * @returns {Promise<Object>} Ordini utente
   */
  async getUserOrders(userEmail) {
    try {
      const response = await fetch(
        `/.netlify/functions/get-user-orders?user_email=${encodeURIComponent(userEmail)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Errore nel recupero ordini');
      }

      console.log('✅ Ordini recuperati via API:', result.orders);
      return result;
    } catch (error) {
      console.error('❌ Errore API getUserOrders:', error);
      throw error;
    }
  }
};

// Rendi disponibile globalmente
window.API = API;
