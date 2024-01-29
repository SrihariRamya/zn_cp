/* eslint-disable max-len */
import {Col, Row, Input, Radio, RadioChangeEvent, Switch, InputNumber, Select} from 'antd';
import React, {Dispatch, SetStateAction, FC, useState, useEffect} from 'react';
import { widget_type } from '../../properties-obj/widget-properties-obj';
import { uploadFile } from '../../../api/api';

type ImagePropertiesProps = {
	setSectionValues: Dispatch<SetStateAction<any>>;
	sectionValues: any;
	activeElement: any;
}
const ImageProperties: FC<ImagePropertiesProps> = ({
	setSectionValues,
	activeElement,
	sectionValues,
}) => {
	const {image} = activeElement.element.column_properties;
	const {src, preview, height, width, alt, img_style: {objectFit}} = image;
	const [logoChoosenMethod, setLogoChoosenMethod] = useState(1);
	const [img, setImg] = useState(src);
	const [imagePreview, setImagePreview] = useState(preview);
	const [imgHeight, setImgHeight] = useState(height);
	const [imgWidth, setImgWidth] = useState(width);
	const [altMsg, setAltMsg] = useState(alt);
	const [ImgFit, setImgFit] = useState(objectFit);

	const handleImageChoose = (e:RadioChangeEvent): void => {
		setLogoChoosenMethod(e.target.value);
	};

	const handleImg = (e: any): any => {
		setImg(e.target.value);
	};

	const handleFileInput = (e:any): void => {
		uploadFile(e.target.files[0]).then(async res => {
			setImg(`${res}`);
		});
	};

	const handleImagePreview = (value: boolean): any => {
		setImagePreview(value);
	};

	const handleImgHeight = (value: any): any => {
		setImgHeight(value);
	};

	const handleImgWidth = (value: any): any => {
		setImgWidth(value);
	};

	const handleAlterMsg = (value: any): any => {
		setAltMsg(value);
	};

	const handleObjectFit = (value: any): any => {
		setImgFit(value);
	};

	useEffect(() => {
		setSectionValues(
			sectionValues.map((sec: {section_uid: string, row: []}) => {
				const rowRecursion = (row: any): void => {
					row.forEach((row: any) => {
						row.column.forEach((col: any) => {
							const obj:any = {
								src: img,
								preview: imagePreview,
								height: imgHeight,
								width: imgWidth,
								alt: altMsg,
								img_style: {
									objectFit: ImgFit,
								},
							};
							const value = obj;
							if (col.column_uid === activeElement.element.column_uid) {
								col.column_properties.image = value;
							} else if (widget_type.includes(col.widget_type)) {
								if (col.column_properties[col.widget_type].row) {
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
	}, [img,
		imagePreview,
		imgHeight,
		imgHeight,
		altMsg,
		ImgFit]);

	return (
		<div>
			<Row>
				<Col span={24}>
					<table>
						<thead>
							<tr>
								<th colSpan={2}>Image Properties</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Image</td>
								<td>
									<Radio.Group
										onChange={handleImageChoose}
										value={logoChoosenMethod}>
										<Radio
											value={1}
											defaultChecked
										>From URl</Radio>
										<Radio value={2}>From Local</Radio>
									</Radio.Group>
								</td>
							</tr>
							{logoChoosenMethod === 1
								? <tr>
									<td>Paste Image URL</td>
									<td>
										<Input
											value={img}
											onChange = {handleImg}
											placeholder='Image URL'/>
									</td>
								</tr>
								: <tr>
									<td>Choose Image</td>
									<td>
										<input
											type='file' style={{width: '165px'}}
											onChange={ handleFileInput }
										/>
									</td>
								</tr>}
							<tr>
								<td>Preview</td>
								<td>
									<Switch
										checked={imagePreview}
										onChange={handleImagePreview}
									/>
								</td>
							</tr>
							<tr>
								<td>Height</td>
								<td>
									<InputNumber
										value={imgHeight}
										onChange={(value: number | null) => handleImgHeight(value)}
										min={0}
										style={{width: '100%'}}
									/>
								</td>
							</tr>
							<tr>
								<td>Width</td>
								<td>
									<InputNumber
										value={imgWidth}
										onChange={(value: number | null) => handleImgWidth(value)}
										min={0}
										style={{width: '100%'}}
									/>
								</td>
							</tr>
							<tr>
								<td>Description</td>
								<td>
									<Input
										value={altMsg}
										onChange={handleAlterMsg}
									/>
								</td>
							</tr>
							<tr>
								<td>ObjectFit</td>
								<td>
									<Select
										virtual={false}
										style={{ width: '100%' }}
										value={ImgFit}
										onChange={handleObjectFit}
										options={[
											{
												value: 'contain',
												label: 'contain',
											},
											{
												value: 'cover',
												label: 'cover',
											},
											{
												value: 'fill',
												label: 'fill',
											},
											{
												value: 'none',
												label: 'none',
											},
											{
												value: 'scale-down',
												label: 'scale-down',
											},
											{
												value: 'unset',
												label: 'unset',
											},
										]}
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

export default ImageProperties;
