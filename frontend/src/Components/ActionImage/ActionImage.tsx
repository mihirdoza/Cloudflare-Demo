
import React from 'react';
import '../../className/ActionImage.css';
import { DefaultStyles } from '../../Interfaces/Defaults';
import { IactionImage } from '../../Interfaces/IactionImage'
import Image from '../Image/Image';
import Label from '../Label/Label';

const ActionImage = (actionImageProps: IactionImage) => {
    const imageProps = actionImageProps.image;
    const labelProps = actionImageProps.label || null;
    const dynamicStyleContainer = {
        width: (typeof actionImageProps.w === "string" ? actionImageProps.w : `${actionImageProps.w}px`) || DefaultStyles.Width,
        height: (typeof actionImageProps.h === "string" ? actionImageProps.h : `${actionImageProps.h}px`) || DefaultStyles.Height,
        border: actionImageProps.border ? actionImageProps.border : DefaultStyles.Border,
        cursor: "pointer"
    }
    return (
        <div key={actionImageProps.uniqueName} style={dynamicStyleContainer} className={`nz-action-image-container${actionImageProps?.labelAlign === "top" ? " flex-at" : ""}${actionImageProps?.selected ? " nz-selected" : ""}`}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => { actionImageProps.handleMouse(event, actionImageProps.actionCode) }}>
            <Image {...imageProps} />
            {labelProps?.label && <Label {...labelProps} />}
        </div>
    )
}

export default ActionImage