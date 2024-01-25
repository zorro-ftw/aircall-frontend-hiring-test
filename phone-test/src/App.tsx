import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { LoginPage } from './pages/Login/Login';
import { CallsListPage } from './pages/CallsList';
import { CallDetailsPage } from './pages/CallDetails';
import { Tractor } from '@aircall/tractor';

import './App.css';
import { ProtectedLayout } from './components/routing/ProtectedLayout';
import { darkTheme } from './style/theme/darkTheme';
import { RouterProvider } from 'react-router-dom';
import { GlobalAppStyle } from './style/global';
import { ApolloProvider } from '@apollo/client';
import { AuthProvider } from './hooks/useAuth';
import { client } from './gql/client/client';
import { REFRESH_ACCESS_TOKEN } from './gql/mutations/refreshAccessToken';
import { useMutation } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AuthProvider />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/calls" element={<ProtectedLayout />}>
        <Route path="/calls" element={<CallsListPage />} />
        <Route path="/calls/:callId" element={<CallDetailsPage />} />
      </Route>
    </Route>
  )
);

function App() {
  const [refreshMutation] = useMutation(REFRESH_ACCESS_TOKEN, {
    onCompleted: data => {
      const newAccessToken = data?.refreshTokenV2?.access_token;
      if (newAccessToken) {
        // Store the new access token in local storage
        localStorage.setItem('access_token', JSON.stringify(newAccessToken));
      }
    }
  });

  // Handle 401 situation
  const errorLink = onError(({ graphQLErrors }) => {
    if (!graphQLErrors?.length) return;
    const { response } = graphQLErrors[0].extensions.exception as any;
    console.log(graphQLErrors);

    if (response.statusCode === 401) {
      localStorage.removeItem('access_token');
      refreshMutation();
    }
  });

  client.setLink(errorLink);

  return (
    <Tractor injectStyle theme={darkTheme}>
      <ApolloProvider client={client}>
        <RouterProvider router={router} />
        <GlobalAppStyle />
      </ApolloProvider>
    </Tractor>
  );
}

export default App;
