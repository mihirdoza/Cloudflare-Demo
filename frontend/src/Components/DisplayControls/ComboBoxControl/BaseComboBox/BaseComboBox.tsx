
import React from 'react'
import ReactSelect, { components, OptionProps } from "react-select";
import { fnGetFilePath } from '../../../../Common/fnGetFilePath';
import { IbaseComboBox } from '../../../../Interfaces/DisplayControls/IbaseComboBox';
import Image from '../../../Image/Image';

const Option = (optionProps: OptionProps<any>) => {
    //baseComboBoxProps.isFocused = false;
    return (
        <components.Option {...optionProps} className="nz-select2-option" />
    );
};
const DropdownIndicator = (
    diProps: any
) => {
    return (
        <components.DropdownIndicator {...diProps} innerProps={{
            ...diProps.innerProps, onMouseDown: e => {
                // e.stopPropagation()
                // e.preventDefault()
            }
        }}>
            <div className="d-flex align-items-center">
                <Image uniqueName='diDropDown' type='svg' source={fnGetFilePath("ArrowDropDown.svg", "misc")} w={10} />
            </div>
        </components.DropdownIndicator >
    );
};
const BaseCombobox = (baseComboBoxProps: IbaseComboBox) => {
console.log('baseComboBoxProps :', baseComboBoxProps.selectedValue);
    return (
        <ReactSelect
            options={baseComboBoxProps.dataItems}
            isSearchable={false}
            menuPlacement="auto"
            value={baseComboBoxProps.selectedValue}
            menuPosition="absolute"
            menuPortalTarget={document.body}
            // isDisabled={baseComboBoxProps.disabled ? true : false}

            // maxMenuHeight={300}
            className={baseComboBoxProps.disabled ? "nz-fc-react-select nz-fc-readonly" : "nz-fc-react-select"}
            classNamePrefix={'nz_fc_rc'}
            isRtl={false}
            blurInputOnSelect={true}
            closeMenuOnSelect={true}
            placeholder={baseComboBoxProps?.dataItems?.length > 0 ? "Select..." : "Nothing to select"}
            openMenuOnClick={!baseComboBoxProps.disabled}
            // menuIsOpen={true}
            menuIsOpen={baseComboBoxProps.disabled ? false : undefined}
            onChange={baseComboBoxProps.disabled ? undefined : baseComboBoxProps.handleSelectionChange}
            styles={{
                option: (styles, state) => ({
                    ...styles,
                    backgroundColor: state.isFocused ? "var(--secondary)" : "",
                    "&:hover": {
                        backgroundColor: "var(--secondary)"
                    }
                })
            }}
            components={
                { DropdownIndicator, Option, IndicatorSeparator: () => null }
            }
        />
    )
}

export default BaseCombobox