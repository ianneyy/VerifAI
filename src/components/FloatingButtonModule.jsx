import { NativeModules } from 'react-native';

const { FloatingButtonServiceModule } = NativeModules;

export default {
  showBubble: () => FloatingButtonServiceModule.showBubble(),
  hideBubble: () => FloatingButtonServiceModule.hideBubble(),
  isFloatingButtonVisible: () => FloatingButtonServiceModule.isFloatingButtonVisible(),
};
