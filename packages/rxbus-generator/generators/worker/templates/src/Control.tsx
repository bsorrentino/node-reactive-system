import { IIconProps } from '@fluentui/react/lib/Icon';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { TextField } from '@fluentui/react/lib/TextField';
import * as React from 'react';

type OnValueChangeHandler = (newValue?: string) => void

export interface IPCFTextFieldProps {
	// These are set based on the toggles shown above the examples (not needed in real code)
	value: string|null;
	visible:boolean
	disabled?: boolean;
	onValueChange: OnValueChangeHandler
}

/**
 * 
 */
export function initialize() {
	initializeIcons()
}

/**
 * 
 * @param props 
 * @returns 
 */
export const TextFieldControl: React.FunctionComponent<IPCFTextFieldProps> = props => {
	const { visible, disabled, value, onValueChange } = props;

	if ( visible===false ) return ( <div></div> )

	const [fieldValue, setFieldValue] = React.useState( () => value!==null ? value : undefined )

	const [errorMessage, setErrorMessage] = React.useState('');

	const onChangeHandler = React.useCallback(
	    (event: React.FormEvent<HTMLInputElement|HTMLTextAreaElement>, value?: string): void => {
			
			if( value ) {

				setFieldValue( value )
				setErrorMessage('')
				onValueChange( value )
			
			}
			else {
				setFieldValue( '' )
				setErrorMessage('Value is not valid!')
			}
	    }, [])

	const FieldIcon: IIconProps = { iconName: 'TextField' };
	
	return (		
			<TextField
				placeholder=""
				onChange={onChangeHandler}
				iconProps={FieldIcon}
				value={fieldValue}
				errorMessage={errorMessage}
				readOnly={disabled}
			>
			</TextField>
		)
}


