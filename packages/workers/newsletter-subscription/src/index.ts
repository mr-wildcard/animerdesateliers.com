declare var MC_API_KEY: string;
declare var MC_API_KEY_LABEL: string;
declare var MC_LIST_ID: string;
declare var MC_SERVER_PREFIX: string;

interface HTTPBodyRequest {
  email: string;
}

interface MailChimpResponseError {
  title: string;
  status: number;
  detail: string;
  instance: string;
}

async function md5(message: string) {
  // encode as (utf-8) uint8array
  const msgUint8 = new TextEncoder().encode(message);

  // hash the message
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
        .then((jsonBody) => {
          const { email } = jsonBody as HTTPBodyRequest;

          if (!email) {
            return new Response("`email` key is missing in JSON", { status: 400 });
          } else if (!email.length) {
            return new Response("Email address value must not be empty.", { status: 400 });
          } else {
            return addEmailToNewsletterRequest(email);
          }
        })
        .catch((error) => {
          return new Response(
            "An unknown error occurred while retrieving the email address from HTTP request on Cloudflare Worker side.",
            {
              status: 500,
            }
          );
        })
    );
  }
});

async function addEmailToNewsletterRequest(email: string) {
  try {
    const hashedEmail = await md5(email);

    const response = await fetch(
      `https://${MC_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MC_LIST_ID}/members/${hashedEmail}`,
      {
        body: JSON.stringify({
          email_address: email,
          email_type: "html",
          status_if_new: "pending",
          status: "pending",
        }),
        headers: {
          Authorization: `Basic ${btoa(`${MC_API_KEY_LABEL}:${MC_API_KEY}`)}`,
        },
        method: "PUT",
      }
    );

    if (response.ok) {
      console.log(`✅ ${email} subscribed !`);

      return new Response(`Email address ${email} successfully added to newsletter !`, {
        status: response.status,
      });
    } else {
      try {
        const mailChimpError = (await response.json()) as MailChimpResponseError;

        console.error(
          `An error occurred while contacting MailChimp. Submitted email: ${email}`,
          JSON.stringify(mailChimpError, null, 2)
        );

        if (mailChimpError.status === 400 && mailChimpError.title === "Member Exists") {
          return new Response("Email address has already been subscribed to newsletter.", {
            status: 409,
          });
        } else {
          return new Response(`An error occurred while contacting MailChimp. Submitted email: ${email}`, {
            status: response.status,
          });
        }
      } catch (error) {
        const mailChimpError = await response.text();

        console.error(`An error occurred while contacting MailChimp. Submitted email: ${email}`, mailChimpError);

        return new Response(`An error occurred while subscribing email ${email} to newsletter.`, {
          status: response.status,
        });
      }
    }
  } catch (error) {
    console.error("An unknown error occurred.", error);

    return new Response("An unknown error occurred :(", {
      status: 500,
    });
  }
}
