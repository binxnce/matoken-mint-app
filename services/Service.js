class Service {
  services;
  initialized = false;

  init(services) {
    if (!this.initialized) {
      this.services = services;
      this.initialized = true;

      if (this.onInit) {
        this.onInit();
      }
    }
  }

  onInit() {}
}

export default Service;
