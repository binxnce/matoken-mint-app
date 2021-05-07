export const BRIDGE_TYPES = {
  MULTI_TOKEN_BRIDGE: 'multiTokenBridge',
  BINANCE_BRIDGE: 'binanceBridge',
  XDAI_BRIDGE: 'xdaiBridge',
};

export const TRANSACTION_GROUP_STATUS = {
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  DONE: 'DONE',
  FAILED: 'FAILED',
};

export const WEBSOCKETS_NOTIFICATIONS = {
  TRANSACTION_NOTIFICATION: 'transaction-notification',
  DEV: 'dev',
};

export const BINANCE_BRIDGE_STATUSES = {
  WAITING_FOR_DEPOSIT: 'WaitingForDeposit',
  CANCELLED: 'Cancelled',
  BROKEN: 'Broken',
  NOT_FOUND: 'NotFound',
  DEPOSIT_IN_PROGRESS: 'DepositInProgress',
  WITHDRAW_IN_PROGRESS: 'WithdrawInProgress',
  COMPLETED: 'Completed',
};

export const VALIDATOR_STATUSES = {
  NOT_CHECKED: 'notChecked',
  VALID: 'valid',
  INVALID: 'invalid',
};

export const IMAGE_CONFIG = {
  MIN_UPLOAD_WIDTH: 620, // px
  THUMB_WIDTH: 300, // px
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10 MB in bytes
};

export const IMAGE_TYPES = {
  FULL: {
    NAME: 'full',
    SIZE3X: IMAGE_CONFIG.MIN_UPLOAD_WIDTH * 3,
    SIZE2X: IMAGE_CONFIG.MIN_UPLOAD_WIDTH * 2,
    SIZE1X: IMAGE_CONFIG.MIN_UPLOAD_WIDTH,
  },
  THUMB: {
    NAME: 'thumb',
    SIZE3X: IMAGE_CONFIG.THUMB_WIDTH * 3,
    SIZE2X: IMAGE_CONFIG.THUMB_WIDTH * 2,
    SIZE1X: IMAGE_CONFIG.THUMB_WIDTH,
  },
  PLACEHOLDER_FRAME: {
    NAME: 'placeholder-frame',
  },
};
