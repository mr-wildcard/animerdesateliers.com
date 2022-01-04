declare var MJ_LIST_ID: string;
declare var MJ_APIKEY_PUBLIC: string;
declare var MJ_APIKEY_PRIVATE: string;

/**
 * https://dev.mailjet.com/email/reference/contacts/subscriptions/
 */

addEventListener("fetch", (event) => {
  if (event.request.method !== "POST") {
    event.respondWith(new Response("", { status: 405 }));
  } else if (!event.request.headers.get("content-type")?.includes("application/json")) {
    event.respondWith(new Response("", { status: 415 }));
  } else {
    event.respondWith(handleResponse(event.request));
  }
});

async function handleResponse(request: Request) {
  const { email } = await request.json();

  if (!email.length) {
    return new Response("You need to provide an email address", { status: 400 });
  }

  return fetch(`https://api.mailjet.com/v3/REST/contactslist/${MJ_LIST_ID}/managecontact`, {
    body: JSON.stringify({
      Action: "addforce",
      Email: email,
    }),
    headers: {
      Authorization: `Basic ${btoa(`${MJ_APIKEY_PUBLIC}:${MJ_APIKEY_PRIVATE}`)}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  })
    .then((response) => {
      if (response.ok) {
        return new Response(`Email address ${email} successfully added to newsletter subscription !`);
      } else {
        console.error("An error occured while contacting MailJet.", "Submitted email:", email);

        return new Response(`An error occured while adding ${email} address to newsletter subscription.`, {
          status: response.status,
        });
      }
    })
    .catch((error) => {
      console.error("An error occured while contacting MailJet", error);

      return new Response(`An error occured while adding ${email} address to newsletter subscription.`, {
        status: 500,
      });
    });
}
