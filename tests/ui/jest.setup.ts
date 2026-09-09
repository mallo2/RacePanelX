import { jest } from '@jest/globals';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  const Icon = ({ name, ...props }: { name?: string }) =>
    React.createElement(Text, props, name);

  return { MaterialCommunityIcons: Icon, Ionicons: Icon };
});

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Image: (props: Record<string, unknown>) => React.createElement(View, props),
  };
});

jest.mock('@react-native-masked-view/masked-view', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: ({
      children,
      maskElement,
      ...props
    }: {
      children?: React.ReactNode;
      maskElement?: React.ReactNode;
    }) => React.createElement(View, props, maskElement, children),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaView: (props: Record<string, unknown>) =>
      React.createElement(View, props),
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const React = require('react');
  const { ScrollView } = require('react-native');

  return {
    KeyboardAwareScrollView: (props: Record<string, unknown>) =>
      React.createElement(ScrollView, props),
  };
});

const mockRouterActions = {
  push: jest.fn(),
  back: jest.fn(),
  navigate: jest.fn(),
};

jest.mock('expo-router', () => ({
  router: mockRouterActions,
  useRouter: () => mockRouterActions,
}));
