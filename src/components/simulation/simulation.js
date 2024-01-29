import React, { useEffect, useState } from 'react';
import {
  Input,
  Menu,
  Modal,
  Divider,
  notification,
  Button,
  Tooltip,
} from 'antd';
import { filter, find, get, isEmpty, map } from 'lodash';

import {
  ArrowLeftOutlined,
  DownOutlined,
  SearchOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getSimulationData, getTenant } from '../../utils/api/url-helper';
import logo from './assets/zupain-logo.png';
import { ReactComponent as Avatar } from './assets/avatar.svg';
import { ReactComponent as Watching } from './assets/vectorImg.svg';
import CustomizeCard from './customise-card';
import BackImg from './assets/backimg.jpg';
import items from './simulation-datas';
import fb from './assets/Facebook.png';
import insta from './assets/instagram.png';
import linkedin from './assets/Linkedin.png';
import youtube from './assets/Youtube.png';

const rootSubmenuKeys = new Set([
  '',
  'sub2',
  'sub4',
  'sub5',
  'sub6',
  'sub7',
  'sub8',
  'sub9',
  'sub10',
]);

const openNotification = () => {
  notification.open({
    message: 'Failed to fetch the datas',
    description: 'Unable to get the simulation datas',
  });
};

function SimulationPhase() {
  const [searchText, setSearchText] = useState('');
  const [openKeys, setOpenKeys] = useState(['']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoSource, setVideoSource] = useState('');
  const [modalTitle, setModalTitle] = useState('Tutorial');
  const [sortMenu, setSortMenu] = useState(false);
  const [simulationDatas, setSimulationDatas] = useState('');
  const [menuSort, setMenuSort] = useState([]);
  const [tenantEmailId, setTenantEmailId] = useState('Profile');
  const [showMoreItems, setShowMoreItems] = useState(6);
  const [buttonText, setButtonText] = useState(true);

  const simulationData = async () => {
    try {
      const response = await getSimulationData();
      const tenantDetails = await getTenant();
      const tenantDatas = get(tenantDetails, 'data');
      const tenantEmail = get(tenantDatas, 'setting.email_address');
      setTenantEmailId(tenantEmail);
      const responseValue = get(response, 'data');
      const simulationValue = get(responseValue, 'data');
      setSimulationDatas(simulationValue);
    } catch {
      openNotification();
    }
  };

  const navigate = useNavigate();

  const goBack = () => {
    navigate('/dashboard');
  };
  useEffect(() => {
    simulationData();
  }, []);

  const menuclick = (menu) => {
    if (get(menu, 'key') === 'sub1') {
      setSortMenu(false);
      setSearchText('');
    } else {
      const intValue = get(menu, 'key');
      const intData = Number.parseInt(intValue, 10);
      const menuItem = find(
        simulationDatas,
        (item) => get(item, 'menu_id') === intData
      );
      const menuArray = [];
      if (menuItem) {
        menuArray.push(menuItem);
        setMenuSort(menuArray);
        setSortMenu(true);
      } else {
        setMenuSort('');
      }
    }
  };

  const filteredCardData = filter(simulationDatas, (card) =>
    card.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCardClick = (data) => {
    if (get(data, 'figma_file')) {
      setModalTitle(get(data, 'title'));
      const figmaFile = `${get(data, 'figma_file')}%26hide-ui%3D1`;
      setVideoSource(figmaFile);
      setIsModalOpen(true);
    } else {
      setVideoSource('');
    }
  };

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));

    if (
      latestOpenKey &&
      Array.isArray(rootSubmenuKeys) &&
      !rootSubmenuKeys.includes(latestOpenKey)
    ) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const onChangeSearch = (event) => {
    setSortMenu(false);
    setSearchText(get(event, 'target.value'));
  };

  const handleOk = () => {
    setVideoSource('');
    setIsModalOpen(false);
  };

  const showMore = () => {
    setButtonText((previousState) => !previousState);

    if (buttonText === false) {
      setShowMoreItems(6);
    } else {
      setShowMoreItems(get(filteredCardData, 'length'));
    }
  };

  function renderFilteredData() {
    if (isEmpty(filteredCardData)) {
      return (
        <div className="simulation-no-data-container">
          <p className="simulation-no-data">No Data</p>
        </div>
      );
    }
    const slicedData = filteredCardData.slice(
      0,
      showMoreItems === get(filteredCardData, 'length')
        ? get(filteredCardData, 'length')
        : showMoreItems
    );
    return slicedData.map((card) => (
      <CustomizeCard
        backgroundImage={BackImg}
        card={card}
        key={get(card, 'id')}
        onCardClick={handleCardClick}
      />
    ));
  }

  function renderMenuSort() {
    if (isEmpty(menuSort)) {
      return (
        <div className="simulation-no-data-container">
          <p className="simulation-no-data">No Data</p>
        </div>
      );
    }
    return map(menuSort, (card) => (
      <CustomizeCard
        backgroundImage={BackImg}
        card={card}
        key={get(card, 'id')}
        onCardClick={handleCardClick}
      />
    ));
  }

  return (
    <div className="simulation-container">
      <div className="simulation-main">
        <div className="simulation-header">
          <div>
            <ArrowLeftOutlined
              onClick={goBack}
              style={{ color: 'white' }}
              className="left-arrow-simulation"
            />
            <img style={{ margin: '10px 0 0 20px' }} src={logo} alt="*" />
          </div>
          <div className="right-header">
            <Tooltip
              className="tooltip-simulation"
              title={<span style={{ color: '#000000' }}>{tenantEmailId}</span>}
              placement="bottomRight"
              color="white"
            >
              <div style={{ marginRight: '3rem' }}>
                <Avatar />
              </div>
            </Tooltip>
          </div>
        </div>
        <Divider style={{ background: '#356666' }} />
        <div className="simulation-front-page">
          <div className="left-pane">
            <div className="heading-text">
              <span className="animate-text">Explore virtual demo</span> : Where
              Imagination Meets Reality.
            </div>
            <div className="sub-heading-text">
              Your gateway to limitless virtual realms, where precision and
              imagination merge to create immersive experiences beyond
              boundaries
            </div>
          </div>
          <div className="right-pane">
            <Watching />
          </div>
        </div>
        <div className="simulation-search-container">
          <Input
            allowClear
            type="text"
            placeholder="Search"
            value={searchText}
            style={{ width: '20%' }}
            prefix={<SearchOutlined />}
            onChange={(event) => onChangeSearch(event)}
          />
        </div>
        <div className="simulation-content">
          <div>
            {items ? (
              <div className="simulation-menu">
                <Menu
                  className="content-menu"
                  mode="inline"
                  itemIcon={false}
                  openKeys={openKeys}
                  onOpenChange={onOpenChange}
                  onClick={(menu) => menuclick(menu)}
                  style={{
                    width: 256,
                  }}
                  items={items}
                />
              </div>
            ) : (
              <p>Items is undefined or empty</p>
            )}
          </div>
          <div className="right-pane">
            {sortMenu === false ? renderFilteredData() : renderMenuSort()}
          </div>
        </div>
        <div className="show-more-tab">
          <Button className="show-more-button" onClick={showMore}>
            {buttonText ? 'show more' : 'show less'}
            {buttonText ? <DownOutlined /> : <UpOutlined />}
          </Button>
        </div>
      </div>

      <Modal
        title={modalTitle}
        className="simulation-modal"
        open={isModalOpen}
        onCancel={handleOk}
        okText="Done"
        destroyOnClose
        width={1300}
        centered
        style={{ marginTop: '10px' }}
      >
        <div>
          <iframe
            title="Tutorial Video"
            style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
            width={1250}
            height={750}
            src={videoSource}
            frameBorder="false"
          />
        </div>
      </Modal>
      <footer>
        <div className="footer-container">
          <div className="first-inner-container">
            <div className="first-pane">
              <h3>Quick Links</h3>
              <div className="inner-division">
                <span>
                  <a
                    href="https://zupain.com/blog/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Blog
                  </a>
                </span>
                <span>
                  <a
                    href="https://zupain.com/help/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    FAQ
                  </a>
                </span>
                <span>
                  <a
                    href="https://zupain.com/terms-and-conditions/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Terms and Condition
                  </a>
                </span>
                <span>
                  <a
                    href="https://zupain.com/privacy-policy/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Privacy Policy
                  </a>
                </span>

                <span>
                  <a
                    href="https://zupain.com/refund-policy/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Refund Policy
                  </a>
                </span>
              </div>
            </div>
            <div className="middle-pane">
              <h3>Registered Office Address</h3>
              <div className="inner-division">
                <span>Zupain Tech Private LimitedDoor No. H2B,</span>
                <span> Ground Floor,Bharathidasan Colony, K.K.</span>
                <span> Nagar,Chennai - 600078</span>
              </div>
            </div>
            <div className="last-pane">
              <h3>Contact Us</h3>
              <div className="inner-division">
                <span>Mail: support@zupain.com</span>
                <span>Mobile: +919345928075</span>
                <span>GSTIN: 33AABCZ9480H1ZZ</span>
              </div>
            </div>
          </div>
          <div className="second-inner-container" />
          <Divider />
          <div className="footer-last">
            <div className="footer-icon">
              <a
                href="https://www.facebook.com/people/Zupain-Online/100088706087976/"
                target="_blank"
                rel="noreferrer"
              >
                <img src={fb} alt="facebook" />
              </a>
              <a
                href="https://www.youtube.com/@zupain/videos"
                target="_blank"
                rel="noreferrer"
              >
                <img src={youtube} alt="youtube" />
              </a>

              <a
                href="https://www.instagram.com/zupain_online/?igshid=YmMyMTA2M2Y%3D"
                target="_blank"
                rel="noreferrer"
              >
                <img src={insta} alt="Instagram" />
              </a>

              <a
                href="https://www.linkedin.com/company/zupain/mycompany/"
                target="_blank"
                rel="noreferrer"
              >
                <img src={linkedin} alt="Linked In" />
              </a>
            </div>
            <div>
              <span>© Zupain 2023 All Rights Reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SimulationPhase;
