import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';
import styled from 'styled-components';
import { colors } from '../utils/variables';

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  cursor: pointer;
`;

const IconWrapper = styled.div`
  margin-top: -6px;
`;

const Icon = styled.i`
  font-size: 8px;
  color: ${colors.secondaryText};
  padding: 0 4px;
  border-radius: 100%;
  border: 1px solid ${colors.secondaryText};
  margin: 6px;
  display: inline-block;
  width: 16px;
  height: 16px;
  line-height: 14px;
  text-align: center;
`;

const StyledTooltip = styled(BootstrapTooltip)`
  .tooltip-inner {
    background-color: ${colors.card};
    position: relative;
    max-width: 100%;
    text-align: left;
    color: ${colors.text};

    &:before {
      display: block;
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      border-radius: 4px;
      -webkit-box-shadow: 0px 0px 15px 0px #dedede;
      -moz-box-shadow: 0px 0px 15px 0px #dedede;
      box-shadow: 0px 0px 15px 0px #dedede;
      z-index: 1;
    }
  }

  .arrow {
    position: relative;
    z-index: 2;
  }

  &[data-popper-placement='top'] {
    .arrow {
      &:before {
        border-top-color: ${colors.card};
      }
    }
  }

  &[data-popper-placement='bottom'] {
    .arrow {
      &:before {
        border-bottom-color: ${colors.card};
      }
    }
  }

  &[data-popper-placement='left'] {
    .arrow {
      &:before {
        border-left-color: ${colors.card};
      }
    }
  }

  &[data-popper-placement='right'] {
    .arrow {
      &:before {
        border-right-color: ${colors.card};
      }
    }
  }
`;

const renderTooltip = (props, tooltipContent) => (
  <StyledTooltip id="button-tooltip" {...props}>
    {tooltipContent}
  </StyledTooltip>
);

const Tooltip = ({ children, tooltipContent, placement, triggerComponent }) => {
  return (
    <OverlayTrigger
      placement={placement || 'top'}
      delay={{ show: 250, hide: 400 }}
      overlay={(props) => renderTooltip(props, tooltipContent)}
    >
      {({ ref, ...triggerHandler }) => (
        <ContentWrapper {...triggerHandler}>
          {children}
          {triggerComponent ? (
            <div ref={ref}>{triggerComponent}</div>
          ) : (
            <IconWrapper ref={ref}>
              <Icon className="oi oi-question-mark" aria-hidden="true"></Icon>
            </IconWrapper>
          )}
        </ContentWrapper>
      )}
    </OverlayTrigger>
  );
};
Tooltip.propTypes = {
  children: PropTypes.object.isRequired,
  tooltipContent: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  triggerComponent: PropTypes.object,
};

export default Tooltip;
