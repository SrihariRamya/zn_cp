/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/prefer-default-export */
import {
  ColumnJson,
  ComponentJson,
  RowJson,
  setParentId,
} from './component-helper';

export const getComponent = (type) => {
  const text = () => {
    const json = setParentId(RowJson('text'));
    return json;
  };

  const image = () => {
    const json = RowJson('image');
    json.column[0].columnStyle.width = '100%';
    json.column[0].component[0].componentStyle.height = '300px';
    const newJson = setParentId(json);
    return newJson;
  };

  const image1 = () => {
    const json = RowJson();
    json.column = [ColumnJson('image'), ColumnJson('text')];
    json.column[1].component = [
      ...json.column[1].component,
      ComponentJson('text'),
    ];
    for (const col of json.column) {
      col.columnStyle.width = '50%';
      for (const comp of col.component) {
        comp.componentStyle.width = '100%';
        if (comp.componentType === 'image') {
          comp.componentStyle.height = '300px';
        }
      }
    }
    const newJson = setParentId(json);
    return newJson;
  };

  const image2 = () => {
    const json = RowJson();
    json.column = [ColumnJson(), ColumnJson()];
    json.column[0].component = [
      ComponentJson('image'),
      ComponentJson('text'),
      ComponentJson('text'),
    ];
    json.column[1].component = [
      ComponentJson('image'),
      ComponentJson('text'),
      ComponentJson('text'),
    ];
    for (const col of json.column) {
      col.columnStyle.width = '50%';
      for (const comp of col.component) {
        comp.componentStyle.width = '100%';
        if (comp.componentType === 'image') {
          comp.componentStyle.height = '300px';
        }
      }
    }
    const newJson = setParentId(json);
    return newJson;
  };

  const image3 = () => {
    const json = RowJson();
    const column = Array.from({ length: 3 }).map(() => ColumnJson());
    json.column = column;
    for (const col of json.column) {
      col.component = [
        ComponentJson('image'),
        ComponentJson('text'),
        ComponentJson('text'),
      ];
    }

    for (const col of json.column) {
      col.columnStyle.width = '33.33%';
      for (const comp of col.component) {
        comp.componentStyle.width = '100%';
        if (comp.componentType === 'image') {
          comp.componentStyle.height = '300px';
        }
      }
    }
    const newJson = setParentId(json);
    return newJson;
  };

  const image4 = () => {
    const json = RowJson();
    json.column = [ColumnJson('image'), ColumnJson('image')];
    json.column[1].component = [
      ...json.column[1].component,
      ComponentJson('image'),
    ];
    for (const col of json.column) {
      col.columnStyle.width = '50%';
      for (const comp of col.component) {
        comp.componentStyle.width = '100%';
        if (comp.componentType === 'image') {
          comp.componentStyle.height = '300px';
        }
      }
    }
    const newJson = setParentId(json);
    return newJson;
  };

  const image5 = () => {
    const json = RowJson();
    const column = Array.from({ length: 4 }).map(() => ColumnJson());
    json.column = column;
    for (const [index, col] of json.column.entries()) {
      col.component =
        index === 1 || index === 3
          ? [ComponentJson('text')]
          : [ComponentJson('image')];
      col.columnStyle.width = '25%';
      for (const comp of col.component) {
        comp.componentStyle.width = '100%';
        if (comp.componentType === 'image') {
          comp.componentStyle.height = '300px';
        }
      }
    }
    const newJson = setParentId(json);
    return newJson;
  };

  const image6 = () => {
    const json = RowJson();
    const column = Array.from({ length: 4 }).map(() => ColumnJson());
    json.column = column;
    for (const col of json.column) {
      col.component = [
        ComponentJson('image'),
        ComponentJson('text'),
        ComponentJson('text'),
      ];
    }
    for (const col of json.column) {
      col.columnStyle.width = '25%';
      for (const comp of col.component) {
        comp.componentStyle.width = '100%';
        if (comp.componentType === 'image') {
          comp.componentStyle.height = '300px';
        }
      }
    }
    const newJson = setParentId(json);
    return newJson;
  };

  const imageCarousel = () => {
    const json = setParentId(RowJson('imageCarousel'));
    for (const col of json.column) {
      col.columnStyle.width = '100%';
      for (const comp of col.component) {
        comp.componentStyle.width = '100%';
        comp.componentStyle.height = '300px';
        comp.componentStyle.padding = '0px';
      }
    }
    return json;
  };

  const button = () => {
    const json = setParentId(RowJson('button'));
    json.column[0].columnStyle.width = '33.33%';

    return json;
  };

  const product = () => {
    const json = setParentId(RowJson('product'));
    json.column[0].columnStyle.width = '100%';
    return json;
  };

  const category = () => {
    const json = setParentId(RowJson('category'));
    json.column[0].columnStyle.width = '100%';
    return json;
  };

  const video = () => {
    const json = setParentId(RowJson('video'));
    json.column[0].columnStyle.width = '100%';
    return json;
  };

  const youTubeVideo = () => {
    const json = setParentId(RowJson('youTubeVideo'));
    json.column[0].columnStyle.width = '100%';
    return json;
  };

  const component = {
    text: text(),
    image: image(),
    image1: image1(),
    image2: image2(),
    image3: image3(),
    image4: image4(),
    image5: image5(),
    image6: image6(),
    imageCarousel: imageCarousel(),
    button: button(),
    product: product(),
    category: category(),
    video: video(),
    youTubeVideo: youTubeVideo(),
  };
  return component[type];
};
