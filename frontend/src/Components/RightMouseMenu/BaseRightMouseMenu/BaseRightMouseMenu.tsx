
import React, { useEffect, useState } from 'react'
import { Popover } from '@mui/material';
import '../../../className/BaseRightMouseMenu.css';
import { IbaseRightMouseMenu } from '../../../Interfaces/IbaseRightMouseMenu';
import { IactionImageForList, IactionImageList } from '../../../Interfaces/IactionImageList';
import { fnGetFilePath } from '../../../Common/fnGetFilePath';
import ActionImage from '../../ActionImage/ActionImage'
import ActionImageList from '../../ActionImageList/ActionImageList';

const BaseRightMouseMenu = (baseMenuProps: IbaseRightMouseMenu) => {
  const [mouseX, setMouseX] = useState<any>();
  const [mouseY, setMouseY] = useState<any>();
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLImageElement | null>(null);
  const [actionListData, setActionListData] = useState<IactionImageList>();

  useEffect(() => {
    if (baseMenuProps.menuData && baseMenuProps.menuData.length > 0) {
      createListData(baseMenuProps.menuData)
    }
  }, [baseMenuProps.menuData])
  const createListData = (listData: any) => {
    if (listData && listData?.length > 0) {
      let array: IactionImageForList[] = []
      for (let index = 0; index < listData.length; index++) {
        const item = listData[index];
        console.log('item?.NodeType', item?.NodeType)
        let actionImages: any = {
          image: {
            w: 20,
            h: 20,
            type: 'svg',
            uniqueName: item.iconName,
            source: fnGetFilePath((item.iconName ? item.iconName : item?.Label?.replace(/[^0-9A-Za-z_-]/g, '') + "_128x128.svg"), item.Label === "More" ? "misc" : "Features"),
          },
          label: {
            uniqueName: item.Label,
            label: item.Label,
            fontSize: "14px",
            tooltip: item.Tooltip
          },
          uniqueName: item.Label,
          separator: item && item?.NodeType && item?.NodeType?.includes("Separator") ? true : false,
          w: '100%',
          h: 40,
          border: "none",
          labelAlign: "bottom",
          actionCode: item,
          selected: false
        }
        console.log('actionImages', actionImages)
        array.push(actionImages)
      }
      let actionList: IactionImageList = {
        uniqueName: 'actionlistforRtm',
        actionImages: array,
        isVertical: true,
        w: "100%", // Width of the entire container
        h: "calc(100% - 4px)", // Height of the entire container
        bgColor: "lightgray", // Background color of the container
        border: "1px solid #ccc", // Border style for the container
        spacing: "1px" // if provided it will apply padding between container and action images
      }
      console.log('actionList', actionList)
      setActionListData(actionList)
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLImageElement>, actionCode: string) => {
    if (actionCode === "RightMouseMenu") {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
      setIsShowMenu(true);
      setAnchorEl(event.target as HTMLImageElement);
      baseMenuProps.handleClick && baseMenuProps.handleClick(event, actionCode)

    }
  }

  const handleSelect = (selectedRightMouseMenu: any) => {
    console.log('selectedRightMouseMenu', selectedRightMouseMenu)
    baseMenuProps.handleSelect && baseMenuProps.handleSelect(selectedRightMouseMenu.actionCode)
  }
  
  return (
    <div key={baseMenuProps.uniqueName}>
      <div className='nz-right-mouse-menu'>
        {/* show right mouse menu image. */}
        {baseMenuProps.showIcon && <ActionImage
          {...baseMenuProps.imageObject}
          handleMouse={(event: any, actionCode: any) => handleClick(event, actionCode)}
        />}
      </div>
      {/* show popup with right mouse menu list. */}
      <Popover
        open={isShowMenu}
        className="nz-popover-three-dots-menu-div"
        anchorReference="anchorPosition"
        anchorPosition={{ top: mouseY, left: mouseX }}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClick={() => {
          setAnchorEl(null);
          setIsShowMenu(false);
        }}

      >

        {/* show right mouse menu list */}
        {actionListData && <ActionImageList {...actionListData} handleSelect={handleSelect}
          handleMouseLeave={() => {
            setIsShowMenu(false)
          }
          } />}
      </Popover>
    </div>
  )
}
export default BaseRightMouseMenu