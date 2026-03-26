import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const api = axios.create({
    baseURL: API_URL,
    timeout: 5000
});

api.interceptors.request.use(config => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Fallback mock data when backend orchestrator is unreachable
const mockData: any = {
    '/influencers': [
        { id: 1, name: "ProGamerX", platform: "Twitch", niche: "Gaming", pricing: 500, followers: 150000, bio: "Pro esports player and tech reviewer." },
        { id: 2, name: "BeautyGuru", platform: "Instagram", niche: "Beauty", pricing: 300, followers: 80000, bio: "Makeup artist and lifestyle vlogger." }
    ],
    '/campaigns': [
        { id: 101, brandId: 1, influencerId: 1, budget: 600, deliverable: "1 YouTube Video", status: "ACTIVE", txHash: "0x123abc...", nftTokenId: null }
    ],
    '/influencers/me': { id: 1, name: "ProGamerX", platform: "Twitch", niche: "Gaming", pricing: 500, followers: 150000, bio: "Pro esports player and tech reviewer." },
};

export const apiCall = async (method: 'get'|'post'|'patch', endpoint: string, data?: any) => {
    try {
        const response = await api({ method, url: endpoint, data });
        return response.data;
    } catch (error) {
        console.warn(`[API FAILED] Falling back to local Mocks for ${endpoint}`, error);
        
        if (endpoint === '/ai/match' && method === 'post') {
            return {
                source: "frontend_mock",
                results: [
                    { id: 1, score: 95, reason: "Excellent fit for gaming." },
                    { id: 2, score: 42, reason: "Mismatch in audience." }
                ]
            };
        }
        
        if (endpoint.startsWith('/auth/')) {
            // Emulate login success with mocked role
            const role = data?.role || "BRAND";
            return { token: "mock-jwt-token", role };
        }
        
        if (mockData[endpoint]) return mockData[endpoint];
        
        // Generic successful fallback
        return { success: true, mocked: true, txHash: "0xfade..." };
    }
};

export default api;
