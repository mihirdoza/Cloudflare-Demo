
import React, { useEffect, useRef } from 'react'
import { TextField } from '@mui/material'
import { IbaseEditText } from '../../../../Interfaces/DisplayControls/IbaseEditText'

const BaseEditText = (baseEditTextProps: IbaseEditText) => {
    const textFieldRef: any = useRef();

    useEffect(() => {
        if (baseEditTextProps.focusedControl === baseEditTextProps.name) {
            if (textFieldRef && textFieldRef.current) {
                textFieldRef.current.focus();
            }
        }
    }, [baseEditTextProps.focusedControl, baseEditTextProps.name])

    return (
        <TextField
            value={baseEditTextProps.value}
            multiline={baseEditTextProps.multiline ? true : false}
            required={baseEditTextProps.isRequired ? true : false}
            fullWidth={true}
            placeholder={baseEditTextProps.placeHolder || undefined}
            inputRef={textFieldRef}
            autoFocus={baseEditTextProps.isRenderAsForm ? true : false}
            disabled={baseEditTextProps.disabled === true}
            title={baseEditTextProps.isError && baseEditTextProps.errorMessage ? baseEditTextProps.errorMessage : baseEditTextProps.tooltip}
            autoComplete="off"
            className={baseEditTextProps.disabled === true ? "nz-disabled" : ""}
            id={baseEditTextProps.name}
            size={'small'}
            focused={true}
            onChange={baseEditTextProps.handleChange}
            error={baseEditTextProps.isError}
            helperText={baseEditTextProps.isError && baseEditTextProps.isRenderAsForm ? baseEditTextProps.errorMessage : ""}
            onBlur={baseEditTextProps.handleBlur}
            onFocus={baseEditTextProps.handleFocus}
            onKeyUp={baseEditTextProps.handleKeyUp}
        />
    )
}

export default BaseEditText