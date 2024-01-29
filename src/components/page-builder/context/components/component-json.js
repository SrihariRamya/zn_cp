import { defaultThemes, getComponent } from '../../helper';

const componentJson = {
  row: [
    getComponent('text'),
    getComponent('image'),
    getComponent('image1'),
    getComponent('image2'),
    getComponent('image3'),
    getComponent('image4'),
    getComponent('image5'),
    getComponent('image6'),
  ],
  globalProperties: {
    theme: defaultThemes[0],
  },
  globalStyles: {
    width: '100%',
    margin: '0 auto',
    background: 'white',
  },
};

export default componentJson;
