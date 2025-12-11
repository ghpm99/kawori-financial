// components/csv-import/utils/csv.ts
export const parseCSVText = (text: string): { headers: string[]; data: Record<string, string>[] } => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length === 0) return { headers: [], data: [] };

    const parseLine = (line: string) => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                inQuotes = !inQuotes;
            } else if ((ch === "," || ch === ";") && !inQuotes) {
                result.push(current.trim());
                current = "";
            } else {
                current += ch;
            }
        }
        result.push(current.trim());
        return result;
    };

    const headers = parseLine(lines[0]);
    const data = lines.slice(1).map((ln) => {
        const values = parseLine(ln);
        const row: Record<string, string> = {};
        headers.forEach((h, i) => (row[h] = values[i] ?? ""));
        return row;
    });

    return { headers, data };
};

/** tentativa simples de parse de data -> retorna YYYY-MM-DD ou null */
export const parseDateToISO = (value: string): string | null => {
    if (!value) return null;
    const formats = [/^(\d{4})-(\d{2})-(\d{2})$/, /^(\d{2})\/(\d{2})\/(\d{4})$/, /^(\d{2})-(\d{2})-(\d{4})$/];
    for (const fmt of formats) {
        const m = value.match(fmt);
        if (m) {
            if (fmt === formats[0]) return value;
            return `${m[3]}-${m[2]}-${m[1]}`;
        }
    }
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
    return null;
};
