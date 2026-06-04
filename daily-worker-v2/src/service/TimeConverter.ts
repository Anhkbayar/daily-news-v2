export function parseRelativeTime(timeStr: string): Date | null {
    const now = new Date();
    const match = timeStr.match(/(\d+)\s+(минутын|цагийн|өдрийн|сарын)\s+(өмнө)/);

    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 'минутын': // minutes ago
            return new Date(now.getTime() - value * 60 * 1000);
        case 'цагийн': // hours ago
            return new Date(now.getTime() - value * 60 * 60 * 1000);
        case 'өдрийн': // days ago
            return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
        case 'сарын': // months ago (approximate)
            return new Date(now.getTime() - value * 30 * 24 * 60 * 60 * 1000);
        default:
            return null;
    }
}