import { v4 as uuid } from 'uuid';
import Text from '../../assets/svg/Text.svg';
import Embed from '../../assets/svg/Embed.svg';
import Product from '../../assets/svg/product.svg';
import Category from '../../assets/svg/Category.svg';
import Video from '../../assets/svg/Video.svg';
import Image from '../../assets/svg/Image.svg';
import Image1 from '../../assets/svg/Image1.svg';
import Image2 from '../../assets/svg/Image2.svg';
import Image3 from '../../assets/svg/Image3.svg';
import Image4 from '../../assets/svg/Image4.svg';
import Image5 from '../../assets/svg/Image5.svg';
import Image6 from '../../assets/svg/Image6.svg';

const WidgetsJson = [
  {
    id: uuid(),
    type: 'text',
    name: 'Text box',
    icon: Text,
  },
  {
    id: uuid(),
    type: 'image',
    name: 'Images',
    icon: Image,
  },
  {
    id: uuid(),
    type: 'embed',
    name: 'Embed',
    icon: Embed,
  },
  {
    id: uuid(),
    type: 'video',
    name: 'Video',
    icon: Video,
  },
  {
    id: uuid(),
    type: 'product',
    name: 'Product',
    icon: Product,
  },
  {
    id: uuid(),
    type: 'category',
    name: 'Category',
    icon: Category,
  },
  {
    id: uuid(),
    type: 'image1',
    name: '',
    icon: Image1,
  },
  {
    id: uuid(),
    type: 'image2',
    name: '',
    icon: Image2,
  },
  {
    id: uuid(),
    type: 'image3',
    name: '',
    icon: Image3,
  },
  {
    id: uuid(),
    type: 'image4',
    name: '',
    icon: Image4,
  },
  {
    id: uuid(),
    type: 'image5',
    name: '',
    icon: Image5,
  },
  {
    id: uuid(),
    type: 'image6',
    name: '',
    icon: Image6,
  },
];

export default WidgetsJson;
