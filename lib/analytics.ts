declare global {
  interface Window {
    sa_event: (eventName: string) => void;
  }
}

export const saEvent = (eventName: string) => {
  if (typeof window !== 'undefined' && window.sa_event) {
    return window.sa_event(eventName);
  }
};
