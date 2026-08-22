const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Payment Received</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f4fbfb; color: #153f46; }
      main { max-width: 520px; padding: 32px; text-align: center; }
      h1 { margin: 0 0 12px; font-size: 28px; }
      p { margin: 0; line-height: 1.6; color: #577176; }
    </style>
  </head>
  <body>
    <main>
      <h1>Payment completed</h1>
      <p>You can return to Andalus Vet and tap "Check payment status" to refresh the app.</p>
    </main>
  </body>
</html>`;

Deno.serve(() => new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }));
