import {InputNumber} from 'antd';
import React, {Dispatch, SetStateAction, useState, useEffect, FC} from 'react';
import { widget_type } from '../../../properties-obj/widget-properties-obj';

type MaxProps = {
	sectionValues: any;
	setSectionValues: Dispatch<SetStateAction<any>>;
    activeElement: any;
	type: string;
}

const Max: FC<MaxProps> = ({
	activeElement,
	sectionValues,
	setSectionValues,
	type,
}) => {
	const {max} = activeElement.element.column_properties[type];
	const [maxCount, setMaxCount] = useState<number>(max);
	const handleMaxValues = (e: any): void => {
		setMaxCount(e);
	};

	useEffect(() => {
		setSectionValues(
			sectionValues.map((sec: {section_uid: string, row: []}) => {
				const rowRecursion = (row: any): void => {
					row.forEach((row: any) => {
						row.column.forEach((col: any) => {
							// eslint-disable-next-line max-len
							if (col.column_uid === activeElement.element.column_uid) {
								col.column_properties[type].max = maxCount;
							} else if (widget_type.includes(col.widget_type)) {
								// eslint-disable-next-line max-len
								if (col.column_properties[col.widget_type].row) {
									// eslint-disable-next-line max-len
									rowRecursion(col.column_properties[col.widget_type].row);
								}
							} else if (col.row) {
								rowRecursion(col.row);
							}
						});
					});
				};

				if (sec.section_uid === activeElement.section_uid) {
					rowRecursion(sec.row);
				}

				return sec;
			}),
		);
	}, [maxCount]);

	return (
		<div>
			<InputNumber
				value={maxCount}
				min={1}
				onChange={handleMaxValues}
			/>
		</div>
	);
};

export default Max;
