import {DatePicker, DatePickerProps} from 'antd';
import React, {Dispatch, SetStateAction, useEffect, useState, FC} from 'react';
import { widget_type } from '../../../properties-obj/widget-properties-obj';

type MaxDateProps = {
	sectionValues: any;
	setSectionValues: Dispatch<SetStateAction<any>>;
    activeElement: any;
    format: string;
}

const MaxDate: FC<MaxDateProps> = ({
	activeElement,
	sectionValues,
	setSectionValues,
	format,
}) => {
	const {showTime, max_date} = activeElement.element.column_properties.date;
	const [
		maxDate,
		setMaxDate,
	] = useState(showTime ? max_date.split(' ')[0] : max_date);
	const [
		maxTime,
		setMaxTime,
	] = useState(showTime ? max_date.split(' ')[1] : '00:00:00');
	const handleMaxDate: DatePickerProps['onChange'] = (date, dateString) => {
		if (showTime) {
			const dateTime = dateString.split(' ');
			setMaxDate(dateTime[0]);
			setMaxTime(dateTime[1]);
		} else {
			setMaxDate(dateString);
		}
	};

	useEffect(() => {
		setSectionValues(
			sectionValues.map((sec: {section_uid: string, row: []}) => {
				const rowRecursion = (row: any): void => {
					row.forEach((row: any) => {
						row.column.forEach((col: any) => {
							// eslint-disable-next-line max-len
							if (col.column_uid === activeElement.element.column_uid) {
								if (showTime) {
									// eslint-disable-next-line max-len
									col.column_properties.date.max_date = maxDate;
									// eslint-disable-next-line max-len
									col.column_properties.date.max_dateTime = maxTime;
								}

								col.column_properties.date.max_date = maxDate;
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
	}, [maxDate]);

	return (
		<div>
			<DatePicker
				format={format}
				showTime={showTime}
				onChange={handleMaxDate}
			/>
		</div>
	);
};

export default MaxDate;
