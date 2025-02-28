import { IdropableControlElementEnums } from "../interfaces/Idefaults";
import { IbaseText } from "../interfaces/IbaseText";

export const BaseText = (baseTextProps: IbaseText) => {
  return (
    <label
      className="psr-fc-label-control"
      drop-element={baseTextProps.uniqueName}
      allow-drop={
        baseTextProps.uniqueName &&
        (baseTextProps.uniqueName.toLowerCase() ===
          IdropableControlElementEnums.SiteName.toLowerCase() ||
          baseTextProps.uniqueName.toLowerCase() ===
            IdropableControlElementEnums.RoomName.toLowerCase() ||
          baseTextProps.uniqueName.toLowerCase() ===
            IdropableControlElementEnums.FloorName.toLowerCase() ||
          baseTextProps.uniqueName.toLowerCase() ===
            IdropableControlElementEnums.LocationName.toLowerCase() ||
          baseTextProps.uniqueName.toLowerCase() ===
            IdropableControlElementEnums.DeviceName.toLowerCase())
          ? "true"
          : "false"
      }
      title={baseTextProps.nameDesc ? baseTextProps.nameDesc : ""}
    >
      {baseTextProps.value !== undefined &&
      baseTextProps.value !== null &&
      baseTextProps.value !== ""
        ? baseTextProps.value
        : ""}
    </label>
  );
};
