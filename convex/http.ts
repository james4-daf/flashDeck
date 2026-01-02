// convex/http.ts
import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { api } from './_generated/api';
import { Webhook } from 'svix';

const http = httpRouter();

const handleClerkWebhook = httpAction(async (ctx, request) => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:10',message:'HTTP action called',data:{method:request.method,url:request.url,hasHeaders:!!request.headers},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:14',message:'Environment variable check',data:{hasSecret:!!WEBHOOK_SECRET,secretLength:WEBHOOK_SECRET?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  if (!WEBHOOK_SECRET) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:17',message:'Missing webhook secret - early return',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return new Response('CLERK_WEBHOOK_SECRET is not configured', {
      status: 500,
    });
  }

  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:25',message:'Header extraction',data:{hasSvixId:!!svix_id,hasSvixTimestamp:!!svix_timestamp,hasSvixSignature:!!svix_signature},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion

  if (!svix_id || !svix_timestamp || !svix_signature) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:28',message:'Missing svix headers - early return',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  const payload = await request.text();

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:35',message:'Payload received',data:{payloadLength:payload.length,payloadPreview:payload.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:47',message:'Webhook verification successful',data:{eventType:evt?.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
  } catch (err) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:50',message:'Webhook verification failed',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const eventType = evt.type;

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:58',message:'Event type check',data:{eventType,isUserEvent:eventType==='user.created'||eventType==='user.updated'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses } = evt.data;
    const email = email_addresses?.[0]?.email_address || '';

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:63',message:'Processing user event',data:{clerkId:id,email,emailAddressesCount:email_addresses?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    if (!id) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:67',message:'No user ID in event - early return',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('No user ID in webhook event');
      return new Response('No user ID provided', {
        status: 400,
      });
    }

    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:74',message:'Calling upsertFromClerk mutation',data:{clerkId:id,email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      await ctx.runMutation(api.users.upsertFromClerk, {
        clerkId: id,
        email: email,
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:79',message:'Mutation call completed successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:82',message:'Mutation call failed',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('Error creating/updating user in Convex:', error);
      return new Response('Failed to create/update user', {
        status: 500,
      });
    }
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/114af2d9-bb4e-4286-818d-4cf46420db2b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'convex/http.ts:91',message:'Returning success response',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

http.route({
  path: '/clerk-users-webhook',
  method: 'POST',
  handler: handleClerkWebhook,
});

export default http;


