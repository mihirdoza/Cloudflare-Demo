
import React from 'react'
import { IbaseBrowseFile } from '../../../../Interfaces/DisplayControls/IbaseBrowseFile'

export const BaseBrowseFile = (baseFileSelectProps: IbaseBrowseFile) => {
    const dynamicStyleLabel = {
        width: `${typeof baseFileSelectProps.w === "string" ? baseFileSelectProps.w : `${baseFileSelectProps.w}px`}`,
        height: `${typeof baseFileSelectProps.h === "string" ? baseFileSelectProps.h : `${baseFileSelectProps.h}px`}`
    };
    return (
        <div className={baseFileSelectProps.disabled ? 'nz-fc-browse-file-control nz-disabled-file-control' : "nz-fc-browse-file-control"}>

            <label style={dynamicStyleLabel} className={baseFileSelectProps.disabled ? "nz-browse-file-control nz-disabled-file-control" : "nz-browse-file-control"}>
                Browse
                <input
                    type="file"
                    id="file"
                    className="custom-file-input"
                    multiple={baseFileSelectProps.multiple}
                    accept={baseFileSelectProps.accepts}
                    disabled={baseFileSelectProps.disabled}
                    onChange={baseFileSelectProps.onChangeFile}
                    aria-label="File browser"
                    // value={baseFileSelectProps?.defaultFile &&baseFileSelectProps?.defaultFile.length==0&&""}
                />
            </label>

        </div>
    )
}
