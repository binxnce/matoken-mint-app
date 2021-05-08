import React from 'react';
import PropTypes from 'prop-types';
import serviceContext from './ServiceContext';

const ServicesProvider = (props) => {
  const { services, children } = props;

  Object.values(services).forEach((service) => service.init(services));

  return <serviceContext.Provider value={services}>{children}</serviceContext.Provider>;
};

ServicesProvider.propTypes = {
  services: PropTypes.object,
  children: PropTypes.object,
};

export default ServicesProvider;
