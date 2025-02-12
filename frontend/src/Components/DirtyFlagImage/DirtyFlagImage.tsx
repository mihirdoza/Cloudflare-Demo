
import React from 'react';
import '../../className/DirtyFlagImage.css';
import { DefaultStyles } from '../../Interfaces/Defaults';
import Image from '../Image/Image';
import { IdirtyFlagImage } from '../../Interfaces/IdirtyFlagImage';

const DirtyFlagImage = (dirtyFlagImageProps: IdirtyFlagImage) => {
    const imageProps = dirtyFlagImageProps.image;
    const dynamicStyleContainer = {
        width: (typeof dirtyFlagImageProps.w === "string" ? dirtyFlagImageProps.w : `${dirtyFlagImageProps.w}px`) || DefaultStyles.Width,
        height: (typeof dirtyFlagImageProps.h === "string" ? dirtyFlagImageProps.h : `${dirtyFlagImageProps.h}px`) || DefaultStyles.Height,
        border: dirtyFlagImageProps.allowBorder ? DefaultStyles.Border : "none",
        cursor: dirtyFlagImageProps.handleMouse ? "pointer" : "DefaultStyles",
        background: dirtyFlagImageProps.isDirty ? dirtyFlagImageProps.bgColor : "transparent",
    }
    return (
        <div style={dynamicStyleContainer} className={`nz-dirtyFlag-image-container`}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                dirtyFlagImageProps.handleMouse && dirtyFlagImageProps.handleMouse(event)
            }} key={dirtyFlagImageProps.uniqueName}>
            <div className='nz-image-container' title={imageProps.tooltip}>
                <Image {...imageProps} />
            </div>
        </div>
    )
}

export default DirtyFlagImage