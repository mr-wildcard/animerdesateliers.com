declare const MC_API_KEY: string;
declare const MC_API_KEY_LABEL: string;
declare const MC_LIST_ID: string;
declare const MC_SERVER_PREFIX: string;
declare const LOGS_MANAGER_HTTP_URL: string;

interface HTTPBodyRequest {
  email: string;
}

function postLog(log: string) {
  return fetch(LOGS_MANAGER_HTTP_URL, {
    body: JSON.stringify(log),
    method: "POST",
  });
}

async function md5(message: string) {
  // encode as (utf-8) uint8array
  const msgUint8 = new TextEncoder().encode(message);

  // hash the message with md5
  const hashBuffer = await crypto.subtle.digest("MD5", msgUint8);

  // convert buffer to byte array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

addEventListener("fetch", (event) => {
  if (event.request.method !== "POST") {
    event.respondWith(new Response("Only POST requests allowed.", { status: 405 }));
  } else if (!event.request.headers.get("content-type")?.includes("application/json")) {
    event.respondWith(new Response("HTTP request Content-type must be JSON.", { status: 415 }));
  } else {
    event.respondWith(
      event.request
        .json()
        .then((payload) => {
          const jsonPayload = payload as HTTPBodyRequest;

          if (!("email" in jsonPayload)) {
            return new Response("`email` key is missing in JSON", { status: 400 });
          } else if (!jsonPayload.email.length) {
            return new Response("Email address value must not be empty.", { status: 400 });
          } else {
            return addEmailToNewsletterRequest(jsonPayload.email);
          }
        })
        .catch((error) => {
          const errorMessage =
            "An unknown error occurred while retrieving the email address from HTTP request on Cloudflare Worker side";

          return postLog(`${errorMessage}: ${error}`)
            .then(() => console.error(`${errorMessage}: ${error}`))
            .then(() => {
              return new Response(errorMessage, {
                status: 500,
              });
            });
        })
    );
  }
});

async function addEmailToNewsletterRequest(email: string) {
  const hashedEmail = await md5(email);

  const response = await fetch(
    `https://${MC_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MC_LIST_ID}/members/${hashedEmail}`,
    {
      body: JSON.stringify({
        email_address: email,
        status_if_new: "pending",
      }),
      headers: {
        Authorization: `Basic ${btoa(`${MC_API_KEY_LABEL}:${MC_API_KEY}`)}`,
      },
      method: "PUT",
    }
  );

  if (response.ok) {
    const successMessage = `${email} successfully subscribed.`;

    console.log(`✅ ${successMessage}`);

    return new Response(successMessage, { status: response.status });
  } else {
    const mailChimpError = await response.text();
    const errorMessage = `An error occurred while contacting MailChimp with email: ${email}.
      HTTP Status: ${response.status}
      Error: ${mailChimpError}
    `;

    console.error(`❌ ${errorMessage}`);

    await postLog(errorMessage);

    return new Response("An error occurred while contacting MailChimp.", { status: 500 });
  }
}
