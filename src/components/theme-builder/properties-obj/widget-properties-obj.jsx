/* eslint-disable camelcase */
import { v4 as uuid } from 'uuid';
import { createRow, title_style, common_styles } from './properties-obj';

export const createPropetyForWidget = (type) => {
  const lookups = {
    lookup_type: '',
    lookup_name: '',
    lookup_query: '',
    lookup_values: [],
  };
  const widgetProperties = {
    text: {
      placeholder: '',
      max: 0,
      min: 0,
    },
    number: {
      placeholder: '',
      max: 0,
      min: 0,
      step: '1',
    },
    textArea: {
      placeholder: '',
      rows: 1,
      max: 0,
      min: 0,
    },
    label: {
      label_name: '',
      labelStyle: {},
    },
    radio: {
      defaultValue: '',
      optionType: '',
      buttonStyle: '',
      lookups: { ...lookups },
    },
    toggle: {
      default_checked: false,
      checked_name: '',
      unchecked_name: '',
      checked_icon: '',
      unchecked_icon: '',
    },
    dropdown: {
      defaultValue: '',
      selectMode: '',
      show_search: false,
      lookups: { ...lookups },
    },
    checkbox: {
      defaultValue: '',
      lookups: { ...lookups },
    },
    button: {
      type: '',
      size: '',
      shape: '',
      icon: '',
      title: '',
      block: false,
      icon_position: '',
      width: '',
      color: '',
      backgroundColor: '',
      is_downlaod_button: false,
      is_submit_button: false,
    },
    date: {
      placeholder: '',
      showTime: false,
      dateFormat: '',
      min_date: '',
      max_date: '',
      min_dateTime: '',
      max_dateTime: '',
    },
    upload: {
      max_size: '',
      file_type: '',
      size_type: '',
      max_count: '',
      multiple: false,
      upload_type: '',
    },
    table: {
      columns: [],
      expandable_row: false,
      filter: {
        showFilter: false,
        filterType: [''],
        filterOptions: [''],
      },
      pagination: {
        defaultPageSize: '',
        showSizeChanger: '',
        pageSizeOptions: [],
      },
    },
    progress: {
      strokeColor: [''],
      status: '',
      type: '',
    },
    collapse: {
      accordion: false,
      panel: [
        {
          panel_uid: uuid(),
          header: {
            header_text: '',
            header_style: { ...title_style },
          },
          panel_style: {
            backgroundColor: '',
            padding: '0px 0px 0px 0px',
          },
        },
      ],
      row: [createRow()],
    },
    modal: {
      footer: true,
      label: {
        label_name: '',
        labelStyle: { ...title_style, ...common_styles },
      },
      refence_name: '',
      modal_width: '',
      cancel_text: '',
      ok_text: '',
      row: [createRow()],
    },
    image: {
      src: '',
      alt: '',
      preview: false,
      width: '',
      height: '',
      img_style: {
        objectFit: '',
      },
    },
    flow: {
      response_api: '',
    },
  };
  return widgetProperties[type];
};

export const widget_type = ['collapse', 'modal'];
