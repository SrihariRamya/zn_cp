import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Col, Input, Popover, Row, Switch } from 'antd';
import moment from 'moment';
import React, {
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
  FC,
} from 'react';
import { widget_type } from '../../properties-obj/widget-properties-obj';
import LabelStyle from './label/label';
import MaxDate from './min-max/max-date';
import MinDate from './min-max/min-date';
import ElementPlaceHolder from './placeholder/placeholder';

type DatePropertiesProperties = {
  setSectionValues: Dispatch<SetStateAction<any>>,
  sectionValues: any,
  activeElement: any,
};

const DateProperties: FC<DatePropertiesProperties> = ({
  setSectionValues,
  activeElement,
  sectionValues,
}) => {
  const { date } = activeElement.element.column_properties;
  const [showTimeProperties, setShowTimeProperties] = useState(date.showTime);
  const [userFormat, setUserFormat] = useState(date.dateFormat);
  const [changeType, setChangeType] = useState('');
  const [userFormatdDate, setUserFormatdDate] = useState('');
  const Todatdate = new Date();
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span>
        <b>DD - </b> {Todatdate.toLocaleString('default', { day: '2-digit' })}{' '}
      </span>
      <span>
        <b>ddd - </b>{' '}
        {Todatdate.toLocaleString('default', { weekday: 'short' })}{' '}
      </span>
      <span>
        <b>dddd - </b>{' '}
        {Todatdate.toLocaleString('default', { weekday: 'long' })}{' '}
      </span>
      <span>
        <b>MM - </b> {Todatdate.toLocaleString('default', { month: '2-digit' })}{' '}
      </span>
      <span>
        <b>mmm - </b> {Todatdate.toLocaleString('default', { month: 'short' })}{' '}
      </span>
      <span>
        <b>MMMM - </b> {Todatdate.toLocaleString('default', { month: 'long' })}{' '}
      </span>
      <span>
        <b>YYYY - </b>{' '}
        {Todatdate.toLocaleString('default', { year: 'numeric' })}{' '}
      </span>
      <span>
        <b>yy - </b> {Todatdate.toLocaleString('default', { year: '2-digit' })}{' '}
      </span>
      <span>
        <b>yyyy - </b>{' '}
        {Todatdate.toLocaleString('default', { year: 'numeric' })}{' '}
      </span>
      <span>
        <a
          href="https://momentjs.com/docs/#/displaying/format/"
          target="_blank"
          rel="moment js noreferrer"
        >
          For more details....
        </a>
      </span>
    </div>
  );

  const toggeleTimeProperties = (checked: boolean): void => {
    setChangeType('time');
    setShowTimeProperties(checked);
  };

  const handleDateFormat = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setChangeType('date');
    const { value } = e.target;
    setUserFormat(value);
    setUserFormatdDate(value ? moment(new Date()).format(value) : '');
  };

  useEffect(() => {
    setSectionValues(
      sectionValues.map((sec: { section_uid: string, row: [] }) => {
        const rowRecursion = (row: any): void => {
          row.forEach((row: any) => {
            row.column.forEach((col: any) => {
              // eslint-disable-next-line max-len
              if (col.column_uid === activeElement.element.column_uid) {
                const { date } = col.column_properties;

                if (changeType === 'date') {
                  date.dateFormat = userFormat;
                  return col;
                }

                if (changeType === 'time') {
                  date.showTime = showTimeProperties;
                  return col;
                }
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
      })
    );
  }, [userFormat, showTimeProperties]);

  return (
    <div>
      <Row>
        <Col span={24}>
          <table>
            <thead>
              <tr>
                <th colSpan={2}>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={2} style={{ padding: '0' }}>
                  <LabelStyle
                    setSectionValues={setSectionValues}
                    activeElement={activeElement}
                    sectionValues={sectionValues}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center',
                    }}
                  >
                    <span>Date Format</span>
                    <Popover content={content} trigger="hover">
                      <ExclamationCircleOutlined />
                    </Popover>
                  </div>
                </td>
                <td>
                  <Input onChange={handleDateFormat} />
                  <span>
                    <small>{userFormatdDate}</small>
                  </span>
                </td>
              </tr>
              <tr>
                <td>Placeholder</td>
                <td>
                  <ElementPlaceHolder
                    setSectionValues={setSectionValues}
                    activeElement={activeElement}
                    sectionValues={sectionValues}
                    type="date"
                  />
                </td>
              </tr>
              <tr>
                <td>Show Time</td>
                <td>
                  <Switch
                    checked={showTimeProperties}
                    onChange={toggeleTimeProperties}
                  />
                </td>
              </tr>
              <tr>
                <td>Min Date</td>
                <td>
                  <MinDate
                    format={userFormat}
                    setSectionValues={setSectionValues}
                    activeElement={activeElement}
                    sectionValues={sectionValues}
                  />
                </td>
              </tr>
              <tr>
                <td>Max Date</td>
                <td>
                  <MaxDate
                    format={userFormat}
                    setSectionValues={setSectionValues}
                    activeElement={activeElement}
                    sectionValues={sectionValues}
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

export default DateProperties;
