import { Col, Input, Select } from 'antd';
import { get } from 'lodash';
import React, {
	Dispatch,
	FC,
	SetStateAction,
	useEffect,
	useState,
} from 'react';
import { widget_type } from '../../../properties-obj/widget-properties-obj';

type ColActionProps = {
	setSectionValues: Dispatch<SetStateAction<any>>;
	sectionValues: any;
	activeElement: any;
}

const ColAction: FC<ColActionProps> = ({
	setSectionValues,
	sectionValues,
	activeElement,
}: ColActionProps): any => {
	const {column_properties, widget_type: widget} = activeElement.element;
	const {action = {
		action_api: '',
		action_type: '',
		api_type: '',
		action_route: '',
		variable_name: '',
		reference_name: '',
		reference_value: '',
		value: '',
	},
	} = column_properties;
	const [colAction, setColAction] = useState(action);
	const handleChange = (value: string, type: string): void => {
		if (type) {
			setColAction((prev: any) => ({ ...prev, [type]: value}));
		}
	};

	useEffect(() => {
		setSectionValues(
			sectionValues.map((sec: {section_uid: string, row: []}) => {
				const rowRecursion = (row: any): any => {
					row.forEach((row: any) => {
						row.column.forEach((col: any) => {
							// eslint-disable-next-line max-len
							if (col.column_uid === activeElement.element.column_uid) {
								col.column_properties.action = colAction;
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
						return row;
					});
				};

				if (sec.section_uid === activeElement.section_uid) {
					rowRecursion(sec.row);
				}

				return sec;
			}),
		);
	}, [
		colAction,
	]);

	return (
		<Col span={24}>
			<table>
				<thead>
					<tr>
						<th colSpan={2}>Action Properties</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Variable name</td>
						<td>
							<Input
								onChange={
									// eslint-disable-next-line max-len
									(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'variable_name')}
								value={get(colAction, 'variable_name', '')}
							/>
						</td>
					</tr>
					<tr>
						<td>Reference name</td>
						<td>
							<Input
								// eslint-disable-next-line max-len
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'reference_name')}
								value={get(colAction, 'reference_name', '')}
							/>
						</td>
					</tr>
					<tr>
						<td>Route</td>
						<td>
							<Input
								value={get(colAction, 'action_route', '')}
								placeholder='Route'
								// eslint-disable-next-line max-len
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'action_route')}
							/>
						</td>
					</tr>
					<tr>
						<td>Action Type</td>
						<td>
							<Select
								value={get(colAction, 'action_type', '')}
								virtual={false}
								style={{width: '100%'}}
								options={[
									{
										label: 'UI',
										value: 'ui',
									},
									{
										label: 'API',
										value: 'api',
									},
								]}
								// eslint-disable-next-line max-len
								onChange={(value: string) => handleChange(value, 'action_type')}
							/>
						</td>
					</tr>
					<tr>
						<td>
							<p>API</p>
						</td>
						<td>
							<Input
								placeholder='API'
								value={get(colAction, 'action_api', '')}
								// eslint-disable-next-line max-len
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'action_api')}
							/>
						</td>
					</tr>
					<tr>
						<td>
							<p>API Type</p>
						</td>
						<td>
							<Select
								style={{width: '100%'}}
								virtual={false}
								value={get(colAction, 'api_type', '')}
								options={[
									{
										label: 'GET',
										value: 'GET',
									},
									{
										label: 'POST',
										value: 'POST',
									},
									{
										label: 'PUT',
										value: 'PUT',
									},
									{
										label: 'DELETE',
										value: 'DELETE',
									},
								]}
								// eslint-disable-next-line max-len
								onChange={(value: string) => handleChange(value, 'api_type')}
							/>
						</td>
					</tr>
					<tr>
						<td>Reference Value</td>
						<td>
							{
								widget === 'button' ? (
									<Select
										virtual={false}
									// eslint-disable-next-line max-len
										value={get(colAction, 'reference_value', '')}
										// eslint-disable-next-line max-len
										onChange={(value: string) => handleChange(value, 'reference_value')}
										style={{width: '100%'}}
										options={[
											{
												label: 'True',
												value: 'true',
											},
											{
												label: 'False',
												value: 'false',
											},
										]}
									/>
								) : (
									<Input
										// eslint-disable-next-line max-len
										value={get(colAction, 'reference_value', '')}
										// eslint-disable-next-line max-len
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, 'reference_value')}
										minLength={0}
									/>
								)
							}
						</td>
					</tr>
				</tbody>
			</table>
		</Col>
	);
};

export default ColAction;
