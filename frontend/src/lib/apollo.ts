import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { getAuthToken } from "./authToken.js";

const authLink = new SetContextLink((previousContext) => {
  const token = getAuthToken();
  return {
    headers: {
      ...previousContext.headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const httpLink = new HttpLink({ uri: import.meta.env.VITE_BACKEND_URL });

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
