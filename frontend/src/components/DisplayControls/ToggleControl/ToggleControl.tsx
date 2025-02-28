
import React, { useEffect, useState } from 'react'
import '../../../className/ToggleControl.css'
import { fnProcessStringToCompare } from '../../../Common/fnProcessStringToCompare';
import { ItoggleControl } from '../../../Interfaces/DisplayControls/ItoggleControl';
import { BaseToggle } from './BaseToggle/BaseToggle';

export const ToggleControl = (toggleControlProps: ItoggleControl) => {
    // State variables
    const [isChecked, setIsChecked] = useState(false);
    const [isNZ, setIsNZ] = useState<boolean>(false);
    const classNames = "ml-0";
    // Event handler for checkbox change
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked;
        setIsChecked(value);
        if (toggleControlProps.data?.IsFromPopup && toggleControlProps.data.ChangeEvent) {
            toggleControlProps.data.ChangeEvent(true);
        }
        if (!toggleControlProps.isRenderAsForm) {
            if (toggleControlProps.node) {
                toggleControlProps.node.setDataValue('Value', value ? "1" : "0");
                toggleControlProps.api.stopEditing();
            }
        } else {
            if (toggleControlProps.handleValueChange && toggleControlProps.uniqueName) {
                toggleControlProps.handleValueChange(value ? "1" : "0", toggleControlProps.uniqueName);
            }
        }
    };

    // Effect for initial setup and updates
    useEffect(() => {
        if (toggleControlProps.value && (fnProcessStringToCompare(toggleControlProps.value.toString(), '1')
            || fnProcessStringToCompare(toggleControlProps.value.toString(), 'true')
            || fnProcessStringToCompare(toggleControlProps.value.toString(), 'yes')
            || fnProcessStringToCompare(toggleControlProps.value.toString(), 'enabled'))) {
            setIsChecked(true);
            if (toggleControlProps.isDefault) {
                if (toggleControlProps.handleValueChange && toggleControlProps.uniqueName) {
                    toggleControlProps.handleValueChange("1", toggleControlProps.uniqueName, true);
                }
            }
        } else {
            setIsChecked(false);
            if (toggleControlProps.isRenderAsForm) {
                if (toggleControlProps.handleValueChange && toggleControlProps.uniqueName) {
                    toggleControlProps.handleValueChange("0", toggleControlProps.uniqueName, true);
                }
            }
        }
        if (toggleControlProps.isRenderAsForm) {
            let isNz = toggleControlProps.uniqueName && toggleControlProps.value && !toggleControlProps.isDefault && fnProcessStringToCompare(toggleControlProps.uniqueName, "IsNZ") && (fnProcessStringToCompare(toggleControlProps.value.toString(), "1")
                || fnProcessStringToCompare(toggleControlProps.value.toString(), "true")
                || fnProcessStringToCompare(toggleControlProps.value.toString(), "yes")
                || fnProcessStringToCompare(toggleControlProps.value.toString(), "enabled")) ? true : false;
            setIsNZ(isNz);
        }
        else {
            if (toggleControlProps.uniqueName && toggleControlProps.value && fnProcessStringToCompare(toggleControlProps.uniqueName, "IsNZ") && (fnProcessStringToCompare(toggleControlProps.value.toString(), "1")
                || fnProcessStringToCompare(toggleControlProps.value.toString(), "true")
                || fnProcessStringToCompare(toggleControlProps.value.toString(), "yes")
                || fnProcessStringToCompare(toggleControlProps.value.toString(), "enabled"))) {
                setIsNZ(true);
            }
            else {
                setIsNZ(false);
            }
        }
    }, [toggleControlProps.value,
    toggleControlProps.uniqueName,
    toggleControlProps.handleValueChange,
    toggleControlProps.isDefault,
    toggleControlProps.isRenderAsForm,
        toggleControlProps
    ]);
    return (
        <div key={toggleControlProps.uniqueName} className="form-control-labeled">
            <BaseToggle
                value={toggleControlProps.value || ""}
                isChecked={isChecked}
                disabled={toggleControlProps.disabled || false}
                isNZ={isNZ}
                tooltip={toggleControlProps.tooltip || ""}
                classNames={classNames}
                displayLabel={toggleControlProps.label}
                handleChange={handleChange} />
        </div>
    )
}
