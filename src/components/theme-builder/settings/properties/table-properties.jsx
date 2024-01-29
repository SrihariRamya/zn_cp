/* eslint-disable max-len */
import {ArrowUpOutlined, PlusCircleOutlined} from '@ant-design/icons';
import {Button, Col, Input, message, Popover, Row, Select, Switch} from 'antd';
import {isEmpty} from 'lodash';
import React, {useState, Dispatch, FC, SetStateAction, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { widgets } from '../../widget-list';
import { widget_type } from '../../properties-obj/widget-properties-obj';

type TablePropertiesProps = {
	setSectionValues: Dispatch<SetStateAction<any>>;
	sectionValues: any;
	activeElement: any;
	pageRoute: string;
}

const TableProperties:FC<TablePropertiesProps> = ({
	setSectionValues,
	activeElement,
	sectionValues,
}) => {
	const {columns, filter} = activeElement.element.column_properties.table;
	const [tableColumns, setTableColumns] = useState<any>(columns);
	const [columnName, setColumName] = useState('');
	const [dataField, setDataField] = useState('');
	const [colIndex, setColIndex] = useState<number | undefined>(undefined);
	const [isEdit, setIsEdit] = useState(false);
	const [columnAction, setColumnAction] = useState(false);
	const [columnRoute, setColumnRoute] = useState('');
	const [whereFieldName, setWhereFieldName] = useState('');
	const [changeType, setChangeType] = useState('');
	const [colWidth, setColWidth] = useState('');
	const [showFilter, setShowFilter] = useState(filter.showFilter);
	const [renderAs, setRenderAs] = useState('');
	const [targertTab, setTargetTab] = useState('');
	const [
		filterType,
		setFilterType,
	] = useState<string | string[]>(filter.filterType);
	const [
		filterOptions,
		setFilterOptions,
	] = useState<string | string[]>(filter.filterOptions);
	const columnValuesForFIlter: any = [];

	const handleColumnNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setColumName(e.target.value);
	};

	const handleDataFieldChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setDataField(e.target.value);
	};

	const handleColWidthChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setColWidth(e.target.value);
	};

	const handleColumnAction = (checked: boolean): void => {
		setColumnAction(checked);
	};

	const handleRouteChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setColumnRoute(e.target.value);
	};

	const handleWhereConditionChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setWhereFieldName(e.target.value);
	};

	const handleFilterChnage = (checked: boolean): void => {
		setShowFilter(checked);
		setChangeType('showFilter');
	};

	const handleColumnValuesForFilter = (value: string | string[]): void => {
		setFilterOptions(value);
		setChangeType('filterOptions');
	};

	const handleFilterType = (value: string | string[]): void => {
		setFilterType(value);
		setChangeType('filterType');
	};

	const handleChangeShowElementAs = (value: string): void => {
		setRenderAs(value);
	};

	const handleTabType = (value: string): void => {
		setTargetTab(value);
	};

	const onAddClick = (): void => {
		setChangeType('tableColumns');
		const data = {
			title: columnName,
			dataIndex: dataField,
			width: colWidth ? (colWidth.includes('%') ? colWidth : `${colWidth}%`) : '',
			action: columnAction,
			render_as: renderAs,
			target: targertTab,
			whereFieldName,
			columnRoute,
			filter: {
				showFilter,
				filterType,
				filterOptions,
			},
			render: (_:any, data: any) => columnAction
				? (
					<Link
						to={
							columnRoute === ''
								? `${whereFieldName}/${data[whereFieldName]}`
								: `${columnRoute}/${whereFieldName}/${data[whereFieldName]}`
						}>
						{data[dataField]}
					</Link>
				)
				: (
					<p>
						{data[dataField]}
					</p>
				),
		};
		if (isEdit && typeof colIndex !== 'undefined') {
			const copyArray = tableColumns;
			copyArray[colIndex] = data;
			setTableColumns(copyArray);
			setIsEdit(false);
			setColIndex(undefined);
		} else if (typeof colIndex === 'undefined') {
			setTableColumns([...tableColumns, data]);
		}

		setColumName('');
		setDataField('');
		setColWidth('');
		setColumnAction(false);
		message.success('Column added successfully');
	};

	if (!isEmpty(tableColumns)) {
		for (let i = 0; i < columns.length; i++) {
			columnValuesForFIlter[i] = {
				label: columns[i].title,
				value: columns[i].dataIndex,
			};
		}
	}

	useEffect(() => {
		setSectionValues(
			sectionValues.map((sec: {section_uid: string, row: []}) => {
				const rowRecursion = (row: any): void => {
					row.forEach((row: any) => {
						row.column.forEach((col: any) => {
							if (col.column_uid === activeElement.element.column_uid) {
								const obj: any = {
									showFilter,
									filterType,
									filterOptions,
								};
								if (changeType === 'tableColumns') {
									col.column_properties.table.columns = tableColumns;
								} else if (!isEmpty(changeType)) {
									col.column_properties.table.filter[changeType] = obj[changeType];
								}
							} else if (widget_type.includes(col.widget_type)) {
								if (col.column_properties[col.widget_type].row) {
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
	}, [tableColumns, showFilter, filterOptions, filterType, renderAs]);
	const types: any = [
		{
			label: 'Link',
			value: 'link',
		},
		{
			label: 'Tag',
			value: 'tag',
		},
	];
	widgets.forEach((item:any) => {
		const obj = {
			label: item.name,
			value: item.type,
		};
		types.push(obj);
	});

	return (
		<div>
			<Row>
				<Col span={24}>
					<table>
						<thead>
							<tr>
								<th colSpan={2}>Table</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>
									Filter
								</td>
								<td>
									<Switch checked={showFilter} onChange={handleFilterChnage} />
								</td>
							</tr>
							{
								showFilter && (
									<>
										<tr>
											<td>Filter Options</td>
											<td>
												<Select
													virtual={false}
													style={{ width: '100%' }}
													onChange={handleFilterType}
													value={isEmpty(filterType) ? undefined : filterType}
													mode={'multiple'}
													options={[
														{
															label: 'Filter Column',
															value: 'column-filter',
														},
														{
															label: 'Global Search',
															value: 'search-filter',
														},
													]} />
											</td>
										</tr>
										<tr>
											<td>Filter Columns</td>
											<td>
												<Select
													virtual={false}
													mode='multiple'
													style={{ width: '100%' }}
													options={columnValuesForFIlter}
													value={isEmpty(filterOptions) ? undefined : filterOptions}
													onChange={handleColumnValuesForFilter} />
											</td>
										</tr>
									</>
								)
							}
						</tbody>
					</table>
				</Col>
				<Col span={24}>
					<table>
						<thead>
							<tr>
								<th colSpan={2}>Add Columns</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Column Name</td>
								<td>
									<Input
										placeholder='Column...'
										value={columnName}
										onChange={handleColumnNameChange}
									/>
								</td>
							</tr>
							<tr>
								<td>Data Field</td>
								<td>
									<Input
										placeholder='Data Field...'
										value={dataField}
										onChange={handleDataFieldChange}
									/>
								</td>
							</tr>
							<tr>
								<td>
									Column Width
								</td>
								<td>
									<Input
										placeholder='Width(%)'
										value={colWidth}
										onChange={handleColWidthChange}
									/>
								</td>
							</tr>
							<tr>
								<td>Show As</td>
								<td>
									<Select
										virtual={false}
										style={{width: '100%'}}
										options={types}
										onChange={handleChangeShowElementAs}
										value={renderAs || undefined}
									/>
								</td>
							</tr>
							{ renderAs === 'link' && (
								<tr>
									<td>Target</td>
									<td>
										<Select
											virtual={false}
											style={{width: '100%'}}
											options={[
												{
													label: 'New Tab',
													value: '_blank',
												},
												{
													label: 'Same Tab',
													value: '_self',
												},
											]}
											onChange={handleTabType}
											value={targertTab || undefined}
										/>
									</td>
								</tr>
							)}
							<tr>
								<td>Action</td>
								<td>
									<Switch
										checked={columnAction}
										onChange={handleColumnAction}
									/>
								</td>
							</tr>
							{
								columnAction && (
									<>
										<tr>
											<td>Route</td>
											<td>
												<Input
													value={columnRoute}
													placeholder='Route'
													onChange={handleRouteChange}
												/>
											</td>
										</tr>
										<tr>
											<td>
												<p>Where</p>
												<small>(Field Name)</small>
											</td>
											<td>
												<Input
													value={whereFieldName}
													placeholder='Field Name..'
													onChange={handleWhereConditionChange}
												/>
											</td>
										</tr>
										<tr>
											<td>Download</td>
											<td>
												<Select
													virtual={false}
													style={{width: '100%'}}
													options={[
														{
															value: 'xlsx',
															label: 'XLSX',
														},
														{
															value: 'pdf',
															label: 'PDF',
														},
													]}
												/>
											</td>
										</tr>
									</>
								)
							}
							<tr>
								<td colSpan={2}>
									<div style={{display: 'flex', justifyContent: 'flex-end'}}>
										<Button
											icon={ isEdit ? <ArrowUpOutlined /> : <PlusCircleOutlined />}
											size='large'
											type='primary'
											disabled={!(
												columnName !== ''
												&& dataField !== ''
											)}
											onClick={onAddClick}
										>{isEdit ? 'Update' : 'Add'}</Button>
									</div>
								</td>
							</tr>
							<tr>
								<td colSpan={2} style={{padding: '0', cursor: 'pointer'}}>
									<table>
										<thead>
											<tr>
												<th>Column Name</th>
												<th>Data Field</th>
											</tr>
										</thead>
										<tbody>
											{
												!isEmpty(tableColumns) && (
													tableColumns.map((data: any, index: number) => (
														<Popover
															key={index}
															trigger='hover'
															content={<p>Click to edit {data.title}</p>}
															placement='topLeft'
														>
															<tr onClick={() => {
																setColumName(data.title);
																setDataField(data.dataIndex);
																setColWidth(data.width);
																setColumnAction(data.action);
																setColumnRoute(data.columnRoute);
																setWhereFieldName(data.whereFieldName);
																setRenderAs(data.render_as);
																setTargetTab(data.target);
																setColIndex(index);
																setIsEdit(true);
															}}>
																<td>{data.title}</td>
																<td>{data.dataIndex}</td>
															</tr>
														</Popover>
													))
												)
											}
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
				</Col>
			</Row>
		</div>
	);
};

export default TableProperties;
