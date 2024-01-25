import { REFRESH_ACCESS_TOKEN } from '../mutations/refreshAccessToken';
import { useMutation } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'https://frontend-test-api.aircall.dev/graphql'
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const accessToken = localStorage.getItem('access_token');
  const parsedAccessToken = accessToken ? JSON.parse(accessToken) : undefined;

  const refreshToken = localStorage.getItem('refresh_token');
  const parsedRefreshToken = refreshToken ? JSON.parse(refreshToken) : undefined;

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${parsedAccessToken}` : `Bearer ${parsedRefreshToken}`
    }
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
