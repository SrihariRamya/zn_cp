import {Col, Input, Row} from 'antd';
import React, {useState, Dispatch, SetStateAction, useEffect, FC} from 'react';
import { widget_type } from '../../properties-obj/widget-properties-obj';
import LabelStyle from './label/label';
import Max from './min-max/max';
import Min from './min-max/min';
import ElementPlaceHolder from './placeholder/placeholder';

type NumberPropertiesProps = {
	setSectionValues: Dispatch<SetStateAction<any>>;
	sectionValues: any;
	activeElement: any;
}

const NumberProperties: FC<NumberPropertiesProps> = ({
	setSectionValues,
	activeElement,
	sectionValues,
}) => {
	const {number} = activeElement.element.column_properties;
	const [stepValue, setStepValue] = useState(number.step);

	// eslint-disable-next-line max-len
	const handleStepValueChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setStepValue(e.target.value);
	};

	useEffect(() => {
		setSectionValues(
			sectionValues.map((sec: {section_uid: string, row: []}) => {
				const columnRecursion = (row: any): void => {
					row.forEach((row: any) => {
						row.column.forEach((col: any) => {
							// eslint-disable-next-line max-len
							if (col.column_uid === activeElement.element.column_uid) {
								col.column_properties.number.step = stepValue;
							} else if (widget_type.includes(col.widget_type)) {
								// eslint-disable-next-line max-len
								if (col.column_properties[col.widget_type].row) {
									// eslint-disable-next-line max-len
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
	}, [stepValue]);

	return (
		<div>
			<Row>
				<Col span={24}>
					<h3 style={{
						padding: '5px 10px',
						textAlign: 'center',
						textTransform: 'capitalize',
					}}>Number Properties</h3>
				</Col>
				<Col span={24}>
					<table>
						<thead>
							<tr>
								<th colSpan={2}>Number</th>
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
										type='number'
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
										type='number'
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
										type='number'
									/>
								</td>
							</tr>
							<tr>
								<td>Step</td>
								<td>
									<Input
										value={stepValue.toString()}
										placeholder='Enter Number'
										onChange={handleStepValueChange}
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

export default NumberProperties;
