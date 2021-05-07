import { BehaviorSubject } from 'rxjs';
import Service from './Service';

class NotificationService extends Service {
  listeners = [];
  notificationId = 0;
  notifications$ = new BehaviorSubject([]);
  notification$ = new BehaviorSubject(null);

  get notifications() {
    return this.notifications$.value;
  }

  get notification() {
    return this.notification$.value;
  }

  putNotification(notification) {
    const newNotification = {
      notification,
      id: ++this.notificationId,
      createdAt: new Date(),
    };
    this.notification$.next(newNotification);
    this.notifications$.next([newNotification, ...this.notifications]);

    this.notifyListeners(newNotification);
  }

  clearNotifications() {
    this.notifications$.next([]);
  }

  subscribe(callback) {
    if (this.listeners.includes(callback)) return;
    this.listeners.push(callback);
  }

  unsubscribe(callback) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  notifyListeners(notification) {
    this.listeners.forEach((listener) => listener(notification));
  }
}

export default NotificationService;
