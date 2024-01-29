import {
  Button,
  Card,
  Checkbox,
  List,
  Row,
  Image,
  notification,
  Select,
  Col,
  Empty,
} from 'antd';
import { filter, find, get, isEmpty, map } from 'lodash';
import React, { useEffect } from 'react';
import { PAGE_BUILDER_UPLOAD } from '../../../shared/constant-values';
import { fileListTypeCount } from '../../../shared/function-helper';
import { defaultImage } from '../../../shared/image-helper';

function FacebookImage(properties) {
  const visibility = get(properties, 'visibility', '');
  const {
    fbData,
    pagination,
    getPagePosts,
    fileListState,
    metaArray,
    setMetaArray,
    setShow,
    mobileView,
    uncheckIndex,
    setUncheckIndex,
    radioValue,
    setRadioValue,
    uploadObject,
    facebookList,
    setFacebookList,
    checkedArray,
    setCheckedArray,
    fbPageData,
    selectedPageId,
    setSelectedPageId,
  } = properties;

  const handleImageUpload = (data, index) => {
    return setRadioValue({
      url: get(data, 'url', ''),
      status: 'done',
      name: get(data, 'name', ''),
      localMedia: true,
      type: 'image/jpg',
      id: `${index}-fb`,
      indexId: index,
      isCheckId: data.id,
    });
  };
  const fileStateLength = fileListState?.length;
  const uploadObjectLength = uploadObject?.length;

  useEffect(() => {
    setFacebookList([]);
    const initialFbList = [];
    map(fbData, (list) => {
      if (list?.attachments?.data[0]?.subattachments) {
        const subattachmentsData = list.attachments.data[0].subattachments.data;
        map(subattachmentsData, (value) => {
          return initialFbList.push({
            url: value?.media?.image?.src,
            status: 'done',
            name: `image-${value?.target?.id}-fb.jpg`,
            localMedia: true,
            type: 'image/jpg',
            isCheck: false,
          });
        });
      } else if (list?.attachments?.data[0]?.type === 'video_inline') {
        initialFbList.push({
          url: list?.attachments?.data[0]?.media?.image?.src,
          status: 'done',
          name: `video-${list?.attachments?.data[0]?.target?.id}-fb.mp4`,
          localMedia: true,
          type: 'video/mp4',
          isCheck: false,
        });
      } else {
        initialFbList.push({
          url: list?.attachments?.data[0]?.media?.image?.src,
          status: 'done',
          name: `image-${list?.attachments?.data[0]?.target?.id}-fb.jpg`,
          localMedia: true,
          type: 'image/jpg',
          isCheck: false,
        });
      }
    });
    map(initialFbList, (initial) => {
      map(metaArray, (list) => {
        if (list?.name === initial?.name) {
          initial.isCheck = true;
        }
      });
      map(fileListState, (list) => {
        if (list?.name === initial?.name) {
          initial.isCheck = true;
        }
      });
    });
    setFacebookList(initialFbList);
  }, [fileListState, fbData]);

  const handleChangeFacebook = (
    checkedImages,
    check,
    fbState,
    duplicateFbArray,
    duplicateFileList,
    item,
    index
  ) => {
    if (checkedImages) {
      fbState[index].isCheck = check;
      setFacebookList(fbState);
      duplicateFbArray.push({
        ...item,
        uploadId: get(item, 'name', ''),
        indexId: index,
      });
    } else {
      notification.error({
        message: 'Media Limit Exceeded. Please delete media to update',
      });
    }
    setMetaArray(duplicateFbArray);
    setCheckedArray(duplicateFileList);
    const typeCount = fileListTypeCount(fileListState, duplicateFbArray);
    setShow(typeCount);
  };

  const onChangeCheckboxVisiblity = (event, item, index) => {
    handleImageUpload(item, index);
    const duplicateFbArray = [...metaArray];
    if (event.target.checked) {
      setMetaArray([
        {
          ...item,
          uploadId: get(item, 'name', ''),
          indexId: index,
        },
      ]);
    } else {
      const unCheck = filter(duplicateFbArray, (fb) => fb?.indexId !== index);
      setMetaArray(unCheck);
      setRadioValue();
    }
  };

  const handlePushCheckedArray = (duplicateFileList, item, index) => {
    const lengthCheck = fileListState.length + checkedArray.length;
    if (lengthCheck < 7) {
      duplicateFileList.push({
        ...item,
        uploadId: get(item, 'name', ''),
        indexId: index,
      });
    }
  };

  const onChangeCheckbox = (event, item, index) => {
    const check = !item.isCheck;
    const fbState = facebookList;
    const duplicateFbArray = [...metaArray];
    const duplicateFileList = [...checkedArray];
    setShow('');
    if (event.target.checked) {
      handlePushCheckedArray(duplicateFileList, item, index);
      const withSocial = fileStateLength + duplicateFileList.length;
      const checkedImages =
        fileStateLength === 0
          ? duplicateFbArray.length + 1 <= uploadObjectLength
          : withSocial <= uploadObjectLength;
      handleChangeFacebook(
        checkedImages,
        check,
        fbState,
        duplicateFbArray,
        duplicateFileList,
        item,
        index
      );
      map(uncheckIndex, (uncheck) => {
        if (uncheck === item?.name) {
          setUncheckIndex(filter(uncheckIndex, (list) => list !== item?.name));
        }
      });
    } else {
      const fileList = find(fileListState, (list) => list.name === item.name);
      if (get(fileList, 'name', '') !== '') {
        notification.error({
          message: 'Delete it from uploaded list',
        });
        return;
      }
      fbState[index].isCheck = check;
      setFacebookList(fbState);
      const unCheck = filter(duplicateFbArray, (fb) => fb?.indexId !== index);
      setMetaArray(unCheck);
      setCheckedArray(filter(duplicateFileList, (fb) => fb?.indexId !== index));
      setUncheckIndex([...uncheckIndex, item?.name]);
      const typeCount = fileListTypeCount(fileListState, unCheck);
      setShow(typeCount);
    }
    setFacebookList(fbState);
  };

  const mediaElement = (item) => {
    return item?.type?.includes('mp4') ? (
      <video
        width={mobileView ? '75' : '130'}
        height={mobileView ? '75' : '170'}
        controls
        autoPlay
        muted
      >
        <track kind="captions" />
        <source src={item?.url || defaultImage} />
      </video>
    ) : (
      <Image preview={false} src={item?.url || defaultImage} />
    );
  };

  const handleMediaImage = (value) => {
    return <Image preview={false} src={value?.url || defaultImage} />;
  };

  const onDropDownChange = (value) => {
    setSelectedPageId(value);
  };

  return (
    <div className="facebook-image-div">
      <Row>
        <Col xs={12} sm={12} md={18} lg={18} xl={18}>
          {!mobileView &&
            visibility !== 'image-only' &&
            visibility !== PAGE_BUILDER_UPLOAD && (
              <div>
                <h4 className="fb-title">
                  You can select up to 5 images or 2 videos for import.
                </h4>
              </div>
            )}
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          {!isEmpty(fbPageData) && (
            <>
              <p>Select a facebook page</p>
              <div className="page-align" style={{ marginBottom: '18px' }}>
                <Select
                  className="mt-10"
                  virtual={false}
                  placeholder="Select a Page"
                  optionFilterProp="children"
                  value={selectedPageId}
                  onChange={onDropDownChange}
                  options={fbPageData}
                />
              </div>
            </>
          )}
        </Col>
      </Row>

      <div>
        {isEmpty(facebookList) ? (
          <Empty />
        ) : (
          <>
            <div className="box promote-product-list-container-fb">
              <List
                grid={{
                  gutter: 16,
                  xs: 3,
                  sm: 2,
                  md: 3,
                  lg: 4,
                  xl: 4,
                  xxl: 7,
                }}
                dataSource={facebookList}
                renderItem={(item, index) => (
                  <Row>
                    <List.Item>
                      <Card style={{ padding: '0px', margin: '0px' }}>
                        <div className="img-container-fb">
                          <div
                            style={{
                              position: 'absolute',
                              top: '5px',
                              left: '5px',
                              zIndex: '99',
                            }}
                          >
                            {visibility ? (
                              <Checkbox
                                onChange={(event) =>
                                  onChangeCheckboxVisiblity(event, item, index)
                                }
                                checked={
                                  get(item, 'url') === get(radioValue, 'url')
                                }
                              />
                            ) : (
                              <Checkbox
                                shape="circle"
                                onChange={(event) =>
                                  onChangeCheckbox(event, item, index)
                                }
                                checked={item?.isCheck}
                              />
                            )}
                          </div>
                          {item?.type?.includes('mp4') ? (
                            <div>{mediaElement(item)}</div>
                          ) : (
                            handleMediaImage(item)
                          )}
                        </div>
                      </Card>
                    </List.Item>
                  </Row>
                )}
              />
            </div>
            <div className="d-flex">
              <Button
                type="primary"
                onClick={() =>
                  getPagePosts(
                    get(pagination, 'previous')
                      ? get(pagination, 'previous', '')
                      : get(pagination, 'next', '')
                  )
                }
              >
                {get(pagination, 'previous', '') ? '< Previous' : 'Next >'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FacebookImage;
