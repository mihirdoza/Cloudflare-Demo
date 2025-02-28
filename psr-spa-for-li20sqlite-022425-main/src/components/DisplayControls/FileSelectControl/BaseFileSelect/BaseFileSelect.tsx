
import React from 'react'
import { BrowseButtonStyle } from '../../../../Interfaces/Defaults'
import { IbaseFileSelect } from '../../../../Interfaces/DisplayControls/IbaseFileSelect'
import Label from '../../../Label/Label'

export const BaseFileSelect = (baseFileSelectProps: IbaseFileSelect) => {
    return (

        <><div className={baseFileSelectProps.disabled ? 'nz-fc-file-picker-control d-flex nz-disabled-file-control' : "nz-fc-file-picker-control d-flex"}>
            <div className='nz-file-select-name'>{baseFileSelectProps.fileName}</div>
            <label style={{
                width: BrowseButtonStyle.Width,
                height: BrowseButtonStyle.Height,
                lineHeight: BrowseButtonStyle.Height,
                padding: '0px',
            }} className={baseFileSelectProps.disabled ? "nz-file-upload-combo nz-disabled-file-control" : "nz-file-upload-combo"}>
                browse
                <input
                    type="file"
                    id="file"
                    className="custom-file-input"
                    accept={baseFileSelectProps.accepts}
                    disabled={baseFileSelectProps.disabled}
                    onChange={baseFileSelectProps.onChangeFile}
                    aria-label="File browser"
                />
            </label>

        </div>
            {(baseFileSelectProps.isRequired && (!baseFileSelectProps.fileName || !baseFileSelectProps.fileName.length)) && <Label uniqueName='error-message' fontSize='12px' color='#d32f2f' label={`${baseFileSelectProps.label} is required`} />}
        </>
    )
}
