import { get } from 'lodash';
import React, { useContext } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AppearanceContext } from '../../../context/appearance-context';

function TextItem({ data, style }) {
  const [fontSize, fontFamily] = useContext(AppearanceContext);
  const Size = Quill.import('attributors/style/size');
  Size.whitelist = fontSize;
  Quill.register(Size, true);
  const Font = Quill.import('attributors/style/font');
  Font.whitelist = fontFamily;
  Quill.register(Font, true);

  return (
    <div className="react-quill-text" style={style}>
      <ReactQuill
        readOnly
        theme="snow"
        placeholder="Edit your content here"
        value={
          get(data, 'section_text_content', '') || get(data, 'text_content', '')
        }
        modules={{ toolbar: false }}
      />
    </div>
  );
}

export default TextItem;
