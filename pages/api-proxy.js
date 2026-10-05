// API Proxy for Static Export
// This file handles API calls by redirecting to the external backend
// Since static export can't handle server-side API routes

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function APIProxy() {
    const router = useRouter();

    useEffect(() => {
        // Get the current path and redirect to external API
        const currentPath = window.location.pathname;
        const apiPath = currentPath.replace('/api', '');
        const externalAPI = `https://engine.sajidahospital.org/api${apiPath}`;

        // Redirect to external API
        window.location.href = externalAPI;
    }, [router]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h2>Redirecting to API...</h2>
                <p>Please wait while we redirect you to the API endpoint.</p>
            </div>
        </div>
    );
}
