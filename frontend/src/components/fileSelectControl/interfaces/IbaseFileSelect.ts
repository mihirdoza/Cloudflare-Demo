export interface IbaseFileSelect {
    fileNames: any; // Array of selected file names
    label: string; // Label to show the error message
    accepts: string; // The file types that can be accepted (e.g., 'image/*', '.pdf')
    multiple?: boolean; // Set to true for multiple file selection
    disabled: boolean; // Whether the file picker is disabled
    isRequired: boolean; // Indicates if file upload is required
    onChangeFile: (event: React.ChangeEvent<HTMLInputElement>) => void; // Handler for file selection
}
