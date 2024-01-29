import {Col, Row, Select} from 'antd';
import React, {useState, useEffect, Dispatch, SetStateAction, FC} from 'react';
import { widget_type } from '../../properties-obj/widget-properties-obj';
import LabelStyle from './label/label';
import LookupProperties from './lookup-properties';

type RadioPropertiesProps = {
	setSectionValues: Dispatch<SetStateAction<any>>;
	sectionValues: any;
	activeElement: any;
}

const RadioProperties: FC<RadioPropertiesProps> = ({
	setSectionValues,
	activeElement,
	sectionValues,
}) => {
	const {radio} = activeElement.element.column_properties;
	const {defaultValue, optionType, buttonStyle} = radio;
	const [defaultOption, setDefaultOption] = useState(defaultValue);
	const [radioOptionType, setRadioOptionType] = useState(optionType);
	const [showbuttonStyles, setShowButtonStyles] = useState(false);
	const [radiobuttonStyle, setRadioButtonStyle] = useState(buttonStyle);
	const [changeType, setChangeType] = useState('');

	const handleOptionType = (value: string): void => {
		setRadioOptionType(value);
		setChangeType('optionType');
		if (value === 'button') {
			setShowButtonStyles(true);
		} else if (value === 'default') {
			setShowButtonStyles(false);
		}
	};

	const handleRadioButtonStyle = (value: string): void => {
		setRadioButtonStyle(value);
		setChangeType('buttonStyle');
	};

	const handleDefaultOption = (value: string): void => {
		setDefaultOption(value);
		setChangeType('defaultValue');
	};

	useEffect(() => {
		setSectionValues(
			sectionValues.map((sec: {section_uid: string, row: []}) => {
				const obj: any = {
					defaultValue: defaultOption,
					buttonStyle: radiobuttonStyle,
					optionType: radioOptionType,
				};
				const value = obj[changeType];
				const rowRecursion = (row: any): void => {
					row.forEach((row: any) => {
						row.column.forEach((col: any) => {
							// eslint-disable-next-line max-len
							if (col.column_uid === activeElement.element.column_uid) {
								col.column_properties.radio[changeType] = value;
								return col;
							// eslint-disable-next-line no-else-return
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
		radioOptionType,
		radiobuttonStyle,
	]);

	return (
		<div>
			<Row>
				<Col span={24}>
					<table>
						<thead>
							<tr>
								<th colSpan={2}>Radio</th>
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
								<td>Option Type</td>
								<td>
									<Select
										virtual={false}
										style={{width: '100%'}}
										onChange={handleOptionType}
										defaultValue={defaultValue}
										options={[
											{
												value: 'default',
												label: 'Default',
											},
											{
												value: 'button',
												label: 'Button',
											},
										]}
									/>
								</td>
							</tr>
							{
								showbuttonStyles && (
									<tr>
										<td>Button Type</td>
										<td>
											<Select
												virtual={false}
												style={{width: '100%'}}
												onChange={
													handleRadioButtonStyle}
												defaultValue={buttonStyle}
												options={[
													{
														value: 'outline',
														label: 'Outline',
													},
													{
														value: 'solid',
														label: 'Solid',
													},
												]}
											/>
										</td>
									</tr>
								)
							}
							<tr>
								<td>Default Value</td>
								<td>
									<Select
										virtual={false}
										style={{width: '100%'}}
										onChange={handleDefaultOption}
										value={defaultValue}
										defaultValue='default'
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
										type='radio'
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

export default RadioProperties;
