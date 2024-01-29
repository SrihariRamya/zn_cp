import {Col, InputNumber, Row} from 'antd';
import React, {useState, Dispatch, SetStateAction, useEffect, FC} from 'react';
import { widget_type } from '../../properties-obj/widget-properties-obj';
import LabelStyle from './label/label';
import Max from './min-max/max';
import Min from './min-max/min';
import ElementPlaceHolder from './placeholder/placeholder';

type TextAreaPropertiesProps = {
	setSectionValues: Dispatch<SetStateAction<any>>;
	sectionValues: any;
	activeElement: any;
}

const TextAreaProperties: FC<TextAreaPropertiesProps> = ({
	setSectionValues,
	activeElement,
	sectionValues,
}) => {
	const {textArea} = activeElement.element.column_properties;
	const [rows, setRows] = useState(textArea.rows);

	const handleRowChanage = (row: any): void => {
		setRows(row);
	};

	useEffect(() => {
		setSectionValues(
			sectionValues.map((sec: {section_uid: string, row: []}) => {
				const rowRecursion = (row: any): void => {
					row.forEach((row: any) => {
						row.column.forEach((col: any) => {
							// eslint-disable-next-line max-len
							if (col.column_uid === activeElement.element.column_uid) {
								col.column_properties.textArea.rows = rows;
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
	}, [rows]);

	return (
		<div>
			<Row>
				<Col span={24}>
					<table>
						<thead>
							<tr>
								<th colSpan={2}>Text Area</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td colSpan={2} style={{padding: '0'}}>
									<LabelStyle
										setSectionValues={setSectionValues}
										activeElement={activeElement}
										sectionValues={sectionValues}
									/>
								</td>
							</tr>
							<tr>
								<td>Placeholder</td>
								<td>
									<ElementPlaceHolder
										setSectionValues={setSectionValues}
										activeElement={activeElement}
										sectionValues={sectionValues}
										type='textArea'
									/>
								</td>
							</tr>
							<tr>
								<td>Minimum Length</td>
								<td>
									<Min
										setSectionValues={setSectionValues}
										activeElement={activeElement}
										sectionValues={sectionValues}
										type='textArea'
									/>
								</td>
							</tr>
							<tr>
								<td>Maximum Length</td>
								<td>
									<Max
										setSectionValues={setSectionValues}
										activeElement={activeElement}
										sectionValues={sectionValues}
										type='textArea'
									/>
								</td>
							</tr>
							<tr>
								<td>Rows</td>
								<td>
									<InputNumber
										min={1}
										value={rows}
										onChange={handleRowChanage}
									/>
								</td>
							</tr>
						</tbody>
					</table>
				</Col>
			</Row>
		</div>
	);
};

export default TextAreaProperties;
