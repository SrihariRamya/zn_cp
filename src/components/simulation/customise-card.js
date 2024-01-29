import React from 'react';

function CustomizeCard(properties) {
  const { card, onCardClick } = properties;
  const { title } = card;

  return (
    <div style={{ width: '100%' }}>
      <div
        onClick={() => onCardClick(card)}
        className="custom-card"
        aria-hidden="true"
      >
        <div className="custom-card-background" />
        <div className="custom-card-content">
          <h2 className="custom-card-heading">{title}</h2>
        </div>
      </div>
    </div>
  );
}
export default CustomizeCard;
