import {Col, Row} from 'antd';
import React, {Dispatch, SetStateAction, FC} from 'react';
import LabelStyle from './label/label';
import Max from './min-max/max';
import Min from './min-max/min';
import ElementPlaceHolder from './placeholder/placeholder';

type TextPropertiesProps = {
	setSectionValues: Dispatch<SetStateAction<any>>;
	sectionValues: any;
	activeElement: any;
}

const TextProperties: FC<TextPropertiesProps> = ({
	setSectionValues,
	activeElement,
	sectionValues,
}) => (
	<div>
		<Row>
			<Col span={24}>
				<table>
					<thead>
						<tr>
							<th colSpan={2}>Text</th>
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
						</tr><tr>
							<td>Placeholder</td>
							<td>
								<ElementPlaceHolder
									setSectionValues={setSectionValues}
									activeElement={activeElement}
									sectionValues={sectionValues}
									type='text'
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
									type='text'
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
									type='text'
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</Col>
		</Row>
	</div>
);

export default TextProperties;
