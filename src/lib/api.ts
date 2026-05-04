import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

type ApiPayload = Record<string, unknown>;
type MockResponse = unknown[] | Record<string, unknown>;

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000
});

api.interceptors.request.use(config => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.dispatchEvent(new Event('auth-change'));
        }
        return Promise.reject(error);
    }
);

// Fallback mock data when backend orchestrator is unreachable
const mockData: Record<string, MockResponse> = {
    '/influencers': [
        { id: 1, name: "ProGamerX", platform: "Twitch", niche: "Gaming", pricing: 500, followers: 150000, engagementRate: 4.8, bio: "Pro esports player and tech reviewer for gaming audiences." },
        { id: 2, name: "BeautyGuru", platform: "Instagram", niche: "Beauty", pricing: 300, followers: 80000, engagementRate: 7.2, bio: "Makeup artist and lifestyle vlogger." },
        { id: 3, name: "TechReviewLab", platform: "YouTube", niche: "Tech", pricing: 1200, followers: 95000, engagementRate: 5.5, bio: "Hands-on reviews for gadgets, keyboards, and consumer tech." }
    ],
    '/campaigns': [
        { id: 101, brandId: 1, influencerId: 1, budget: 600, deliverable: "1 YouTube Video", status: "ACTIVE", txHash: "0x123abc...", nftTokenId: null, chainCampaignId: null }
    ],
    '/influencers/me': { id: 1, name: "ProGamerX", platform: "Twitch", niche: "Gaming", pricing: 500, followers: 150000, bio: "Pro esports player and tech reviewer." },
};

export const apiCall = async (method: 'get'|'post'|'patch'|'delete', endpoint: string, data?: ApiPayload) => {
    try {
        const response = await api({ method, url: endpoint, data });
        return response.data;
    } catch (error) {
        console.warn(`[API FAILED] ${endpoint}`, error);

        if (endpoint.startsWith('/auth/') || method !== 'get') {
            throw error;
        }
        
        if (mockData[endpoint]) return mockData[endpoint];
        
        throw error;
    }
};

// ── Blockchain-specific helpers ────────────────────────────────────

/**
 * Get blockchain node + contract health status
 */
export const getBlockchainHealth = () =>
    apiCall('get', '/campaigns/blockchain/health');

/**
 * Get on-chain reputation + tier for a wallet address
 */
export const getReputation = (walletAddress: string) =>
    apiCall('get', `/campaigns/blockchain/reputation/${walletAddress}`);

/**
 * Get all reputation NFTs owned by a wallet address
 */
export const getWalletNFTs = (walletAddress: string) =>
    apiCall('get', `/campaigns/blockchain/nfts/${walletAddress}`);

/**
 * Get metadata for a single reputation NFT
 */
export const getNFTDetails = (tokenId: string | number) =>
    apiCall('get', `/campaigns/blockchain/nft/${tokenId}`);

/**
 * Complete a campaign and mint a reputation NFT
 */
export const completeCampaign = (campaignId: string | number, performanceScore = 80) =>
    apiCall('post', `/campaigns/${campaignId}/complete`, { performanceScore });

/**
 * Cancel a campaign and refund escrowed ETH to brand
 */
export const cancelCampaign = (campaignId: string | number) =>
    apiCall('post', `/campaigns/${campaignId}/cancel`);

export default api;
