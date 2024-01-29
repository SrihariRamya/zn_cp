import React, { useRef, useEffect, useContext, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import * as Emoji from 'quill-emoji';
import 'react-quill/dist/quill.snow.css';
import 'quill-emoji/dist/quill-emoji.css';
import { useComponentContext } from '../../context/components';
import EmbedComponent from './embed';
import { AppearanceContext } from '../../../context/appearance-context';

const formatToolbarButtons = (formats, title) => {
  let index = 0;
  // eslint-disable-next-line unicorn/no-array-for-each
  formats.forEach((format) => {
    const formatBtns = format.querySelectorAll('button');
    if (formatBtns.length > 0) {
      // eslint-disable-next-line unicorn/no-array-for-each
      formatBtns.forEach((formatButton) => {
        formatButton.setAttribute('title', title[index] || '');
        index += 1;
      });
    } else {
      const elements = format.querySelectorAll('.ql-picker');
      if (elements.length > 0) {
        // eslint-disable-next-line unicorn/no-array-for-each
        elements.forEach((element) => {
          element.setAttribute('title', title[index] || '');
          index += 1;
        });
      } else {
        format.setAttribute('title', title[index] || '');
        index += 1;
      }
    }
  });
};

function TextComponent(properties) {
  const { comp, open } = properties;
  const { componentUid, componentProperties } = comp;
  const [fontSize, fontFamily] = useContext(AppearanceContext);
  const [value, setValue] = useState(componentProperties.value);
  const [valueChanged, setValueChanged] = useState(false);
  const [editorPosition, setEditorPosition] = useState('top');

  Quill.register('modules/emoji', Emoji);
  const Size = Quill.import('attributors/style/size');
  const Font = Quill.import('attributors/style/font');
  Size.whitelist = fontSize;
  Font.whitelist = fontFamily;
  Quill.register(Size, true);
  Quill.register(Font, true);

  const color = [
    '#000000',
    '#e60000',
    '#ff9900',
    '#ffff00',
    '#008a00',
    '#0066cc',
    '#9933ff',
    '#ffffff',
    '#facccc',
    '#ffebcc',
    '#ffffcc',
    '#cce8cc',
    '#cce0f5',
    '#ebd6ff',
    '#bbbbbb',
    '#f06666',
    '#ffc266',
    '#ffff66',
    '#66b966',
    '#66a3e0',
    '#c285ff',
    '#888888',
    '#a10000',
    '#b26b00',
    '#b2b200',
    '#006100',
    '#0047b2',
    '#6b24b2',
    '#444444',
    '#5c0000',
    '#663d00',
    '#666600',
    '#003700',
    '#002966',
    '#3d1466',
  ];

  const { updatePropertyValues } = useComponentContext();
  const toolbarOptions = [
    [
      { header: [1, 2, 3, 4, 5, false] },
      { font: fontFamily },
      { size: fontSize },
    ],
    ['bold', 'italic', 'underline', 'strike', 'blockquote', 'link'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['emoji'],
    ['clean'],
    [
      {
        color,
      },
      {
        background: color,
      },
    ],
  ];

  const title = [
    'Heading',
    'Font Family',
    'Font Size',
    'Bold',
    'Italic',
    'Underline',
    'Strike',
    'Blockquote',
    'Link',
    'Ordered',
    'Bullet',
    'Indent -1',
    'Indent +1',
    'Emoji',
    'Clean',
    'Color',
    'Background',
  ];

  const reactQuillReference = useRef();

  const onChange = (_value) => {
    setValue(_value);
    setValueChanged(true);
  };

  const onBlur = () => {
    if (valueChanged)
      updatePropertyValues({ id: componentUid, value, key: 'value' });
    setValueChanged(false);
  };

  const adjustEditorPosition = () => {
    const escapeComponentUid = CSS.escape(componentUid);
    const element = document.querySelector(`#${escapeComponentUid}`);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      if (elementRect.top < 80) {
        setEditorPosition('bottom');
      }
    }
  };

  useEffect(() => {
    if (open) {
      const formats = document.querySelectorAll('.ql-formats');
      if (formats) {
        formatToolbarButtons(formats, title);
      }

      adjustEditorPosition();
    }
  }, [open]);

  return open ? (
    <div style={{ width: '100%', height: '100%' }} onBlur={onBlur}>
      <ReactQuill
        ref={reactQuillReference}
        theme="snow"
        placeholder="Start writing..."
        className={editorPosition}
        modules={{
          toolbar: {
            container: toolbarOptions,
          },
          'emoji-toolbar': true,
          'emoji-textarea': false,
          'emoji-shortname': true,
        }}
        value={value}
        onChange={onChange}
      />
    </div>
  ) : (
    <EmbedComponent comp={comp} />
  );
}
export default TextComponent;
