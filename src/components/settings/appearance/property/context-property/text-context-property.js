import { find, get, map, sortBy } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BlotFormatter from 'quill-blot-formatter';
import ImageResize from 'quill-image-resize-module-react';
import { Tooltip } from 'antd';
import { useQuill } from 'react-quilljs';
import { AppearanceContext } from '../../../../context/appearance-context';
import Image from './text-editor/image-formater';

Quill.register('modules/blotFormatter', BlotFormatter);
Quill.register('modules/imageResize', ImageResize);
Quill.register(Image, true);

const TextContextProperty = ({
  contextProperties,
  editorContext,
  setEditorContext,
  setContextProperties,
}) => {
  const [value, setValue] = useState('');
  const [fontSize, fontFamily] = useContext(AppearanceContext);
  const [style, setStyle] = useState({});
  const { quill, quillRef } = useQuill({
    theme: 'snow',
    placeholder: 'Edit your content here',
    value,
    modules: TextContextProperty.modules,
    style,
    formats: TextContextProperty.formats,
  });

  const Size = Quill.import('attributors/style/size');
  Size.whitelist = fontSize;
  Quill.register(Size, true);
  const Font = Quill.import('attributors/style/font');
  Font.whitelist = sortBy(fontFamily);
  Quill.register(Font, true);

  useEffect(() => {
    setValue(get(contextProperties, 'section_text_content', ''));
    const getAppearanceRow = find(editorContext, (row) =>
      find(
        get(row, 'column'),
        (column) =>
          get(column, 'appearance_column_uid') ===
          get(contextProperties, 'appearance_column_uid')
      )
    );
    const getAppearanceColumn = find(
      get(getAppearanceRow, 'column'),
      (column) =>
        get(column, 'appearance_column_uid') ===
        get(contextProperties, 'appearance_column_uid')
    );
    setStyle(get(getAppearanceColumn, 'style', {}));
    return () => {
      setValue('');
      if (setContextProperties) setContextProperties({});
    };
  }, [contextProperties, setContextProperties]);

  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        setEditorContext(
          map(editorContext, (item) => {
            map(item.column, (element) => {
              if (
                get(element, 'section.appearance_section_uid') ===
                get(contextProperties, 'appearance_section_uid')
              ) {
                element.section.section_text_content = quill.root.innerHTML;
              }
              return element;
            });
            return item;
          })
        );
      });
      const delta = quill.clipboard.convert(value);
      quill.setContents(delta, 'api');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quill, value]);

  return (
    <>
      <TextContextProperty.CustomToolbar
        fontFamily={fontFamily}
        fontSize={fontSize}
      />
      <div>
        <div style={style} ref={quillRef} />
      </div>
    </>
  );
};
TextContextProperty.CustomToolbar = ({ fontFamily, fontSize }) => {
  return (
    <div id="toolbar">
      <Tooltip title="Choose Header Size">
        <span className="ql-formats">
          <select className="ql-header" defaultValue="3">
            {map(new Array(6), (element, index) => (
              <option value={index + 1}>{`Heading ${index + 1}`}</option>
            ))}
            <option>Normal</option>
          </select>
        </span>
      </Tooltip>
      <Tooltip title="Choose Font Size">
        <span className="ql-formats">
          <select className="ql-size">
            {map(fontSize, (element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </span>
      </Tooltip>
      <Tooltip title="Choose Font Family">
        <span className="ql-formats">
          <select className="ql-font">
            {map(fontFamily, (element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </span>
      </Tooltip>

      <span className="ql-formats">
        <Tooltip title="Indent Left">
          <button
            className="ql-indent"
            value="-1"
            type="button"
            label="indentLeft"
          />
        </Tooltip>
        <Tooltip title="Indent Right">
          <button
            className="ql-indent"
            value="+1"
            type="button"
            label="indentRight"
          />
        </Tooltip>
      </span>

      <span className="ql-formats">
        <Tooltip title="Super Script">
          <button
            className="ql-script"
            value="super"
            type="button"
            label="superscript"
          />
        </Tooltip>
        <Tooltip title="Sub Script">
          <button
            className="ql-script"
            value="sub"
            type="button"
            label="subscript"
          />
        </Tooltip>
      </span>

      <span className="ql-formats">
        <Tooltip title="Text Color">
          <span className="ql-formats">
            <select className="ql-color" label="color" />
          </span>
        </Tooltip>
        <Tooltip title="Text Background Color">
          <span className="ql-formats">
            <select className="ql-background" label="background" />
          </span>
        </Tooltip>
      </span>

      <span className="ql-formats">
        <Tooltip title="Bold">
          <button className="ql-bold" type="button" label="bold" />
        </Tooltip>
        <Tooltip title="Italic">
          <button className="ql-italic" type="button" label="italic" />
        </Tooltip>
        <Tooltip title="Underline">
          <button className="ql-underline" type="button" label="underline" />
        </Tooltip>
        <Tooltip title="strike">
          <button className="ql-strike" type="button" label="strike" />
        </Tooltip>
      </span>

      <span className="ql-formats">
        <Tooltip title="Order List">
          <button
            className="ql-list"
            value="ordered"
            type="button"
            label="list"
          />
        </Tooltip>
        <Tooltip title="Bullet List">
          <button
            className="ql-list"
            value="bullet"
            type="button"
            label="bullet"
          />
        </Tooltip>
      </span>

      <Tooltip title="Align">
        <span className="ql-formats">
          <select className="ql-align" type="button" label="align" />
        </span>
      </Tooltip>

      <span className="ql-formats">
        <Tooltip title="Add Link">
          <button className="ql-link" type="button" label="link" />
        </Tooltip>
      </span>

      <span className="ql-formats">
        <Tooltip title="Image Upload">
          <button className="ql-image" type="button" label="image" />
        </Tooltip>
      </span>

      <span className="ql-formats">
        <Tooltip title="Clean">
          <button className="ql-clean" type="button" label="clean" />
        </Tooltip>
      </span>
    </div>
  );
};

TextContextProperty.formats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'color',
  'background',
  'link',
  'image',
  'video',
  'undo',
  'redo',
  'align',
  'alt',
  'height',
  'width',
  'style',
];

TextContextProperty.modules = {
  toolbar: {
    container: '#toolbar',
  },
  clipboard: {
    matchVisual: false,
  },
  history: {
    delay: 2000,
    maxStack: 500,
    userOnly: true,
  },
  blotFormatter: {
    overlay: {
      style: { border: '2px solid #385239' },
    },
  },
  imageResize: {
    parchment: Quill.import('parchment'),
    modules: ['Resize', 'DisplaySize'],
  },
};

export default TextContextProperty;
