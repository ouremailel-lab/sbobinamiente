# Stripe Checkout Session Modes Guide

## Current Implementation: `mode: 'payment'` ✓

For **SbobinaMente**, we use one-time payments for selling study materials.

## Mode Options

### 1. `payment` (One-time purchase) - **CURRENT**
```typescript
{
  mode: "payment",
  line_items: [{
    price_data: {
      currency: "eur",
      product_data: { name: "Appunti Diritto Costituzionale" },
      unit_amount: 990, // 9.90 EUR
    },
    quantity: 1,
  }]
}
```

**Use when:**
- Selling digital products (PDFs)
- Selling physical products (printed notes)
- One-time purchases
- No recurring billing

**✓ Perfect for our current business model**

---

### 2. `subscription` (Recurring payments)
```typescript
{
  mode: "subscription",
  line_items: [{
    price: "price_1234567890", // Price ID from Stripe Dashboard
    quantity: 1,
  }]
}
```

**Use when:**
- Monthly/yearly subscriptions
- Membership access
- Recurring services

**Potential future use case:**
- Premium monthly subscription for unlimited PDF access
- Weekly new content subscription

---

### 3. `setup` (Save payment method)
```typescript
{
  mode: "setup",
  setup_intent_data: {
    metadata: {
      customer_id: "cus_123",
    },
  },
}
```

**Use when:**
- Saving payment method for future use
- No immediate charge
- Pre-authorization

**Not applicable for our current model**

---

## Implementation Examples

### Example 1: Current One-Time Payment
```javascript
// Selling a PDF for 9.90 EUR
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: {
        name: 'Appunti Diritto Costituzionale',
        description: 'PDF protetto - 150 pagine'
      },
      unit_amount: 990, // cents
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: 'https://sbobinamente.it/success.html',
  cancel_url: 'https://sbobinamente.it/checkout.html',
});
```

### Example 2: Future Subscription Model
```javascript
// Monthly subscription for unlimited access
const session = await stripe.checkout.sessions.create({
  line_items: [{
    // Must create this Price in Stripe Dashboard first
    price: 'price_monthly_subscription_id',
    quantity: 1,
  }],
  mode: 'subscription',
  success_url: 'https://sbobinamente.it/subscription-success.html',
  cancel_url: 'https://sbobinamente.it/pricing.html',
});
```

---

## Recommendation for SbobinaMente

**Continue using `mode: 'payment'`** ✓

Your current implementation is correct because:
1. You sell individual products (PDFs and printed materials)
2. Customers pay once per product
3. No recurring billing needed
4. Simple and straightforward for students

### Future Considerations

If you want to offer subscriptions in the future:

**Option A: Premium Subscription**
- 19.90€/month for unlimited PDF access
- Use `mode: 'subscription'`
- Create recurring price in Stripe Dashboard

**Option B: Study Pack Subscription**
- 29.90€/semester for full course materials
- Use `mode: 'subscription'` with interval="month" and interval_count=6

---

## Key Differences Summary

| Feature | payment | subscription | setup |
|---------|---------|--------------|-------|
| **Immediate charge** | ✓ Yes | ✓ Yes (first payment) | ✗ No |
| **Recurring billing** | ✗ No | ✓ Yes | ✗ No |
| **Use case** | One-time products | Memberships | Save card |
| **SbobinaMente fit** | ✓✓✓ Perfect | Possible future | Not needed |

---

## Line Items: Dynamic vs Static Prices

### Dynamic Pricing (Current - Recommended)
```javascript
price_data: {
  currency: 'eur',
  product_data: { name: 'Product Name' },
  unit_amount: 990, // Calculate dynamically
}
```

**Advantages:**
- Flexible pricing
- Easy to change prices
- No need to pre-create in Stripe Dashboard

### Static Price IDs
```javascript
price: 'price_1234567890' // Must exist in Stripe
```

**Advantages:**
- Better for subscriptions
- Price history tracking
- Easier analytics

**Your current `price_data` approach is correct for your use case.**

---

## Configuration Checklist

- [x] Mode set to `payment` for one-time purchases
- [x] Dynamic `price_data` for flexibility
- [x] Multiple payment methods enabled (card, PayPal, Link)
- [x] Shipping address collection for physical items
- [x] Billing address collection enabled
- [x] Automatic tax calculation enabled
- [x] Metadata for order tracking
- [x] Success/cancel URLs configured

**Your implementation is production-ready! ✓**
