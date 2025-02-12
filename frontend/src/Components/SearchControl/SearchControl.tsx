
import React, { useState } from 'react'
import '../../className/SearchControl.css'
import { fnGetFilePath } from '../../Common/fnGetFilePath'
import { IdirtyFlagImage } from '../../Interfaces/IdirtyFlagImage'
import { IsearchControl } from '../../Interfaces/IsearchControl'
import DirtyFlagImage from '../DirtyFlagImage/DirtyFlagImage'
import RightMouseMenuToggle from '../RightMouseMenuToggle/RightMouseMenuToggle'
import { IrightMouseMenuToggle } from '../../Interfaces/IrightMouseMenuToggle'
import { IeditTextControl } from '../../Interfaces/DisplayControls/IeditTextControl'
import EditTextControl from '../DisplayControls/EditTextControl/EditTextControl'

export default function SearchControl(searchControlProps: IsearchControl) {
    const [selectedItem, setSelectedItem] = useState<string>('')
    const filterIcon: IdirtyFlagImage = {
        image: {
            w: 20,
            h: 20,
            uniqueName: "filtericon",
            source: fnGetFilePath("Filter_128x128.svg", "misc"),
            type: "svg",
            tooltip: "Edit Explorer Filter",
            altSource: "/assets/misc/DefaultBlue_128x128.png",
        },
        uniqueName: 'test-image',
        w: 30,
        h: 30,
        bgColor: "yellow",
        allowBorder: false,
    }
    const rightMouseMenuToggleData: IrightMouseMenuToggle = {
        container: "searchControl",
        showIcon: true,
        featureId: '256',
        selectedLabel: "",
        uniqueName: 'test-rtm',
        handleSelect(value: any) { },
    }


    const searchControl: IeditTextControl = {
        uniqueName: "searchControl",
        placeHolder: 'Enter Keyword to Search',
        isRequired: true,
        isDefault: false,
        label: "",
        value: "",
        data: '',
        focusedControl: "",
        isRenderAsForm: false,
        tooltip: "",
    }
    const lensIcon: IdirtyFlagImage = {
        image: {
            w: 20,
            h: 20,
            uniqueName: "filtericon",
            source: fnGetFilePath("Lens_128x128.svg", "misc"),
            type: "svg",
            tooltip: "Search or Search Next",
            altSource: "/assets/misc/DefaultBlue_128x128.png",
        },
        uniqueName: 'test-image',
        w: 30,
        h: 30,
        bgColor: "yellow",
        allowBorder: false,
    }


    const handleselect = (selectedValue: string) => {
        console.log("selectedValue", typeof selectedValue);
        searchControlProps.SelectedRightMouseItem(selectedValue);
        setSelectedItem(selectedValue);
      };
      

  
    return (
        <div className={`nz-searchControl ${!searchControlProps.isShowFilterControl ? 'nz-hidefilter-icon' : ''}`} key={searchControlProps.uniqueName}>
            {searchControlProps.isShowFilterControl &&

                <><div className='nz-filter-icon'>
                    <DirtyFlagImage {...filterIcon} handleMouse={searchControlProps.handleFilterMouse} isDirty={searchControlProps.filterDirty} />
                </div>

                </>
            }
            {!searchControlProps.hiderightmousemenu &&
                <div>
                    <RightMouseMenuToggle  {...rightMouseMenuToggleData}
                        selectedLabel={selectedItem}
                        handleSelect={handleselect} />
                </div>
            }

            <div className='nz-search-control'>
                <EditTextControl {...searchControl} value={searchControlProps.searchInputValue} handleValueChange={searchControlProps.searchValueChange} />
            </div>
            <div className='nz-lens-icon'>
                <DirtyFlagImage {...lensIcon} handleMouse={searchControlProps.handleLensMouse} isDirty={searchControlProps.lensDirty}  />
            </div>
        </div>
    )
}
