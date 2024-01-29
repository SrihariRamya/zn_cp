/* eslint-disable camelcase */
import React from 'react';
import { LeftOutlined, EyeOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import moment from 'moment';
import Logo from '../../../assets/icons/zupain-help-icon.png';

function BlogDetails(properties) {
  const { blogData, setIsShowBlogData, mobileView } = properties;
  const {
    blog_name,
    blog_description,
    media_link,
    video_link,
    media_type,
    creation_date,
  } = blogData;
  return (
    <div className={`answer-section-container ${mobileView && 'w-85'}`}>
      <div className="answer-header">
        <div className="flex">
          <LeftOutlined
            className="mr-30 cursor-ponter"
            onClick={() => setIsShowBlogData(false)}
          />
          <span>{blog_name}</span>
        </div>
      </div>
      <div className="blog-details-media">
        {media_type === 'video' ? (
          <video controls>
            <track kind="captions" />
            <source src={media_link} type="video/mp4" />
          </video>
        ) : (
          <img alt="example" src={media_link} />
        )}
      </div>
      <div className="m-20">
        <Space className="mb-10">
          <img src={Logo} alt="logo" width={30} height={30} />
          <span>By Zupain Team</span>
          <span className="ml-10">
            {moment(creation_date).format('MMM-DD-YYYY')}
          </span>
          <span className="ml-30p">
            <EyeOutlined />
            100 views
          </span>
        </Space>
        <div>{blog_description}</div>
      </div>
      {video_link && (
        <iframe
          width={545}
          height={350}
          title="Video"
          src={video_link}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        />
      )}
    </div>
  );
}

export default BlogDetails;
