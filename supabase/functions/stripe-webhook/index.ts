import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')
  const body = await request.text()
  
  let receivedEvent
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message)
    return new Response(err.message, { status: 400 })
  }

  console.log(`🔔 Event received: ${receivedEvent.type}`)

  try {
    switch (receivedEvent.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(receivedEvent.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(receivedEvent.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(receivedEvent.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(receivedEvent.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${receivedEvent.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Webhook processing failed', { status: 500 })
  }

  return new Response('Webhook processed successfully', { status: 200 })
})

async function handleSubscriptionChange(subscription: any) {
  const customer = await stripe.customers.retrieve(subscription.customer)
  
  if (!customer || customer.deleted) {
    console.error('Customer not found')
    return
  }

  // Find subscriber by email
  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .select('id')
    .eq('email', customer.email)
    .single()

  if (error || !subscriber) {
    console.error('Subscriber not found:', customer.email)
    return
  }

  // Update subscriber status
  const { error: updateError } = await supabase
    .from('subscribers')
    .update({
      subscription_status: subscription.status === 'active' ? 'active' : 'cancelled',
      subscription_started_at: subscription.status === 'active' ? new Date(subscription.current_period_start * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', subscriber.id)

  if (updateError) {
    console.error('Error updating subscriber:', updateError)
  }

  // Store subscription info
  await supabase
    .from('payments')
    .upsert({
      subscriber_id: subscriber.id,
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription.id,
      amount: subscription.items.data[0]?.price?.unit_amount || 0,
      currency: subscription.items.data[0]?.price?.currency || 'usd',
      status: subscription.status,
      metadata: subscription.metadata,
      created_at: new Date().toISOString()
    })
}

async function handleSubscriptionCanceled(subscription: any) {
  const customer = await stripe.customers.retrieve(subscription.customer)
  
  if (!customer || customer.deleted) return

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id')
    .eq('email', customer.email)
    .single()

  if (subscriber) {
    await supabase
      .from('subscribers')
      .update({
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriber.id)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  const customer = await stripe.customers.retrieve(invoice.customer)
  
  if (!customer || customer.deleted) return

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id')
    .eq('email', customer.email)
    .single()

  if (subscriber) {
    // Log successful payment
    await supabase
      .from('payments')
      .insert({
        subscriber_id: subscriber.id,
        stripe_customer_id: customer.id,
        stripe_payment_intent_id: invoice.payment_intent,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        created_at: new Date().toISOString()
      })

    // Update subscriber status if needed
    await supabase
      .from('subscribers')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriber.id)
  }
}

async function handlePaymentFailed(invoice: any) {
  const customer = await stripe.customers.retrieve(invoice.customer)
  
  if (!customer || customer.deleted) return

  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id')
    .eq('email', customer.email)
    .single()

  if (subscriber) {
    // Log failed payment
    await supabase
      .from('payments')
      .insert({
        subscriber_id: subscriber.id,
        stripe_customer_id: customer.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'failed',
        created_at: new Date().toISOString()
      })

    // You might want to send a payment failure email here
  }
}