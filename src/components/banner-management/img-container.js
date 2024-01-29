import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import './banner.less';
import { DeleteFilled, MenuOutlined, EditOutlined } from '@ant-design/icons';

function ImgContainer({
  banner_id: aliasBannerID,
  img,
  index,
  moveCard,
  deleteImage,
  handleEdit,
  tabKey,
  webEdit,
}) {
  const reference = useRef(null);
  const [, drop] = useDrop({
    accept: 'card',
    hover(item, monitor) {
      if (!reference.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = reference.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [, drag] = useDrag({
    type: 'card',
    item: { aliasBannerID, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drag(drop(reference));
  return (
    <div ref={reference}>
      <div className="banner-card">
        <div>
          <EditOutlined
            className="icon_bg"
            onClick={tabKey === 'Web' ? webEdit : handleEdit}
          />
          <DeleteFilled className="icon_bg" onClick={deleteImage} />
          <MenuOutlined className="icon_bg" />
        </div>
        <img
          src={img}
          alt="banner.jpg"
          className={tabKey === 'web' ? 'web_banner' : 'mob_banner'}
        />
      </div>
    </div>
  );
}

export default ImgContainer;
