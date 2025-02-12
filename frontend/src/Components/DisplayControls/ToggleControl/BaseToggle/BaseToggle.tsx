import React from 'react'
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { IbaseToggle } from '../../../../Interfaces/DisplayControls/IbaseToggle';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';

export const BaseToggle = (baseToggleProps: IbaseToggle) => {
    return (
        <FormGroup className="nz-checkbox-group" defaultValue={baseToggleProps.value ? baseToggleProps.value.toString() : ""}>
            <FormControlLabel
                className={baseToggleProps.disabled === true || baseToggleProps.isNZ === true ? baseToggleProps.classNames + " nz-disabled" : baseToggleProps.classNames}
                disabled={baseToggleProps.disabled === true || baseToggleProps.isNZ === true}
                title={baseToggleProps.tooltip}
                control={
                    <div className='nz-checkbox-container'> <Checkbox
                        disabled={baseToggleProps.disabled === true || baseToggleProps.isNZ === true}
                        className="nz-fc-checkbox"
                        size="small"
                        disableRipple={true}
                        onChange={baseToggleProps.handleChange}
                        checked={baseToggleProps.isChecked}
                    />
                        <TouchRipple />
                    </div>
                }
                label={baseToggleProps.displayLabel}
                name='toggle'
                value={baseToggleProps.value}
            />
        </FormGroup>
    );
}
