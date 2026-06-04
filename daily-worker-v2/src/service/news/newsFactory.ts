import { News } from "./Interface";

type NewsConstructor = new () => News;

const registry = new Map<string, NewsConstructor>();

export function registerNewsProvider(sourceName: string, provider: NewsConstructor): void {
    registry.set(sourceName.toLowerCase(), provider);
}

export function getRegisteredSources(): string[] {
    return Array.from(registry.keys());
}

export function createNewsProvider(sourceName: string): News {
    const ProviderClass = registry.get(sourceName.toLowerCase());

    if (!ProviderClass) {
        throw new Error(`Unsupported news source: ${sourceName}. Did you forget to register it?`);
    }

    return new ProviderClass();
}