/**
 * Cache Manager
 * Simple in-memory cache with TTL support
 * For production, replace with Redis
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

export class CacheManager {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL: number;

    constructor(defaultTTLSeconds: number = 300) {
        this.defaultTTL = defaultTTLSeconds * 1000; // Convert to milliseconds

        // Clean up expired entries every minute
        setInterval(() => this.cleanup(), 60 * 1000);
    }

    /**
     * Get value from cache
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set value in cache
     */
    set<T>(key: string, data: T, ttlSeconds?: number): void {
        const ttl = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL;
        const expiresAt = Date.now() + ttl;

        this.cache.set(key, { data, expiresAt });
    }

    /**
     * Delete value from cache
     */
    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get or set pattern
     */
    async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        ttlSeconds?: number
    ): Promise<T> {
        // Try to get from cache
        const cached = this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // Fetch and cache
        const data = await fetchFn();
        this.set(key, data, ttlSeconds);
        return data;
    }

    /**
     * Clean up expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        let removed = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                removed++;
            }
        }

        if (removed > 0) {
            console.log(`🗑️  Cache cleanup: removed ${removed} expired entries`);
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const now = Date.now();
        let expired = 0;
        let active = 0;

        for (const entry of this.cache.values()) {
            if (now > entry.expiresAt) {
                expired++;
            } else {
                active++;
            }
        }

        return {
            total: this.cache.size,
            active,
            expired,
            hitRate: 0 // TODO: Track hits/misses
        };
    }
}

// Export singleton instance
export const cache = new CacheManager(300); // 5 minutes default TTL
