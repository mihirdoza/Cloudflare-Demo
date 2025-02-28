
import { Autocomplete, createFilterOptions, TextField } from '@mui/material';
import { IbaseEditCombo } from "../interfaces/IbaseEditCombo";

export const BaseEditCombo = (baseEditComboProps: IbaseEditCombo) => {
    const filter = createFilterOptions<string | any>();

    console.log("baseEditComboProps",baseEditComboProps.dataItems)
    return (
        <Autocomplete
            options={baseEditComboProps.dataItems||""}
            autoSelect={true}
            // autoHighlight={true}
            readOnly={baseEditComboProps.disabled}
            className={baseEditComboProps.disabled ? "nz-fc-readonly" : ""}
            value={baseEditComboProps.selectedValue}
            title={baseEditComboProps.tooltip}
            size={'small'}
            openText={baseEditComboProps?.dataItems?.length > 0 ? "Select..." : "Nothing to select"}
            getOptionLabel={(dataItems: any) =>
                baseEditComboProps.isObjectVal ?
                    (baseEditComboProps.type === "isEquipmentTypes" ? dataItems.eqType :
                        baseEditComboProps.type === "isProdLine" ? dataItems.mfgProdLine :
                            baseEditComboProps.type === "isProdNo" ? dataItems.mfgProdNo :
                                baseEditComboProps.type === "isEntityName" ? dataItems?.entityName :
                                    baseEditComboProps.type === "isPropertyGroup" ? dataItems.pgName :
                                        baseEditComboProps.type === "isProperty" ? dataItems.propertyName : dataItems?.manufacturer) :
                                        baseEditComboProps.type==="databases"?dataItems.label:
                    dataItems
            }
            filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                // Suggest the creation of a new value
                const isExisting = options.some((option) => inputValue === option);
                if (inputValue !== '' && !isExisting) {
                    filtered.push(`${inputValue}`);
                }
                return filtered;
            }}
            onChange={baseEditComboProps.handleSelectionChange}
            renderInput={(params) => <TextField {...params} error={baseEditComboProps.isError} className="height-30px" helperText={baseEditComboProps.isError ? baseEditComboProps.errorMessage : ""} required={baseEditComboProps.isRequired ? true : false} />}
        />
    );
}
