import { BrowseButtonStyle } from "../interfaces/Defaults";
import { IbaseFileSelect } from "../interfaces/IbaseFileSelect";
import Label from "../../psrLabel/Label";

export const BaseFileSelect = (baseFileSelectProps: IbaseFileSelect) => {
  return (
    <>
      <div className={baseFileSelectProps.disabled ? "nz-fc-file-picker-control d-flex nz-disabled-file-control" : "nz-fc-file-picker-control d-flex"}>
        <div className="nz-file-select-name">
          {baseFileSelectProps.fileNames.join(", ")}
        </div>
        <label
          style={{
            width: BrowseButtonStyle.Width,
            height: BrowseButtonStyle.Height,
            lineHeight: BrowseButtonStyle.Height,
            padding: "0px",
          }}
          className={baseFileSelectProps.disabled ? "nz-file-upload-combo nz-disabled-file-control" : "nz-file-upload-combo"}
        >
          browse
          <input
            type="file"
            id="file"
            className="custom-file-input"
            accept={baseFileSelectProps.accepts}
            disabled={baseFileSelectProps.disabled}
            onChange={baseFileSelectProps.onChangeFile}
            aria-label="File browser"
            multiple
          />
        </label>
      </div>
      {baseFileSelectProps.isRequired && (!baseFileSelectProps.fileNames.length) && (
        <Label
          uniqueName="error-message"
          styleClasses="font-[12px]"
          label={`${baseFileSelectProps.label} is required`}
        />
      )}
    </>
  );
};