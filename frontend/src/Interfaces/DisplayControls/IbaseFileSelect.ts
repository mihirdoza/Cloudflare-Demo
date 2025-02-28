
export interface IbaseFileSelect {
    fileName: string; // The name of the selected file
    label: string;//Label to show the error message
    accepts: string; // The file types that can be accepted (e.g., 'image/*', '.pdf')
    disabled: boolean; // Whether the file picker is disabled
    isRequired: boolean;//Indicates file upload is required 
    onChangeFile: (event: React.ChangeEvent<HTMLInputElement>) => void; // Handler for when a file is selected
}
