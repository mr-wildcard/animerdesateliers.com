declare var MJ_LIST_ID: string;
declare var MJ_APIKEY_PUBLIC: string;
declare var MJ_APIKEY_PRIVATE: string;

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
  }).catch((error) => {
    console.error("An error occured while contacting MailJet.", "Submitted email:", email, { error });

    return new Response("An error occured while contacting MailJet.", { status: 500 });
  });
}
