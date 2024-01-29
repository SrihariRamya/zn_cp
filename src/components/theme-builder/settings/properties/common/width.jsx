import {InputNumber} from 'antd';
import React, {Dispatch, SetStateAction, useState, useEffect, FC} from 'react';

type WidthProps = {
	setChangeType: Dispatch<SetStateAction<any>>;
	// eslint-disable-next-line max-len
	setValue: Dispatch<SetStateAction<string | number | string[] | null | boolean>>;
	activeElement: any;
	type: string;
}

const Width: FC<WidthProps> = (
	{
		setChangeType,
		setValue,
		activeElement,
		type,
	}) => {
	const {width = null} = activeElement.element[`${type}_style`];
	const [colWidth, setColWidth] = useState<number | null>(width || null);
	const handleChangeWidth = (width: number | null): void => {
		if (width) {
			setColWidth(width);
		}
	};

	useEffect(() => {
		setChangeType('width');
		setValue(colWidth);
	}, [colWidth]);

	return (
		<table>
			<tbody>
				<tr>
					<td>Width</td>
					<td>
						<InputNumber
							value={colWidth}
							onChange={handleChangeWidth}
							min={0}
							max={24}
							placeholder='24'
						/>
					</td>
				</tr>
			</tbody>
		</table>
	);
};

export default Width;
