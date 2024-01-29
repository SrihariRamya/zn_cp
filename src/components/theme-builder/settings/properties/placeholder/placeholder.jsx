/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {Input} from 'antd';
import React, {Dispatch, SetStateAction, useState, useEffect} from 'react';
import { widget_type } from '../../../properties-obj/widget-properties-obj';

type ElementPlaceHolderProps = {
	sectionValues: any;
	setSectionValues: Dispatch<SetStateAction<any>>;
    activeElement: {
		section_uid: string;
		row_uid: string;
		element: {
			column_uid: string;
			column_properties: any;
		}
	};
	type: string;
}

const ElementPlaceHolder = ({activeElement, sectionValues, setSectionValues, type}: ElementPlaceHolderProps) => {
	const {placeholder = ''} = activeElement.element.column_properties[type];
	const [placeholderText, setPlaceholderText] = useState(placeholder);
	const handleElementPlaceHolder = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPlaceholderText(e.target.value);
	};

	useEffect(() => {
		setSectionValues(
			sectionValues.map((sec: {section_uid: string, row: []}) => {
				const columnRecursion = (row: any) => {
					row.forEach((row: any) => {
						row.column.forEach((col: any) => {
							if (col.column_uid === activeElement.element.column_uid) {
								col.column_properties[type].placeholder = placeholderText;
							} else if (widget_type.includes(col.widget_type)) {
								if (col.column_properties[col.widget_type].row) {
									columnRecursion(col.column_properties[col.widget_type].row);
								}
							} else if (col.row) {
								columnRecursion(col.row);
							}
						});
					});
				};

				if (sec.section_uid === activeElement.section_uid) {
					columnRecursion(sec.row);
				}

				return sec;
			}),
		);
	}, [placeholderText]);

	return (
		<div>
			<Input
				value={placeholderText}
				onChange={handleElementPlaceHolder}
			/>
		</div>
	);
};

export default ElementPlaceHolder;
