import { message, Select } from 'antd';
import { isEmpty } from 'lodash';
import React, {
	Dispatch,
	SetStateAction,
	useEffect,
	useState,
	FC,
} from 'react';
import { getAPI } from '../../../api/api';
import { widget_type } from '../../properties-obj/widget-properties-obj';

type LookupPropertiesProps = {
	setSectionValues: Dispatch<SetStateAction<any>>;
	sectionValues: any;
	activeElement: any;
    type: string;
}
const LookupProperties: FC<LookupPropertiesProps> = ({
	setSectionValues,
	activeElement,
	sectionValues,
	type,
}) => {
	const data = activeElement.element.column_properties[type];
	const {lookups = {
		lookup_type: '',
		lookup_name: '',
		lookup_query: '',
		lookup_values: [],
	}} = data;
	// eslint-disable-next-line no-unused-vars
	const {lookup_type, lookup_name, lookup_query} = lookups;
	const [lookupName, setLookupName] = useState(lookup_name);
	const [changeType, setChangeType] = useState('');
	const [lookupType, setLookupType] = useState(lookup_type || 'static');
	// eslint-disable-next-line max-len
	const [lookupOptions, setLookupOptions] = useState<{label: string;value: string;}[]>([]);

	const handleChange = (value: string | string[], type: string): void => {
		if (type) {
			// eslint-disable-next-line default-case
			switch (type) {
				case 'lookup_name': setLookupName(value);
					break;
				case 'lookup_type': setLookupType(value);
					break;
			}

			setChangeType(type);
		}
	};

	useEffect(() => {
		if (lookupType) {
			getAPI('/lookups').then((res: any) => {
				if (res.data.success) {
					const {data} = res.data;
					if (!isEmpty(data)) {
						let lookups = [];
						if (lookupType === 'static') {
							// eslint-disable-next-line max-len
							lookups = data.filter((item: any) => item.type !== 'dynamic');
						} else if (lookupType === 'dynamic') {
							// eslint-disable-next-line max-len
							lookups = data.filter((item: any) => item.type === 'dynamic');
						}

						// eslint-disable-next-line no-negated-condition
						if (!isEmpty(lookups)) {
							const values = [];
							for (const lookup of lookups) {
								values.push({
									label: lookup.name,
									value: lookup.name,
								});
							}

							setLookupOptions(values);
						} else {
							setLookupOptions([]);
						}
					}
				}
			}).catch(() => {
				message.error('Something went wrong while loading Lookups');
				setLookupOptions([]);
			});
		}

		setSectionValues(
			sectionValues.map((sec: { section_uid: string, row: [] }) => {
				const columnRecursion = (row: any): void => {
					row.forEach((row: any) => {
						row.column.forEach((col: any) => {
							// eslint-disable-next-line max-len
							if (col.column_uid === activeElement.element.column_uid) {
								const { lookups } = col.column_properties[type];
								if (!lookups) {
									// eslint-disable-next-line max-len
									col.column_properties[type] = {...col.column_properties[type], lookups: {lookup_type: '', lookup_name: '', lookup_query: ''}};
								}

								const obj: any = {
									lookup_name: lookupName,
									lookup_type: lookupType,
								};
								if (!isEmpty(changeType)) {
									lookups[changeType] = obj[changeType];
								}
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
	}, [lookupName, lookupType]);

	return (
		<table>
			<thead>
				<tr>
					<th colSpan={2}>Lookups</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Lookup Type</td>
					<td>
						<Select
							virtual={false}
							style={{width: '100%'}}
							value={lookupType}
							// eslint-disable-next-line max-len
							onChange={(value: string) => handleChange(value, 'lookup_type')}
							options={[
								{
									value: 'static',
									label: 'Static',
								},
								{
									value: 'dynamic',
									label: 'Dynamic',
								},
							]}
						/>
					</td>
				</tr>
				<tr>
					<td>Lookup Name</td>
					<td>
						<Select
							virtual={false}
							placeholder='Lookup Name...'
							style={{width: '100%'}}
							options={lookupOptions}
							value={lookupName}
							showSearch
							// eslint-disable-next-line max-len
							onChange={(value: string) => handleChange(value, 'lookup_name')}
						/>
					</td>
				</tr>
			</tbody>
		</table>
	);
};

export default LookupProperties;
