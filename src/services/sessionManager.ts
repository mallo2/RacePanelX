import { Platform } from 'react-native';
import CookieManager, { type Cookie } from 'react-native-nitro-cookies';

const SESSION_COOKIE = 'rt_session';

const RENEW_SKEW_MS = 60_000;

class SessionManager {
    private readonly pending = new Map<string, Promise<boolean>>();

    async ensureSession(apiUrl: string, forceRefresh = false): Promise<boolean> {
        const url = new URL(apiUrl);
        if (Platform.OS === 'web') return true;

        try {
            if (!forceRefresh) {
                const cookie = await this.read(url);
                if (cookie && !this.isExpiring(cookie)) return true;
            }
            return await this.refresh(url);
        } catch (error) {
            console.warn('[sessionManager] unable to obtain a session cookie:', error);
            return false;
        }
    }

    private async read(apiUrl: URL): Promise<Cookie | null> {
        const cookies = await CookieManager.get(apiUrl.origin);
        return cookies?.[SESSION_COOKIE] ?? null;
    }

    private refresh(apiUrl: URL): Promise<boolean> {
        const origin = apiUrl.origin;

        const inFlight = this.pending.get(origin);
        if (inFlight) return inFlight;

        const request = this.issueSession(apiUrl).finally(() => {
            this.pending.delete(origin);
        });
        this.pending.set(origin, request);
        return request;
    }

    private async issueSession(apiUrl: URL): Promise<boolean> {
        const bustedUrl = new URL(apiUrl.origin);
        bustedUrl.searchParams.set('_t', Date.now().toString());

        const response = await fetch(bustedUrl.toString(), {
            method: 'GET',
            headers: { Accept: 'application/json' },
            cache: 'no-store'
        });

        const setCookie = response.headers.get('set-cookie');
        if (!setCookie) return false;

        await CookieManager.setFromResponse(apiUrl.origin, setCookie);
        return (await this.read(apiUrl)) !== null;
    }

    private isExpiring(cookie: Cookie): boolean {
        if (!cookie.value) return false;

        const payload = this.decodeJwtPayload(cookie.value);
        if (!payload || typeof payload.exp !== 'number') return false;

        const expiresAtMs = payload.exp * 1000;

        return Date.now() > expiresAtMs - RENEW_SKEW_MS;
    }

    private decodeJwtPayload(token: string): { iat?: number; exp?: number } | null {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            const json = this.base64UrlDecode(parts[1]);
            return JSON.parse(json);
        } catch {
            return null;
        }
    }

    private base64UrlDecode(input: string): string {
        let base64 = input.replaceAll('-', '+').replaceAll('_', '/');
        while (base64.length % 4) {
            base64 += '=';
        }

        if (typeof atob !== 'function') {
            throw new TypeError('atob non disponible dans cet environnement');
        }

        const binary = atob(base64);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        return new TextDecoder('utf-8').decode(bytes);
    }
}

export default new SessionManager();
