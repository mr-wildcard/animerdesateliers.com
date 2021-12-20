import { handleRequest } from './handler'

addEventListener('fetch', (event) => {
  if (event.request.url )
  event.respondWith(handleRequest(event.request))
})
