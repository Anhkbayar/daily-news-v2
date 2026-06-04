import { News } from "./interface";
import './iKonNews';
import './NewsmnNews';

type NewsConstructor = new () => News;

let registry: Map<string, NewsConstructor> | null = null;

function getRegistry(): Map<string, NewsConstructor> {
    if (!registry) {
        registry = new Map<string, NewsConstructor>();
    }
    return registry;
}

export function registerNewsProvider(sourceName: string, provider: NewsConstructor): void {
    getRegistry().set(sourceName.toLowerCase(), provider);
}

export function createNewsProvider(sourceName: string): News {
    const ProviderClass = getRegistry().get(sourceName.toLowerCase());

    if (!ProviderClass) {
        throw new Error(`Unsupported news source: ${sourceName}. Did you forget to register it?`);
    }

    return new ProviderClass();
}