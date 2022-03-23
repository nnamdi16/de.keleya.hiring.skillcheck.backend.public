const mockedConfigService = {
  get(key: string) {
    switch (key) {
      case 'JWT_SECRET':
        return 'JWT_SECRET';
      case 'JWT_EXPIRATION_TIME':
        return '2400';
    }
  },
};

export default mockedConfigService;
