/* 
need 
- npm i @headlessui/react
*/
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import Image from "../psrImage/Image";
import { IconfirmYesNo } from "./interfaces/IconfirmYesNo";

import "./style/Style.css";

export default function ConfirmYesNo(dialogProps: IconfirmYesNo) {
  // console.log("DialogProps", dialogProps);
  const [open, setOpen] = useState(dialogProps.isOpen);
  useEffect(() => {
    setOpen(dialogProps.isOpen);
  }, [dialogProps.isOpen]);

  return (
    <div id={dialogProps.uniqueName + "_db"} key={dialogProps.uniqueName} aria-hidden="true" className={` ${dialogProps?.styleClasses?dialogProps.styleClasses:""}`}>
      {/* onClose={setOpen} */}{/*if want to close on outside click*/}
      <Dialog open={open} onClose={()=>{}} className="psr-dialog-box">
        <DialogBackdrop transition className="psr-dialog-backdrop" />
        <div className="psr-dialog-backdrop-div">
          <div className="psr-dialog-backdrop-div-div">
            <DialogPanel transition className="psr-dialog-panel">
              <div className="psr-dialog-panel-title-message-container">
                <div className="psr-dialog-panel-title-message-container-div">
                  {dialogProps?.image ? (
                    <div className="psr-dialog-panel-image">
                      <Image {...dialogProps?.image} />
                    </div>
                  ) : null}

                  <div className="psr-dialog-panel-title-container">
                    {dialogProps?.title ? (
                      <DialogTitle as="h3" className="psr-dialog-panel-title">
                        {dialogProps?.title}
                      </DialogTitle>
                    ) : null}

                    <div className="psr-dialog-panel-message">
                      <p className="psr-dialog-panel-message-p psr-p" dangerouslySetInnerHTML={{ __html: dialogProps.message }} />
                      {/* <p className="psr-dialog-panel-message-p psr-p">
                        {dialogProps?.message}
                      </p> */}
                    </div>
                  </div>
                </div>
              </div>
              <div className="psr-dialog-panel-button-container">
                {dialogProps.showOkButton && (
                  <button
                    className="psr-dialog-btn psr-dialog-no-btn"
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      if (dialogProps.handelOkButtonClick != undefined) {
                        dialogProps.handelOkButtonClick();
                      }
                    }}
                    autoFocus
                  > Ok
                  </button>
                )}
                {!dialogProps.showOkButton && (
                  <>
                    <button
                      className="psr-dialog-btn psr-dialog-no-btn"
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        dialogProps.handelNoButtonClick();
                      }}
                      autoFocus
                    > No
                    </button>
                    <button
                    type="button"
                      className="psr-dialog-btn psr-dialog-yes-btn"
                      onClick={dialogProps.handelYesButtonClick}
                    > Yes
                    </button>
                  </>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
