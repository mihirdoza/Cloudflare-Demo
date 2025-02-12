
import React, { useEffect, useState } from 'react'
import '../../../className/FileSelectControl.css'
import { fnGetExtensionFromFileName } from '../../../Common/fnGetExtensionFromFileName';
import { fnGetNameFromFileName } from '../../../Common/fnGetNameFromFileName';
import { IfileSelectControl } from '../../../Interfaces/DisplayControls/IfileSelectControl';
import { BaseFileSelect } from './BaseFileSelect/BaseFileSelect'
import Label from '../../Label/Label'

export const FileSelectControl = (fileSelectControlProps: IfileSelectControl) => {
    const [fileName, setFileName] = useState('');
    const accepts = fileSelectControlProps.fileTypeAccepts || '.txt';

    useEffect(() => {
        // Update value and trigger handleValueChange when fileSelectControlProps.value changes
        if (fileSelectControlProps.value) {
            setFileName(fileSelectControlProps.value.toString());
        }
        if (fileSelectControlProps.value) { 
            fileSelectControlProps.handleValueChange && fileSelectControlProps.handleValueChange(fileSelectControlProps.value, fileSelectControlProps.uniqueName, true);
        }
    }, [fileSelectControlProps.value,
    fileSelectControlProps.handleValueChange,
    fileSelectControlProps.uniqueName,
        fileSelectControlProps
    ]);

    // Function to convert a file to base64
    const toBase64 = (file: File) => new Promise<string | ArrayBuffer | null>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

    // Function to handle file change
    const onChangeFile = (e: any) => {
        const [file] = e.target.files;
        if (!file) return false;

        var reader = new FileReader();
        reader.onload = function () {
            if (reader.result) {
                toBase64(file).then((result: any) => {
                    if (result) {
                        let extension = fnGetExtensionFromFileName(file.name);
                        let file_name: string = fnGetNameFromFileName(file.name);
                        setFileName(file.name);
                        let fileContentBlob: string = result && result.split(',')?.length > 1 ? result.split(',')[1] : result?.length > 0 ? result : "";
                        // Trigger handleValueChange with file-related values
                        fileSelectControlProps.handleValueChange && fileSelectControlProps.handleValueChange(fileContentBlob, 'FPFileContent');
                        extension && fileSelectControlProps.handleValueChange && fileSelectControlProps.handleValueChange(extension?.toString(), 'FPFileExtension');
                        fileSelectControlProps.handleValueChange && fileSelectControlProps.handleValueChange(file_name, 'FPFileName');
                        fileSelectControlProps.handleValueChange && fileSelectControlProps.handleValueChange(file.name, fileSelectControlProps.uniqueName);
                    }
                });
            }
        };
        reader.readAsDataURL(file);
    };



    return (
        <div key={fileSelectControlProps.uniqueName} className="form-control-labeled">
            {fileSelectControlProps.isRenderAsForm && <Label uniqueName={`${fileSelectControlProps.uniqueName}-label`} tooltip={fileSelectControlProps.nameDesc ? fileSelectControlProps.nameDesc : ""}
                label={`${fileSelectControlProps.label || ""}${fileSelectControlProps.isRequired ? " (Required)" : ""}`} />}
            <BaseFileSelect
                fileName={fileName}
                accepts={accepts}
                isRequired={fileSelectControlProps.isRequired || false}
                disabled={fileSelectControlProps.disabled || false}
                label={fileSelectControlProps.label || fileSelectControlProps.uniqueName}
                onChangeFile={onChangeFile}
            />
            {fileSelectControlProps.isRenderAsForm && fileSelectControlProps.valueDesc && <Label uniqueName={`${fileSelectControlProps.uniqueName}-desc`} label={fileSelectControlProps.valueDesc} fontSize={"8px"} fontStyle={"italic"} />}
        </div>
    )
}
