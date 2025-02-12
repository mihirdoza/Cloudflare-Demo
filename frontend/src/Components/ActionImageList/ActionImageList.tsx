
import React, { useEffect, useState } from 'react'
import '../../className/ActionImageList.css';
import { DefaultStyles } from '../../Interfaces/Defaults';
import { IactionImageForList, IactionImageList } from '../../Interfaces/IactionImageList'
import ActionImage from '../ActionImage/ActionImage'

const ActionImageList = (imagelistProps: IactionImageList) => {
    const [actionImages, setActionImages] = useState<IactionImageForList[]>([]);
    const dynamicStyle = {
        width: (typeof imagelistProps.w === "string" ? imagelistProps.w : `${imagelistProps.w}px`) || DefaultStyles.Width,
        height: (typeof imagelistProps.h === "string" ? imagelistProps.h : `${imagelistProps.h}px`) || DefaultStyles.Height,
        backgroundColor: imagelistProps.bgColor ? imagelistProps.bgColor : DefaultStyles.BGColor,
        border: imagelistProps.border ? imagelistProps.border : DefaultStyles.Border,
        padding: imagelistProps.spacing ? imagelistProps.spacing : "0px"
    }
    useEffect(() => {
        if (imagelistProps.actionImages) {
            setActionImages(imagelistProps.actionImages);
        }
    }, [imagelistProps])

    const handleMouseData = (event: any, actionCode?: string) => {
        console.log('actionCode', actionCode)
        let selectedActionImage: IactionImageForList | undefined = actionImages.find((element: IactionImageForList) => element.actionCode === actionCode);
        const updatedRectords = actionImages.map((element: IactionImageForList, index: number) => {
            element.selected = false;
            if (element.actionCode === actionCode) {
                element.selected = true;
            }
            return element;
        });
        setActionImages([...updatedRectords]);
        imagelistProps.handleSelect && imagelistProps.handleSelect(selectedActionImage);
    }
    return (
        <div style={dynamicStyle} className={`nz-image-list-container${imagelistProps.isVertical ? " nz-list-vertical" : ""}`} title={imagelistProps.tooltip} key={imagelistProps.uniqueName}>
            {actionImages.length > 0 && actionImages.map((imageProps: IactionImageForList, index) => (
                imageProps.separator ? <hr className='nz-image-list-separator' /> : <ActionImage key={index}  {...imageProps} handleMouse={handleMouseData}/>
            ))}
        </div>
    )
}

export default ActionImageList