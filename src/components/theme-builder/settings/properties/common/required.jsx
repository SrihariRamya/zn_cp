import {Switch} from 'antd';
import React, {Dispatch, SetStateAction, FC} from 'react';

type FieldRequiredProps = {
	setChangeType: Dispatch<SetStateAction<any>>;
	// eslint-disable-next-line max-len
	setValue: Dispatch<SetStateAction<string | number | string[] | null | boolean>>;
	type: string;
	activeElement: any;
}

const FieldRequired: FC<FieldRequiredProps> = ({
	setChangeType,
	setValue,
	activeElement,
	type,
}) => {
	const {required} = activeElement.element[`${type}_properties`];
	const handleFieldRequired = (checked: boolean): void => {
		setValue(checked);
		setChangeType('required');
	};

	return (
		<table>
			<tbody>
				<tr>
					<td>Required</td>
					<td>
						<Switch
							checked={required}
							onChange={handleFieldRequired}
						/>
					</td>
				</tr>
			</tbody>
		</table>
	);
};

export default FieldRequired;
