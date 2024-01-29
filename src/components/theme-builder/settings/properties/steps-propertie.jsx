import { Input } from 'antd';
import React, {
	Dispatch,
	FC,
	SetStateAction,
	useEffect,
	useState,
} from 'react';
import { widget_type } from '../../properties-obj/widget-properties-obj';

type StepsPropertiesProps = {
	setSectionValues: Dispatch<SetStateAction<any>>;
	sectionValues: any;
	activeElement: any;
}

const StepsProperites: FC<StepsPropertiesProps> = ({
	setSectionValues,
	activeElement,
	sectionValues,
}) => {
	const [responseAPI, setResponseAPI] = useState('');
	useEffect(() => {
		setSectionValues(
			sectionValues.map((sec: {section_uid: string, row: []}) => {
				const rowRecursion = (row: any): void => {
					row.forEach((row: any) => {
						row.column.forEach((col: any) => {
							// eslint-disable-next-line max-len
							if (col.column_uid === activeElement.element.column_uid) {
								// eslint-disable-next-line max-len
								col.column_properties.flow.response_api = responseAPI;
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
	}, [responseAPI]);

	return (
		<div>
			<table>
				<tbody>
					<tr>
						<td colSpan={2} style={{padding: '0'}}>
							<thead>
								<tr>
									<th colSpan={2}>
										<p>Flow Response API</p>
									</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td colSpan={2}>
										<Input
											value={responseAPI}
											placeholder='Data Field....'
											// eslint-disable-next-line max-len
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResponseAPI(e.target.value)}
										/>
									</td>
								</tr>
							</tbody>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};

export default StepsProperites;
