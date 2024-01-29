import { Quill } from 'react-quill';

const BaseImage = Quill.import('formats/image');

const ATTRIBUTES = ['alt', 'height', 'width', 'style', 'data-align'];

const WHITE_STYLE = ['margin', 'display', 'float'];

class Image extends BaseImage {
  static formats(domNode) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  format(name, value) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        if (name === 'style') {
          value = this.sanitizeStyle(value);
        }
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  sanitizeStyle(style) {
    const styleArray = style.split(';');
    let allowStyle = '';
    styleArray.forEach((v) => {
      if (WHITE_STYLE.indexOf(v.trim().split(':')[0]) !== -1) {
        allowStyle += `${v};`;
      }
    });
    return allowStyle;
  }
}

export default Image;
