import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import AppRoutes from './routes';
import SocketProvider from './components/contexts/socket/SocketProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // refetchOnWindowFocus: true,
      // retry: 3,
      // staleTime: 2592000000, // 30 days
      keepUnusedData: true, // set to true to keep stale data when the window is not focused
    },
  },
});
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <ReactQueryDevtools /> */}
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </QueryClientProvider>
  );
}

export default App;
