import Papa from "papaparse";

// Boolean helpers
export const toBool = (v) => /^(\s*true\s*|\s*1\s*|\s*yes\s*)$/i.test(String(v ?? ""));
export const nowISO = () => new Date().toISOString();

// Date helpers
export function toISOorNow(v) {
    if (!v) return nowISO();
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? nowISO() : d.toISOString();
}

// Normalize a single row coming from CSV/Sheet/JSON to the product shape used in the app
export function normalizeProductRow(r, defaultShareLink = "") {
    const id = (r.id ?? "").toString().trim() || `P_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    return {
        id,
        category: (r.category ?? "Uncategorized").toString().trim(),
        title: (r.title ?? "Untitled").toString().trim(),
        image: (r.image ?? "").toString().trim(),
        shareLink: (r.shareLink ?? defaultShareLink).toString().trim(),
        contentDocUrl: (r.contentDocUrl ?? "").toString().trim(),
        productUrl: (r.productUrl ?? "").toString().trim(),
        availabilityStart: toISOorNow(r.availabilityStart),
        availabilityEnd: toISOorNow(r.availabilityEnd),
        commission: (r.commission ?? "").toString().trim(),
        active: r.active !== undefined ? toBool(r.active) : true,
        createdAt: nowISO(),
        updatedAt: nowISO(),
        deletedAt: null,
    };
}

// Parse CSV text into raw row objects (header-based). Normalization happens elsewhere.
export function parseCSVText(csvText) {
    const { data, errors } = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
    });
    if (errors?.length) {
        const first = errors[0];
        throw new Error(`CSV parse error at row ${first.row ?? "?"}: ${first.message}`);
    }
    return data;
}

// Convert Google Sheets edit/view URL to downloadable CSV URL.
// in:  https://docs.google.com/spreadsheets/d/<ID>/edit#gid=<GID>
// out: https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>
export function sheetUrlToCsv(url) {
    try {
        const u = new URL(url);
        const m = u.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
        if (!m) return url; // not a Sheets URL -> return as-is
        const id = m[1];
        const gidMatch = (u.hash || "").match(/gid=(\d+)/);
        const gid = gidMatch ? gidMatch[1] : "0";
        return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
    } catch {
        return url;
    }
}
