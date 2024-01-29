import React from 'react';
import { get, find, isEmpty, map } from 'lodash';
import { Button, Space } from 'antd';

function VariantSelector({ data, properties }) {
  const variantStyle = get(properties, 'column_properties.variant_style');
  const backgroundColor = get(variantStyle, 'backgroundColor');
  const borderRadius = get(variantStyle, 'borderRadius');
  const color = get(variantStyle, 'color');
  const borderColor = get(variantStyle, 'borderColor');
  const fontFamily = get(variantStyle, 'fontFamily');
  const selectedButtonBackground = get(
    variantStyle,
    'selected_backgroundColor'
  );
  const borderWidth = get(variantStyle, 'borderWidth');
  const selectedColor = get(variantStyle, 'selected_color');
  const selectedBorderColor = get(variantStyle, 'selected_borderColor');
  const selectedBorderRadius = get(variantStyle, 'selected_borderRadius');
  const selectedBorderWidth = get(variantStyle, 'selected_borderWidth');
  const selectedFontFamily = get(variantStyle, 'selected_fontFamily');

  const getProductPriceDetails = ({ attributeName, productVariantId }) => {
    const productVariant = find(get(data, 'product_variants'), {
      id: !isEmpty(productVariantId)
        ? productVariantId
        : get(data, 'product_variants[0].id'),
    });
    return get(
      find(
        get(productVariant, 'variant_attributes'),
        (item) => get(item, 'zm_attribute.name') === attributeName
      ),
      'attribute_value'
    );
  };
  const variantData = map(data.product_variants, (index) => ({
    unit: getProductPriceDetails({
      attributeName: 'Units',
      productVariantId: index.id,
    }),
    id: index.id,
  }));

  return (
    <div
      className="variant-selector"
      style={{
        display: 'flex',
        justifyContent: get(variantStyle, 'justify-content'),
      }}
    >
      <Space wrap>
        {map(variantData, (index, number) => {
          const buttonStyle =
            number === 0
              ? {
                  backgroundColor: selectedButtonBackground,
                  borderRadius: selectedBorderRadius,
                  color: selectedColor,
                  borderColor: selectedBorderColor,
                  borderWidth: selectedBorderWidth,
                  fontFamily: selectedFontFamily,
                }
              : {
                  backgroundColor,
                  borderRadius,
                  color,
                  borderColor,
                  borderWidth,
                  fontFamily,
                };
          return (
            <Button
              id={number === 0 && 'active'}
              style={buttonStyle}
              key={get(index, 'id')}
            >
              {index.unit}
            </Button>
          );
        })}
      </Space>
    </div>
  );
}

export default VariantSelector;
