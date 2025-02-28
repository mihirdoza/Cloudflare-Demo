
export interface IbaseBrowseFile {
    multiple: boolean; // allow multiple file upload 
    accepts: string; // The file types that can be accepted (e.g., 'image/*', '.pdf')
    disabled: boolean; // Whether the file picker is disabled
    w: string | number;//Width
    h: string | number;
    defaultFile?:File|Object|undefined|any;
    onChangeFile: (event: React.ChangeEvent<HTMLInputElement>) => void; // Handler for when a file is selected
}
