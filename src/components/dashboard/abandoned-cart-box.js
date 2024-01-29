import React from 'react';
import { Col, Row, DatePicker, Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { get } from 'lodash';
import { Doughnut } from 'react-chartjs-2';
import { shortenValues } from '../../shared/function-helper';
import { selectOptionData } from '../../shared/constant-values';
import cart from '../../assets/images/cart.svg';

const { RangePicker } = DatePicker;

function AbandonedCartBox(properties) {
  const {
    abandoned,
    abandonedCustomized,
    abandonedValue,
    handleAbandonedChanges,
    abandonedSelectType,
    handleClickCloseIcon,
  } = properties;
  const doughnutChartData = {
    labels: ['Sum of abandoned products', 'Sum of abandoned Value'],
    datasets: [
      {
        label: '# of Votes',
        data: [25, 75],
        backgroundColor: ['#0B3D60', '#C8BFE7'],
        borderColor: ['#FFFFFF'],
        borderWidth: 3,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.1,
    hover: { mode: false },
    plugins: {
      tooltip: {
        enabled: false, // <-- this option disables tooltips
      },
      legend: {
        display: false,
      },
    },
  };
  return (
    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
      <div className="store-detail-box">
        <Row>
          <Col span={12}>
            <div className={abandonedCustomized ? '' : 'd-flex'}>
              <img src={cart} alt="cart" />
              {abandonedCustomized ? undefined : (
                <p className="card-title">Abandoned Cart</p>
              )}
            </div>
          </Col>
          <Col span={12}>
            <div className="float-right">
              {abandonedCustomized === false ? (
                <Select
                  defaultValue="last_week"
                  className="select-common-cls"
                  value={abandonedValue}
                  onChange={handleAbandonedChanges}
                  onSelect={abandonedSelectType}
                  options={selectOptionData}
                />
              ) : (
                <div className="button">
                  <RangePicker
                    format="DD-MM-YYYY"
                    onChange={(date) =>
                      handleAbandonedChanges('customized', date)
                    }
                  />
                  &nbsp;&nbsp;
                  <CloseOutlined
                    onClick={() => handleClickCloseIcon('abandoned')}
                  />
                </div>
              )}
            </div>
          </Col>
        </Row>
        <div>
          <Row className="top-customer">
            <Col span={12}>
              <div style={{ display: 'flex' }}>
                <p className="abandoned-color-blue" />
                <p>
                  <span>{get(abandoned, 'products', 0)}</span>{' '}
                </p>
              </div>
              <span className="abandoned-text">Abandoned products</span>
            </Col>
            <Col span={12} className="top-customer-right">
              <div>
                <div style={{ display: 'flex' }}>
                  <p className="abandoned-color-pink" />
                  <p>
                    <span>{shortenValues(get(abandoned, 'total', 0))}</span>{' '}
                  </p>
                </div>
                <span className="abandoned-text">Abandoned Value</span>
              </div>
            </Col>
          </Row>
          <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
        </div>
      </div>
    </Col>
  );
}
export default AbandonedCartBox;
