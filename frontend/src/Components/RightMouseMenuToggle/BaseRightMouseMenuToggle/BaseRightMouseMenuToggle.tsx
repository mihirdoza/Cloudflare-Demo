
import React, {  useState } from 'react'
import { Popover } from '@mui/material';
import '../../../className/BaseRightMouseMenuToggle.css';
import ActionImage from '../../ActionImage/ActionImage'
import { searchControlChecks } from '../../../Interfaces/Defaults';
import { IbaseRightMouseMenuToggle } from '../../../Interfaces/IbaseRightMouseMenuToggle';
import { ItoggleControl } from '../../../Interfaces/DisplayControls/ItoggleControl';
import { ToggleControl } from '../../DisplayControls/ToggleControl/ToggleControl';

const BaseRightMouseMenuToggle = (baseMenuProps: IbaseRightMouseMenuToggle) => {
  const [mouseX, setMouseX] = useState<any>();
  const [mouseY, setMouseY] = useState<any>();
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLImageElement | null>(null);
  const [rightMouseData,setRightMouseData] =useState<any>(searchControlChecks)

  const handleClick = (event: React.MouseEvent<HTMLImageElement>, actionCode: string) => {
    if (actionCode === "RightMouseMenu") {
      setMouseX(event.clientX);
      setMouseY(event.clientY);
      setIsShowMenu(true);
      setAnchorEl(event.target as HTMLImageElement);
    }
  }
 
  const handleValueChange=(value:string,name:string,isDefault?:boolean)=>{
    if(!isDefault){
      let array:any=[]
      searchControlChecks.forEach((item:any,index:number)=>{
          if(item.label === name){
            item.value='1'
          }else{
            item.value='0'
          }
          array.push(item)
        })
        setRightMouseData(array)
        baseMenuProps.handleSelect(name)
    }
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
        anchorPosition={{ top: mouseY || 0, left: mouseX || 0 }}
        anchorEl={anchorEl}
        aria-hidden={!isShowMenu}
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
        key={baseMenuProps.uniqueName}
      >
          {rightMouseData.map((item:ItoggleControl,index:number)=>{
           return ( <div key={index}> <ToggleControl {...item} handleValueChange={handleValueChange}/></div>)
          })}
       
      </Popover>
    </div>
  )
}
export default BaseRightMouseMenuToggle