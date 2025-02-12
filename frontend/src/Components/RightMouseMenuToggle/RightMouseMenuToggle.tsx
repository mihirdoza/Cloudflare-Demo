
import React, { useState } from 'react'
import {  IrightMouseMenuToggle } from '../../Interfaces/IrightMouseMenuToggle';
import BaseRightMouseMenuToggle from './BaseRightMouseMenuToggle/BaseRightMouseMenuToggle';
import { fnGetImagePath } from '../../Common/fnGetImagePath';

const RightMouseMenuToggle = (menuProps: IrightMouseMenuToggle) => {
    const [selectedLabel, setSelectedLabel] = useState<string>('');
  
   
    const handleSelect = (selectedRightMouseMenu: any) => {
        setSelectedLabel(selectedRightMouseMenu)
        menuProps.handleSelect(selectedRightMouseMenu)
    }
   
    
    return (
        <div key={menuProps.uniqueName}>
             <BaseRightMouseMenuToggle
                imageObject={{
                    image: {
                        uniqueName: "Kebabimage",
                        source: fnGetImagePath("Kebab_128x128.svg", "misc"),
                        type: "svg",
                        w: "20px",
                        h: "20px",
                        tooltip: "Clear"
                    },
                    handleMouse(event, actionCode) {
                    },
                    uniqueName: "Kebab",
                    w: "20px",
                    h: "20px",
                    actionCode: "RightMouseMenu",
                }}
                selectedLabel={selectedLabel ? selectedLabel : "OR"}
                uniqueName={menuProps.uniqueName}
                container={menuProps.container}
                showIcon={menuProps.showIcon}
                handleSelect={handleSelect} />
        </div>
    )
}
export default RightMouseMenuToggle