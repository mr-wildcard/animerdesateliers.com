interface Env {
  NEWSLETTER_SUBSCRIPTION: Fetcher;
}

export const onRequestPost: PagesFunction<Env> = ({ request, env }) => {
  return env.NEWSLETTER_SUBSCRIPTION.fetch(request);
};
