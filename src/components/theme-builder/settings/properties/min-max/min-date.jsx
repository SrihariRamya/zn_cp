/* eslint-disable max-len */
import {DatePicker, DatePickerProps} from 'antd';
import React, {Dispatch, SetStateAction, useEffect, useState, FC} from 'react';
import { widget_type } from '../../../properties-obj/widget-properties-obj';

type MinDateProps = {
	sectionValues: any;
	setSectionValues: Dispatch<SetStateAction<any>>;
    activeElement: any;
    format: string;
}

const MinDate: FC<MinDateProps> = ({
	activeElement,
	sectionValues,
	setSectionValues,
	format,
}: MinDateProps) => {
	const {showTime, max_date} = activeElement.element.column_properties.date;
	const [
		minDate,
		setMinDate,
	] = useState(showTime ? max_date.split(' ')[0] : max_date);
	const [
		minTime,
		setMinTime,
	] = useState(showTime ? max_date.split(' ')[1] : '00:00:00');
	const handleMinDate: DatePickerProps['onChange'] = (date, dateString) => {
		setMinDate(dateString);
		if (showTime) {
			const dateTime = dateString.split(' ');
			setMinDate(dateTime[0]);
			setMinTime(dateTime[1]);
		} else {
			setMinDate(dateString);
		}
	};

	useEffect(() => {
		setSectionValues(
			sectionValues.map((sec: {section_uid: string, row: []}) => {
				const rowRecursion = (row: any): void => {
					row.forEach((row: any) => {
						row.column.forEach((col: any) => {
							if (col.column_uid === activeElement.element.column_uid) {
								if (showTime) {
									col.column_properties.date.min_date = minDate;
									col.column_properties.date.min_dateTime = minTime;
								} else {
									col.column_properties.date.min_date = minDate;
								}
							} else if (widget_type.includes(col.widget_type)) {
								if (col.column_properties[col.widget_type].row) {
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
	}, [minDate]);

	return (
		<div>
			<DatePicker
				format={format}
				showTime={showTime}
				onChange={handleMinDate}
			/>
		</div>
	);
};

export default MinDate;
