// mailjet.connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

addEventListener("fetch", (event) => {
  event.respondWith(handleResponse());
});

async function handleResponse() {
  return fetch("https://api.mailjet.com/v3/REST/contact", {
    body: JSON.stringify({
      IsExcludedFromCampaigns: "true",
      Name: "New Contact",
      Email: "passenger@mailjet.com",
    }),
    headers: {
      Authorization: `Basic ${btoa(`${MJ_APIKEY_PUBLIC}:${MJ_APIKEY_PRIVATE}`)}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}
/*
curl -s \
	-X POST \
	--user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
	https://api.mailjet.com/v3/REST/contact \
	-H 'Content-Type: application/json' \
	-d '{
      "IsExcludedFromCampaigns":"true",
      "Name":"New Contact",
      "Email":"passenger@mailjet.com"
	}'
 */
