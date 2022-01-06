/**
 * @param {string} USERNAME User name to access the page
 * @param {string} PASSWORD Password to access the page
 * @param {string} REALM A name of an area (a page or a group of pages) to protect.
 * Some browsers may show "Enter user name and password to access REALM"
 */
declare var USERNAME: string;
declare var PASSWORD: string;
declare var REALM: string;

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!request.headers.has("authorization")) {
    return getUnauthorizedResponse("Provide User Name and Password to access this page.");
  }

  const [username, password] = parseCredentials(authorization!);

  if (username !== USERNAME || password !== PASSWORD) {
    return getUnauthorizedResponse("The User Name and Password combination you have entered is invalid.");
  }

  return await fetch(request);
}

/**
 * Break down base64 encoded authorization string into plain-text username and password
 * @param {string} authorization
 * @returns {string[]}
 */
function parseCredentials(authorization: string) {
  const parts = authorization.split(" ");
  const plainAuth = atob(parts[1]);

  return plainAuth.split(":");
}

/**
 * Helper funtion to generate Response object
 * @param {string} message
 * @returns {Response}
 */
function getUnauthorizedResponse(message: string) {
  return new Response(message, {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}"`,
    },
  });
}
