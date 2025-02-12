
// below function copy grid data.
export async function fnCopyToClipboard(stringToCopy: any, title: string | null = null, isExportOnCopy: boolean = false) {
    // Extract unique keys from all objects
    try {
        if (isExportOnCopy) {
            let data = JSON.parse(stringToCopy)
            console.log('data :', data);
            const allKeys = Array.from(new Set(data.flatMap((item: string) => Object.keys(item))));

            // Reorder the keys based on the first object's keys sequence
            const orderedKeys = allKeys.sort((a: any, b: any) => {
                const indexOfA = Object.keys(data[0]).indexOf(a);
                const indexOfB = Object.keys(data[0]).indexOf(b);
                return indexOfA - indexOfB;
            });
            const csvContent = orderedKeys.join(",") + "\n";
            const csvData = data.map((item: any) => orderedKeys.map((key: any) => item[key]).join(",")).join("\n");
            // const encodedUri = encodeURI(csvContent + csvData);

            const csvBlob = new Blob([csvContent, csvData], { type: 'text/csv' });
            const csvUrl = URL.createObjectURL(csvBlob);
            // Create a download link
            let fileName = title ? sanitizeFileName(title) : "jsonData";
            const link = document.createElement("a");
            link.setAttribute("href", csvUrl);
            link.setAttribute("download", fileName ? `${fileName}.csv` : "data.csv");
            document.body.appendChild(link);

            // Trigger the download
            setTimeout(() => {
                link.click();
            }, 100);
        }
        else {
            await navigator.clipboard.writeText(stringToCopy);
            console.log('Text copied to clipboard');
        }
    }
    catch {
        await navigator.clipboard.writeText(stringToCopy)

    }

}
export const sanitizeFileName = (fileName: string): string => {
    // Define a regular expression pattern for allowed characters
    const allowedCharacters = /[^a-zA-Z0-9_.-]/g;

    // Replace disallowed characters with an underscore
    const sanitizedName = fileName.replace(allowedCharacters, '_');

    return sanitizedName;
};
