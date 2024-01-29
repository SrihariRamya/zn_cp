/* eslint-disable max-len */
import {Col, InputNumber, Row, Select, Switch} from 'antd';
import React, {Dispatch, SetStateAction, FC, useState, useEffect} from 'react';
import LabelStyle from './label/label';
import { widget_type } from '../../properties-obj/widget-properties-obj';

type FileUploadPropertiesProps = {
	setSectionValues: Dispatch<SetStateAction<any>>;
	sectionValues: any;
	activeElement: any;
}

const FileUploadProperties: FC<FileUploadPropertiesProps> = ({
	setSectionValues,
	activeElement,
	sectionValues,
}) => {
	const {upload} = activeElement.element.column_properties;
	const {
		max_size,
		file_type,
		size_type,
		max_count,
		multiple,
		upload_type,
	} = upload;

	const [uploadType, setUploadType] = useState(upload_type);
	const [fileType, setFileType] = useState(file_type);
	const [changeType, setChangeType] = useState('');
	const [maxFileSize, setMaxFileSize] = useState(max_size);
	const [fileSizeType, setFileSizeType] = useState(size_type);
	const [maxCount, setMaxCount] = useState(max_count);
	const [multipleSelect, setMultipleSelect] = useState(multiple);
	const [options, setOptions] = useState([]);
	const typeOptions: any = {
		all: [
			{
				value: '.png',
				label: 'PNG',
			},
			{
				value: '.jpg,jpeg',
				label: 'JPG or JPEG',
			},
			{
				value: '.mp3',
				label: 'MP3',
			},
			{
				value: '.mkv',
				label: 'MKV',
			},
			{
				value: '.pdf',
				label: 'PDF',
			},
			{
				value: '.doc',
				label: 'DOC',
			},
			{
				value: '.docx',
				label: 'DOCX',
			},
			{
				value: '.ppt',
				label: 'PPT',
			},
		],
		image: [
			{
				value: '.all',
				label: 'All',
			},
			{
				value: '.png',
				label: 'PNG',
			},
			{
				value: '.jpg,jpeg',
				label: 'JPG or JPEG',
			},
		],
		video: [
			{
				value: '.all',
				label: 'All',
			},
			{
				value: '.mp3',
				label: 'MP3',
			},
			{
				value: '.mkv',
				label: 'MKV',
			},
		],
		file: [
			{
				value: '.all',
				label: 'All',
			},
			{
				value: '.pdf',
				label: 'PDF',
			},
			{
				value: '.doc',
				label: 'DOC',
			},
			{
				value: '.docx',
				label: 'DOCX',
			},
			{
				value: '.ppt',
				label: 'PPT',
			},
		],
	};

	const handleChange = (value: string | string[] | number| null | boolean, type: string): void => {
		if (type && value !== null) {
			setChangeType(type);
			// eslint-disable-next-line default-case
			switch (type) {
				case 'max_size':
					setMaxFileSize(value);
					break;
				case 'file_type':
					setFileType(value);
					break;
				case 'size_type':
					setFileSizeType(value);
					break;
				case 'max_count':
					setMaxCount(value);
					break;
				case 'multiple':
					setMultipleSelect(value);
					break;
				case 'upload_type':
					setUploadType(value);
					break;
			}
		}
	};

	useEffect(() => {
		if (changeType) {
			setSectionValues(
				sectionValues.map((sec: {section_uid: string, row: []}) => {
					const rowRecursion = (row: any): void => {
						row.forEach((row: any) => {
							row.column.forEach((col: any) => {
								const obj:any = {
									max_size: maxFileSize,
									file_type: fileType,
									size_type: fileSizeType,
									max_count: maxCount,
									upload_type: uploadType,
									multiple: multipleSelect,
								};
								if (col.column_uid === activeElement.element.column_uid) {
									col.column_properties.upload[changeType] = obj[changeType];
								} else if (widget_type.includes(col.widget_type) && (col.column_properties[col.widget_type].row)) {
									rowRecursion(col.column_properties[col.widget_type].row);
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
		}

		if (uploadType) {
			setOptions(typeOptions[uploadType]);
		}
	}, [
		uploadType,
		maxFileSize,
		fileSizeType,
		fileType,
		maxCount,
		multipleSelect,
	]);

	return (
		<div>
			<Row>
				<Col span={24}>
					<table>
						<thead>
							<tr>
								<th colSpan={2}>File Upload</th>
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
								<td>Upload Type</td>
								<td>
									<Select
										virtual={false}
										style={{width: '100%'}}
										onChange={(value: string) => handleChange(value, 'upload_type')}
										value={uploadType || undefined}
										options={[
											{
												value: 'all',
												label: 'All',
											},
											{
												value: 'file',
												label: 'File',
											},
											{
												value: 'image',
												label: 'Image',
											},
											{
												value: 'video',
												label: 'Video',
											},
										]}
									/>
								</td>
							</tr>
							<tr>
								<td>File Type</td>
								<td>
									<Select
										virtual={false}
										style={{width: '100%'}}
										mode='multiple'
										options={options}
										onChange={(value: string | string[]) => handleChange(value, 'file_type')}
										value={fileType || undefined}
									/>
								</td>
							</tr>
							<tr>
								<td>Max Size</td>
								<td>
									<Row>
										<Col span={10}>
											<InputNumber
												value={maxFileSize || null}
												onChange={(value: number | null) => handleChange(value, 'max_size')}
											/>
										</Col>
										<Col span={14}>
											<Select
												virtual={false}
												style={{width: '100%'}}
												onChange={(value: string) => handleChange(value, 'size_type')}
												value={fileSizeType || undefined}
												options={[
													{
														value: '',
														label: 'None',
													},
													{
														value: 'kb',
														label: 'KB',
													},
													{
														value: 'mb',
														label: 'MB',
													},
												]}
											/>
										</Col>
									</Row>
								</td>
							</tr>
							<tr>
								<td>Max Count</td>
								<td>
									<InputNumber
										onChange={(value: number | null) => handleChange(value, 'max_count')}
										min={0}
										value={maxCount || null}
									/>
								</td>
							</tr>
							<tr>
								<td>Multiple Select</td>
								<td>
									<Switch
										checked={multipleSelect}
										onChange={(value: boolean) => handleChange(value, 'multiple')}
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

export default FileUploadProperties;
