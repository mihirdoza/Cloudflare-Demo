import { IactionLabel } from "./interfaces/IactionLabel";
import Label from "../psrLabel/Label";
import Image from "../psrImage/Image";
import "./style/Style.css";

//DevNote:Using existing label and image and use it
const ActionLabel = (actionLabelProps: IactionLabel) => {
  // console.log("actionLabelProps", actionLabelProps);
  // console.log("actionLabelProps_align", actionLabelProps.align);
  return (
    <div
      key={actionLabelProps.uniqueName}
      className={`psr-action-label ${
        actionLabelProps?.align
          ? "justify-" + actionLabelProps.align
          : "justify-center"
      } ${
           actionLabelProps?.imageAlign == "start"
             ? " flex-row-reverse"
             : " flex-row"
         } ${actionLabelProps.selected ? "psr-action-label-selected" : ""}
          ${actionLabelProps?.disabled ? "psr-disabled bg-yellow-200":"bg-green-300"} 
         ${
          actionLabelProps?.styleClasses ? actionLabelProps.styleClasses : ""
        }`}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        if (actionLabelProps?.handleMouse && actionLabelProps?.disabled!=true) {
          actionLabelProps?.handleMouse(event, actionLabelProps.actionCode);
        }
      }}
      // onClick={(event: React.MouseEvent<HTMLDivElement>) => { actionLabelProps?.handleMouse(event, actionLabelProps.actionCode) }}
      tabIndex={actionLabelProps?.tabIndex}
      role="menuitem"
      title={actionLabelProps?.tooltip}
    >
      <Label {...actionLabelProps.label} />
      {actionLabelProps?.image != undefined ? (
        <Image {...actionLabelProps?.image} />
      ) : null}
      {actionLabelProps.allowIcon && (
        <Image
          uniqueName={`${actionLabelProps.uniqueName}-image`}
          source={
            actionLabelProps.isSuccess ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="psr-green-svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="psr-red-svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            )
          }
          tooltip={actionLabelProps.image?.tooltip || ""}
        />
      )}
    </div>
  );
};

export default ActionLabel;
