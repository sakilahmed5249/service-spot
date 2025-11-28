import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';


// Central place for app-wide providers (NO Suspense here)
const queryClient = new QueryClient({
defaultOptions: {
queries: {
staleTime: 60 * 1000,
gcTime: 5 * 60 * 1000,
refetchOnWindowFocus: false,
retry: (failureCount, error) => {
if (error?.response?.status >= 400 && error?.response?.status < 500) return false;
return failureCount < 2;
},
},
},
});


export default function AppProviders({ children }) {
return (
<QueryClientProvider client={queryClient}>
<AuthProvider>
{children}


<Toaster
position="top-right"
toastOptions={{
duration: 3000,
style: {
background: 'var(--card-bg, rgba(255,255,255,0.9))',
color: 'var(--text-primary, #0f1724)',
borderRadius: '14px',
padding: '12px 16px',
boxShadow: '0 4px 22px rgba(0,0,0,0.08)',
},
}}
/>


{import.meta.env.MODE === 'development' && (
<ReactQueryDevtools initialIsOpen={false} />
)}
</AuthProvider>
</QueryClientProvider>
);
}