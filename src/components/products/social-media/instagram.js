import React, { useEffect } from 'react';
import {
  List,
  Row,
  Card,
  Image,
  Button,
  Checkbox,
  notification,
  Empty,
} from 'antd';
import { filter, find, get, map } from 'lodash';
import { PAGE_BUILDER_UPLOAD } from '../../../shared/constant-values';
import { defaultImage } from '../../../shared/image-helper';
import { fileListTypeCount } from '../../../shared/function-helper';

function InstagramImage(properties) {
  const {
    igData,
    getInstaPosts,
    metaArray,
    setMetaArray,
    fileListState,
    setShow,
    mobileView,
    uncheckIndex,
    setUncheckIndex,
    visibility,
    setRadioValue,
    radioValue,
    uploadObject,
    instagramList,
    setInstagramList,
    checkedArray,
    setCheckedArray,
  } = properties;

  const instaList = filter(instagramList, (data) => data?.type !== 'VIDEO');
  const paging = get(
    igData,
    'data.business_discovery.media.paging.cursors',
    ''
  );

  const handleInstaImageUpload = (data, Id, index) => {
    return setRadioValue({
      url: data?.url,
      status: 'done',
      name: get(data, 'name', ''),
      localMedia: true,
      type: 'image/jpg',
      id: `${index}-ig`,
      indexId: index,
      isCheckId: Id,
    });
  };
  const fileStateLength = fileListState?.length;
  const uploadObjectLength = uploadObject?.length;

  useEffect(() => {
    setInstagramList([]);
    const initialIgList = [];
    map(get(igData, 'data.business_discovery.media.data', ''), (list) => {
      if (list?.children) {
        map(list.children.data, (value) => {
          return value.media_url.includes('mp4')
            ? initialIgList.push({
                url: value?.media_url,
                status: 'done',
                name: `video-${value?.id}-ig.mp4`,
                localMedia: true,
                type: 'video/mp4',
              })
            : initialIgList.push({
                url: value.media_url,
                status: 'done',
                localMedia: true,
                name: `image-${value?.id}-ig.jpg`,
                type: 'image/jpg',
              });
        });
      } else if (list?.media_url?.includes('mp4')) {
        initialIgList.push({
          url: list?.media_url,
          status: 'done',
          name: `video-${list?.id}-ig.mp4`,
          localMedia: true,
          type: 'video/mp4',
          isCheck: false,
        });
      } else {
        initialIgList.push({
          url: list?.media_url,
          status: 'done',
          localMedia: true,
          name: `image-${list?.id}-ig.mp4`,
          type: 'image/jpg',
          isCheck: false,
        });
      }
    });
    map(initialIgList, (initial) => {
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
    setInstagramList(initialIgList);
  }, [fileListState, igData]);

  const handleChangeInstagram = (
    checkedImages,
    check,
    igState,
    duplicateIgArray,
    duplicateFileList,
    item,
    indexId
  ) => {
    if (checkedImages) {
      igState[indexId].isCheck = check;
      setInstagramList(igState);
      duplicateIgArray.push({
        ...item,
        uploadId: get(item, 'name', ''),
        indexId,
      });
    } else {
      notification.error({
        message: 'Media Limit Exceeded. Please delete media to update',
      });
    }
    const typeCount = fileListTypeCount(fileListState, duplicateIgArray);
    setShow(typeCount);
    setMetaArray(duplicateIgArray);
    setCheckedArray(duplicateFileList);
  };

  const onChangeCheckboxVisiblity = (event, item, indexId) => {
    handleInstaImageUpload(item, item.id, indexId);
    const duplicateIgArray = [...metaArray];
    if (event.target.checked) {
      setMetaArray([
        {
          ...item,
          uploadId: get(item, 'name', ''),
          indexId,
        },
      ]);
    } else {
      const unCheck = filter(duplicateIgArray, (ig) => ig?.indexId !== indexId);
      setMetaArray(unCheck);
      setRadioValue();
    }
  };

  const handlePushCheckedArray = (duplicateFileList, item, indexId) => {
    const lengthCheck = fileListState.length + checkedArray.length;
    if (lengthCheck < 7) {
      duplicateFileList.push({
        ...item,
        uploadId: get(item, 'name', ''),
        indexId,
      });
    }
  };

  const onChangeCheckbox = (event, item, indexId) => {
    const check = !item.isCheck;
    const igState = instagramList;
    const duplicateIgArray = [...metaArray];
    const duplicateFileList = [...checkedArray];
    setShow('');
    if (event.target.checked) {
      handlePushCheckedArray(duplicateFileList, item, indexId);
      const withSocial = fileStateLength + duplicateFileList.length;
      const checkedImages =
        fileStateLength === 0
          ? duplicateIgArray.length + 1 <= uploadObjectLength
          : withSocial <= uploadObjectLength;
      handleChangeInstagram(
        checkedImages,
        check,
        igState,
        duplicateIgArray,
        duplicateFileList,
        item,
        indexId
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
      igState[indexId].isCheck = check;
      setInstagramList(igState);
      setCheckedArray(
        filter(duplicateFileList, (fb) => fb?.indexId !== indexId)
      );
      const unCheck = filter(duplicateIgArray, (fb) => fb?.indexId !== indexId);
      setMetaArray(unCheck);
      setUncheckIndex([...uncheckIndex, item?.name]);
      const typeCount = fileListTypeCount(fileListState, unCheck);
      setShow(typeCount);
    }
  };

  const mediaElement = (item) => {
    return item?.url?.includes('mp4') ? (
      <video
        width={mobileView ? '75' : '180'}
        height={mobileView ? '75' : '180'}
        controls
        autoPlay
        muted
      >
        <track kind="captions" />
        <source src={item?.url} />
      </video>
    ) : (
      <Image preview={false} src={item?.url || defaultImage} />
    );
  };

  const handleVedioMedia = (value) => {
    if (value?.url?.includes('mp4')) {
      return (
        <video width="200" height="180" controls autoPlay muted>
          <track kind="captions" />
          <source src={value?.media_url || defaultImage} />
        </video>
      );
    }
    return <Image preview={false} src={value?.url || defaultImage} />;
  };

  return (
    <div className="facebook-image-div">
      {!mobileView &&
        visibility !== 'image-only' &&
        visibility !== PAGE_BUILDER_UPLOAD && (
          <div>
            <h4 className="fb-title">
              You can select up to 5 images or 2 videos for import.
            </h4>
          </div>
        )}
      {get(igData, 'data', false) ? (
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
              dataSource={
                visibility === 'image-only' ||
                visibility === PAGE_BUILDER_UPLOAD
                  ? instaList
                  : instagramList
              }
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
                                get(item, 'name') === get(radioValue, 'name')
                              }
                            />
                          ) : (
                            <Checkbox
                              shape="circle"
                              onChange={(event) =>
                                onChangeCheckbox(event, item, index)
                              }
                              checked={item.isCheck}
                            />
                          )}
                        </div>
                        {visibility !== 'image-only' &&
                        visibility !== PAGE_BUILDER_UPLOAD ? (
                          handleVedioMedia(item)
                        ) : (
                          <div>{mediaElement(item)}</div>
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
                getInstaPosts(
                  get(paging, 'before')
                    ? get(paging, 'before', '')
                    : get(paging, 'after', '')
                )
              }
            >
              {get(paging, 'before', '') ? '< Previous' : 'Next >'}
            </Button>
          </div>
        </>
      ) : (
        <Empty />
      )}
    </div>
  );
}

export default InstagramImage;
