import _ from 'lodash';

export const getStatus = (roleDetails, data) => {
  const accessDetails = {
    module_view: false,
    can_read: false,
    can_write: false,
  };
  if (!_.isEmpty(roleDetails)) {
    _.get(roleDetails, '[0].role_accesses', []).forEach((response) => {
      if (_.get(response, 'zm_module.module_name', '') === data) {
        accessDetails.can_write = _.get(response, 'can_write', false);
        accessDetails.can_read = _.get(response, 'can_read', false);
        if (_.get(response, 'can_read', false) === true) {
          if (Boolean(_.get(response, 'module_view', false)) === true) {
            accessDetails.module_view = true;
          } else {
            accessDetails.module_view = false;
          }
        } else {
          accessDetails.module_view = false;
        }
      }
    });
  }
  return accessDetails;
};
export default {};
