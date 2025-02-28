
import React from 'react'
import '../../../className/BrowseFileControl.css'
import { fnGetExtensionFromFileName } from '../../../Common/fnGetExtensionFromFileName';
import { fnGetNameFromFileName } from '../../../Common/fnGetNameFromFileName';
import { IbrowseFileControl } from '../../../Interfaces/DisplayControls/IbrowseFileControl';
import { BaseBrowseFile } from './BaseBrowseFile/BaseBrowseFile';

export const BrowseFileControl = (fileSelectControlProps: IbrowseFileControl) => {
    const accepts = fileSelectControlProps.fileTypeAccepts || '.txt';

    // Function to convert a file to base64
    const toBase64 = (file: File) => new Promise<string | ArrayBuffer | null>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

    // Function to handle file change
    const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ;
        if (!files || files.length === 0) return; // No files selected

        const processFile = async (file: File) => {
            const extension = fnGetExtensionFromFileName(file.name);
            const fileName = fnGetNameFromFileName(file.name);
            const fullName = file.name;
            const fileContentBlob = await toBase64(file).then((result: any) => {
                return result && result.split(',')?.length > 1 ? result.split(',')[1] : result?.length > 0 ? result : "";
            });

            return { extension, fileContentBlob, fileName, fullName };
        };

        const processFiles = async () => {
           
            const fileDataArray = await Promise.all(Array.from(files).map(file => processFile(file)));
            // Multiple files
            fileSelectControlProps.handleValueChange && fileSelectControlProps.handleValueChange(fileDataArray, fileSelectControlProps.uniqueName);
        };

        processFiles().catch(error => {
            console.error("Error processing files:", error);
        });
    };



    return (
        <BaseBrowseFile
            accepts={accepts}
            multiple={fileSelectControlProps.multiple || false}
            disabled={fileSelectControlProps.disabled || false}
            w={fileSelectControlProps.w}
            h={fileSelectControlProps.h}
            onChangeFile={onChangeFile}
            defaultFile={fileSelectControlProps.defaultFile}
        />

    )
}
