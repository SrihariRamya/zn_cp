import React, { useContext, useEffect, useState } from 'react';
import { Button, Input, Spin, notification, Empty } from 'antd';
import '../zupain-help.less';
import { SearchOutlined } from '@ant-design/icons';
import { get, isEmpty } from 'lodash';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import Slider from 'react-slick';
import { TenantContext } from '../../context/tenant-context';
import { ReactComponent as PlayIcon } from '../../../assets/icons/play-icon.svg';
import FaqAnswers from './faq-answers';
import HelpHeader from '../help-header';

function FrequentlyAskedQuestions(properties) {
  const {
    showHeader = true,
    showCategory = true,
    module,
    mobileView,
  } = properties;
  const [loading, setLoading] = useState(false);
  const [faqData, setFaqData] = useState([]);
  const [faqCategories, setFaqCategories] = useState([]);
  const [isShowAnswer, setIsShowAnswer] = useState(false);
  const [selectedFaqData, setSelectedFaqData] = useState({});
  const tenantConfig = useContext(TenantContext)[3];

  const isFaq = module === 'FAQ';

  const settings = {
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 3,
    slidesToScroll: 3,
    autoplay: true,
  };

  const adminUrl = get(tenantConfig, 'masterAdmin.master_url', '');
  const token = CryptoJS.AES.encrypt(
    `${get(tenantConfig, 'masterAdmin.MASTER_ADMIN_VALUE', '')}`,
    `${get(tenantConfig, 'masterAdmin.MASTER_ADMIN_SECRET', '')}`
  ).toString();
  const headerValue = {
    headers: {
      masteradminheader: `Bearer ${token}`,
    },
  };

  const fetchData = async (categoryId) => {
    setLoading(true);
    try {
      const getCategoryList = await axios.get(
        `${adminUrl}faq/faq-category`,
        headerValue
      );
      if (getCategoryList.data.success) {
        setFaqCategories(get(getCategoryList, 'data.data', []));
        try {
          const apiUrl = categoryId
            ? `faq/faq-list/${categoryId}`
            : 'faq/faq-list';
          const getFaqByCategory = await axios.get(
            `${adminUrl}${apiUrl}`,
            headerValue
          );
          if (getFaqByCategory.data.success) {
            setFaqData(get(getFaqByCategory, 'data.data', []));
            setLoading(false);
          }
        } catch (error) {
          notification.error({
            message:
              error.message || 'Some error occurred while getting the result',
          });
          setLoading(false);
        }
      }
    } catch (error) {
      notification.error({
        message:
          error.message || 'Some error occurred while getting the result',
      });
      setLoading(false);
    }
  };

  const filterFaqByCategory = (categoryId) => {
    if (typeof categoryId === 'object') fetchData();
    else fetchData(categoryId);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterSearch = (event) => {
    const { value } = event.target;
    const filteredCategory = faqCategories.filter((categories) =>
      categories.category_name.toLowerCase().includes(value.toLowerCase())
    );
    const filteredQuestions = faqData.filter((faq) =>
      faq.question.toLowerCase().includes(value.toLowerCase())
    );
    const copyOfFaqData = faqData;
    const copyOfCategory = faqCategories;
    if (isEmpty(value)) {
      setFaqCategories(copyOfCategory);
      setFaqData(copyOfFaqData);
    } else {
      setFaqCategories(filteredCategory);
      setFaqData(filteredQuestions);
    }
  };

  return (
    <Spin spinning={loading}>
      {isShowAnswer ? (
        <FaqAnswers
          setIsShowAnswer={setIsShowAnswer}
          selectedFaqData={selectedFaqData}
          mobileView={mobileView}
        />
      ) : (
        <>
          {showHeader && <HelpHeader />}
          <div
            className="faq-container"
            style={{ padding: !isFaq && '15px 0' }}
          >
            <div className="input-search">
              <Input
                placeholder="Search"
                prefix={<SearchOutlined />}
                onChange={filterSearch}
              />
            </div>
            {showCategory && (
              <Slider {...settings} className="faq-category">
                {!isEmpty(faqCategories) && (
                  <Button
                    className="category-btn"
                    onClick={filterFaqByCategory}
                  >
                    All
                  </Button>
                )}
                {faqCategories.map((category) => (
                  <Button
                    className="category-btn"
                    key={category.category_uid}
                    onClick={() => filterFaqByCategory(category.category_uid)}
                  >
                    {category.category_name}
                  </Button>
                ))}
              </Slider>
            )}
            <div className="faq-section">
              <h3>Frequently Asked Questions</h3>
              <div className="mt-10">
                {isEmpty(faqData) ? (
                  <Empty />
                ) : (
                  faqData.map((qus) => (
                    <div
                      className="faq"
                      onClick={() => {
                        setIsShowAnswer(true);
                        setSelectedFaqData(qus);
                      }}
                      role="button"
                      tabIndex={0}
                      key={qus.faq_id}
                      onKeyDown={() => {}}
                    >
                      <PlayIcon />
                      <span style={{ width: '100%' }}>{qus.question}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Spin>
  );
}

export default FrequentlyAskedQuestions;
