import React, { useState } from 'react';
import { get } from 'lodash';
import { Button } from 'antd';
import BlogDetails from './blog-details';
import '../zupain-help.less';

function HomeMedia(properties) {
  const { blogData, mobileView } = properties;
  const [isShowBlogData, setIsShowBlogData] = useState(false);

  return (
    <div>
      {isShowBlogData ? (
        <BlogDetails
          blogData={blogData}
          setIsShowBlogData={setIsShowBlogData}
          mobileView={mobileView}
        />
      ) : (
        <div className="m-20 section-layout p-10">
          {get(blogData, 'media_type', '') === 'image' ? (
            <img
              src={get(blogData, 'media_link', '')}
              alt="media-img"
              className="w-100"
              height="150"
            />
          ) : (
            <video height="150" controls className="w-100">
              <track kind="captions" />
              <source src={get(blogData, 'media_link', '')} type="video/mp4" />
            </video>
          )}
          <p>{get(blogData, 'blog_name', '')}</p>
          <div className="blog-description">
            {get(blogData, 'blog_description', '')}
          </div>
          <Button
            type="primary"
            size="small"
            onClick={() => setIsShowBlogData(true)}
          >
            See more...
          </Button>
        </div>
      )}
    </div>
  );
}

export default HomeMedia;
