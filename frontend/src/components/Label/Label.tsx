
import '../../className/Label.css';
import { DefaultStyles } from '../../Interfaces/Defaults'
import { Ilabel } from '../../Interfaces/Ilabel'

const Label = (labelProps: Ilabel) => {
    const dynamicStyleLabel = {
        fontSize: labelProps.fontSize || DefaultStyles.FontSize,
        fontStyle: labelProps.fontStyle || DefaultStyles.FontStyle,
        fontWeight: labelProps.fontWeight || DefaultStyles.FontWeight,
        color: labelProps.color || DefaultStyles.Color
    }
    return (
        <div key={labelProps.uniqueName} className='nz-label-container' title={labelProps.tooltip} style={dynamicStyleLabel}>
            <span>{labelProps.label}</span>
        </div>
    )
}

export default Label