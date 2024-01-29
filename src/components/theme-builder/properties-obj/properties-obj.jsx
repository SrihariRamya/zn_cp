import { v4 as uuid } from 'uuid';

export const common_styles = {
  margin: '0px 0px 0px 0px',
  padding: '0px 0px 0px 0px',
  borderRadius: '0px 0px 0px 0px',
  backgroundColor: '',
  borderWidth: '0px 0px 0px 0px',
  borderColor: '',
  borderStyle: '',
  height: null,
};

export const title_style = {
  color: '',
  fontSize: '',
  textAlign: '',
  fontWeight: '',
  fontStyle: '',
  padding: '0px 0px 0px 0px',
};

export const createSection = () => ({
  section_uid: uuid(),
  section_style: {
    show_style: false,
  },
  section_properties: {
    title: {
      show_title: false,
      section_title: '',
      title_style,
    },
    data_source: '',
    where: '',
  },
  row: [createRow()],
});

export const createRow = () => ({
  row_uid: uuid(),
  row_style: {
    show_style: false,
    justifyContent: '',
    alignItems: '',
  },
  column: [],
});

export const createColum = (form_uid = '') => ({
  column_uid: uuid(),
  widget_uid: '',
  widget_type: '',
  form_uid,
  form_post_api: '',
  form_wrapper: false,
  column_style: {
    show_style: false,
    width: null,
  },
  column_properties: {
    label: {
      show_label: false,
      label_name: '',
      labelStyle: {},
    },
    action: {
      action_api: '',
      action_type: '',
      api_type: '',
      action_route: '',
      variable_name: '',
      reference_name: '',
      reference_value: '',
      value: '',
    },
    required: false,
    dataField: '',
    iterable: {
      columnIterable: false,
      oddBg: '',
      evenBg: '',
    },
    popover: {
      show_popover: false,
      placement: 'top',
      title: '',
      content: createRow(),
    },
    field_name: '',
    data_source: '',
  },
});
