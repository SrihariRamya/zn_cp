import {Col, Row, Select} from 'antd';
import React, {useState, useEffect, Dispatch, SetStateAction, FC} from 'react';
import { widget_type } from '../../properties-obj/widget-properties-obj';
import LabelStyle from './label/label';
import LookupProperties from './lookup-properties';

type CheckBoxPropertiesProps = {
	setSectionValues: Dispatch<SetStateAction<any>>;
	sectionValues: any;
	activeElement: any;
}

const CheckBoxProperties: FC<CheckBoxPropertiesProps> = ({
	setSectionValues,
	activeElement,
	sectionValues,
}) => {
	const {checkbox} = activeElement.element.column_properties;
	const {defaultValue} = checkbox;
	const [defaultOption, setDefaultOption] = useState(defaultValue);

	const handleDefaultOption = (value: string): void => {
		setDefaultOption(value);
	};

	useEffect(() => {
		setSectionValues(
			sectionValues.map((sec: {section_uid: string, row: []}) => {
				const rowRecursion = (row: any): void => {
					row.forEach((row: any) => {
						row.column.forEach((col: any) => {
							const {checkbox} = col.column_properties;
							// eslint-disable-next-line max-len
							if (col.column_uid === activeElement.element.column_uid) {
								checkbox.defaultValue = defaultOption;
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
	}, [
		defaultOption,
	]);

	return (
		<div>
			<Row>
				<Col span={24}>
					<table>
						<thead>
							<tr>
								<th colSpan={2}>Checkbox</th>
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
								<td>Default Value</td>
								<td>
									<Select
										style={{width: '100%'}}
										virtual={false}
										onChange={handleDefaultOption}
										mode='multiple'
										defaultValue={defaultValue || undefined}
										options={[
											{
												value: 'none',
												label: 'None',
											},
											{
												value: 'apple',
												label: 'Apple',
											},
											{
												value: 'pear',
												label: 'Pear',
											},
											{
												value: 'orange',
												label: 'Orange',
											},
										]}
									/>
								</td>
							</tr>
							<tr>
								<td colSpan={2} style={{padding: '0'}}>
									<LookupProperties
										key={activeElement.element.column_uid}
										setSectionValues={setSectionValues}
										activeElement={activeElement}
										sectionValues={sectionValues}
										type='checkbox'
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

export default CheckBoxProperties;
