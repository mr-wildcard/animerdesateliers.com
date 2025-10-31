interface Env {
  MC_API_KEY: string;
  MC_API_KEY_LABEL: string;
  MC_LIST_ID: string;
  MC_SERVER_PREFIX: string;
  LOGS_MANAGER_HTTP_URL: string;
}

interface HTTPBodyRequest {
  email: string;
}

async function postLog(log: string, env: Env) {
  try {
    await fetch(env.LOGS_MANAGER_HTTP_URL, {
      body: JSON.stringify(log),
      method: "POST",
    });
  } catch (loggingError) {
    console.error(`Failed to send log to Logs Manager: ${loggingError}`);
  }
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

async function addEmailToNewsletterRequest(email: string, env: Env) {
  const hashedEmail = await md5(email);

  const response = await fetch(
    `https://${env.MC_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${env.MC_LIST_ID}/members/${hashedEmail}`,
    {
      body: JSON.stringify({
        email_address: email,
        status_if_new: "pending",
      }),
      headers: {
        Authorization: `Basic ${btoa(`${env.MC_API_KEY_LABEL}:${env.MC_API_KEY}`)}`,
      },
      method: "PUT",
    },
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

    await postLog(errorMessage, env);

    return new Response("An error occurred while contacting MailChimp.", { status: 500 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Only POST requests allowed.", { status: 405 });
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return new Response("HTTP request Content-type must be JSON.", { status: 415 });
    }

    try {
      const payload = (await request.json()) as Partial<HTTPBodyRequest> | null;

      if (typeof payload?.email !== "string") {
        return new Response("`email` key is missing in JSON", { status: 400 });
      }

      if (!payload.email.length) {
        return new Response("Email address value must not be empty.", { status: 400 });
      }

      return addEmailToNewsletterRequest(payload.email, env);
    } catch (error) {
      const errorMessage =
        "An unknown error occurred while retrieving the email address from HTTP request on Cloudflare Worker side";

      await postLog(`${errorMessage}: ${error}`, env);
      console.error(`${errorMessage}: ${error}`);

      return new Response(errorMessage, {
        status: 500,
      });
    }
  },
};
