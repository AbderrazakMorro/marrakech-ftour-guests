import Papa from 'papaparse';

export interface CSVGuest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export function parseCSV(csvContent: string): CSVGuest[] {
  const result = Papa.parse<CSVGuest>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      return header.trim().toLowerCase().replace(/\s+/g, '_');
    },
  });

  return result.data.filter(
    (row) => row.first_name && row.last_name && row.email
  );
}

export function generateCSV(data: Array<Record<string, any>>): string {
  return Papa.unparse(data);
}

