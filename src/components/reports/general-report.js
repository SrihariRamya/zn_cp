import React, { useState, useEffect } from 'react';
import { Card, Row, Col, notification, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { get } from 'lodash';
import { FAILED_TO_LOAD } from '../../shared/constant-values';
import { getAllReports } from '../../utils/api/url-helper';

const { Meta } = Card;
function Generalreport() {
  const [loading, setLoading] = useState(false);
  const [reportdata, setreportdata] = useState([]);
  const history = useNavigate();

  const fetchData = () => {
    setLoading(true);
    getAllReports()
      .then((response) => {
        setreportdata(get(response, 'data', []));
        setLoading(false);
      })
      .catch(() => {
        notification.error({ message: FAILED_TO_LOAD });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const viewDetails = (data) => {
    const reportData = {
      view_name: data.view_name,
      report_id: data.report_id,
      report_name: data.report_name,
      report_columns: data.report_columns,
      tagname: 'report',
      attrib_columns: 'report_columns',
    };
    history({
      pathname: `/reports/report-details`,
      state: { reportData },
    });
  };
  return (
    <Spin spinning={loading}>
      <div className="box">
        <div className="box__header bg-gray-lighter">
          <h3 className="box-title">General Reports</h3>
        </div>
        <div className="box-content-background">
          <div className="card-container report">
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
              {reportdata.map((data) => (
                <Col
                  className="gutter-row"
                  xs={24}
                  sm={24}
                  md={6}
                  lg={6}
                  xl={6}
                >
                  <Card
                    className="report-card"
                    onClick={() => {
                      viewDetails(data);
                    }}
                  >
                    <Meta
                      title={
                        <span className="text-green-dark">
                          {get(data, 'report_name', '')}
                        </span>
                      }
                      description={
                        <span className="text-grey-light">
                          {get(data, 'report_description', '')}
                        </span>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </div>
    </Spin>
  );
}

export default Generalreport;
