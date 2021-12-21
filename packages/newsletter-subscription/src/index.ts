declare var MJ_LIST_ID: string;
declare var MJ_APIKEY_PUBLIC: string;
declare var MJ_APIKEY_PRIVATE: string;

addEventListener("fetch", (event) => {
  event.respondWith(handleResponse());
});

async function handleResponse() {
  return fetch(`https://api.mailjet.com/v3/REST/contactslist/${MJ_LIST_ID}/managecontact`, {
    body: JSON.stringify({
      Action: "addforce",
      Email: "test1@gmail.com",
    }),
    headers: {
      Authorization: `Basic ${btoa(`${MJ_APIKEY_PUBLIC}:${MJ_APIKEY_PRIVATE}`)}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  }).catch((error) => {
    console.error("An error occured while contacting MailJet.", { error });

    return new Response("An error occured while contacting MailJet.", { status: 500 });
  });
}
