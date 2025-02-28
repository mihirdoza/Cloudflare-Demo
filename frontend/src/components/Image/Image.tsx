
import React from 'react';
import { ReactSVG } from 'react-svg'
import '../../className/Image.css';
import { DefaultStyles } from '../../Interfaces/Defaults';
import { fnCheckImageSourceType } from '../../Common/fnCheckImageSourceType';
import { fnCreateDisplayUri } from '../../Common/fnCreateDisplayUri';
import { Iimage } from '../../Interfaces/Iimage';

const Image = (imageProps: Iimage) => {
    const dynamicStyleImage = {
        width: imageProps.w || DefaultStyles.Width,
        height: imageProps.w,
        maxWidth: 'unset',
        maxHeight: 'unset'
    };
    const imageType = imageProps.type ? imageProps.type : "svg";
    //check image source type 
    const sourceType = fnCheckImageSourceType(imageProps.source);
    const encryptedUri = sourceType === "encrypted" ? fnCreateDisplayUri(imageProps.source, imageProps.type) : null;
    return (
        <div key={imageProps.uniqueName} className='nz-image-container' title={imageProps.tooltip} style={dynamicStyleImage}>
            {/* render png/encrypted file */}
            {((imageType === "png" && sourceType === "uri") || (sourceType === "encrypted" && encryptedUri))
                && <img className='nz-feature-icon' style={dynamicStyleImage} src={encryptedUri ? encryptedUri : imageProps.source} alt={imageProps.altSource} />}
            {/* render svg content as html from uri*/}
            {imageType === "svg" && sourceType === "uri"
                && <ReactSVG className="nz-feature-icon" style={dynamicStyleImage}
                    fallback={() => imageProps.altSource && sourceType === "uri" ? <ReactSVG className="nz-feature-icon"
                        src={imageProps.altSource} /> : null}
                    src={imageProps.source} />}

            {/* show svg content as html */}
            {imageType === "svg" && sourceType === "svg"
                && <div className="nz-feature-icon" style={dynamicStyleImage}
                    dangerouslySetInnerHTML={{ __html: imageProps.source }}></div>}
        </div>
    )
}

export default Image