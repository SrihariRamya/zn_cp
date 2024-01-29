import {Col, Row, Select, Switch} from 'antd';
import { get } from 'lodash';
import React, {useState, useEffect, Dispatch, SetStateAction, FC} from 'react';
import { widget_type } from '../../properties-obj/widget-properties-obj';
import LabelStyle from './label/label';
import LookupProperties from './lookup-properties';
import ElementPlaceHolder from './placeholder/placeholder';

type DropDownPropertiesProps = {
	setSectionValues: Dispatch<SetStateAction<any>>;
	sectionValues: any;
	activeElement: any;
}

const DropDownProperties: FC<DropDownPropertiesProps> = ({
	setSectionValues,
	activeElement,
	sectionValues,
}) => {
	// eslint-disable-next-line max-len
	const {dropdown = {selectMode: '', defaultValue: '', show_search: false}} = activeElement.element.column_properties;
	const [dropDownProps, setDropDownProps] = useState(dropdown);

	const handleChange = (value: string | boolean, type: string): void => {
		if (type) {
			setDropDownProps((prev: any) => ({...prev, [type]: value}));
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
								col.column_properties.dropdown = dropDownProps;
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
	}, [dropDownProps]);

	return (
		<div>
			<Row>
				<Col span={24}>
					<table>
						<thead>
							<tr>
								<th colSpan={2}>Dropdown</th>
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
										type='dropdown'
									/>
								</td>
							</tr>
							<tr>
								<td>Multiple Select</td>
								<td>
									<Switch
										// eslint-disable-next-line max-len
										checked={get(dropDownProps, 'selectMode', false)}
										// eslint-disable-next-line max-len
										onChange={(value: boolean) => handleChange(value, 'selectMode')}
									/>
								</td>
							</tr>
							<tr>
								<td>Show Search</td>
								<td>
									<Switch
										// eslint-disable-next-line max-len
										checked={get(dropDownProps, 'show_search', false)}
										// eslint-disable-next-line max-len
										onChange={(value: boolean) => handleChange(value, 'show_search')}
									/>
								</td>
							</tr>
							<tr>
								<td>Default Value</td>
								<td>
									<Select
										virtual={false}
										style={{width: '100%'}}
										// eslint-disable-next-line max-len
										onChange={(value: string) => handleChange(value, 'defaultSelect')}
										// eslint-disable-next-line max-len
										value={get(dropDownProps, 'defaultSelect', undefined)}
										// eslint-disable-next-line max-len
										mode={dropDownProps.defaultSelect ? 'multiple' : undefined}
										options={[]}
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
										type='dropdown'
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

export default DropDownProperties;
