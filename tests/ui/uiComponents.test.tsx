import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';

function countOccurrences(node: unknown, text: string): number {
  if (typeof node === 'string') {
    return node === text ? 1 : 0;
  }
  if (Array.isArray(node)) {
    return node.reduce((total, child) => total + countOccurrences(child, text), 0);
  }
  if (node && typeof node === 'object') {
    const element = node as { children?: unknown };
    return countOccurrences(element.children ?? [], text);
  }
  return 0;
}
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { BrandGradientFill } from '@/components/ui/BrandGradientFill';
import { CREDIT, CreditFooter } from '@/components/ui/CreditFooter';
import { EmptyState } from '@/components/ui/EmptyState';
import { FloatingTabBar } from '@/components/ui/FloatingTabBar';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

describe('ScreenHeader', () => {
  it('renders the eyebrow, title, subtitle and right element', async () => {
    await render(
      <ScreenHeader
        eyebrow="Race Panel X"
        title="Settings"
        subtitle="Configure the display"
        right={<Text>extra</Text>}
      />,
    );

    expect(screen.getByText('Race Panel X')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Configure the display')).toBeTruthy();
    expect(screen.getByText('extra')).toBeTruthy();
  });

  it('renders only the title when the optional props are missing', async () => {
    await render(<ScreenHeader title="Telemetry" />);

    expect(screen.getByText('Telemetry')).toBeTruthy();
    expect(screen.queryByText('Race Panel X')).toBeNull();
    expect(screen.queryByText('extra')).toBeNull();
  });

  it('applies the custom title style', async () => {
    await render(<ScreenHeader title="Telemetry" titleStyle={{ color: '#FF0000' }} />);

    expect(screen.getByText('Telemetry').props.style).toContainEqual({ color: '#FF0000' });
  });
});

describe('CreditFooter', () => {
  it('renders the credit line', async () => {
    await render(<CreditFooter />);

    expect(screen.getByText(CREDIT)).toBeTruthy();
  });
});

describe('AuroraBackground', () => {
  it('renders the background image', async () => {
    await render(<AuroraBackground />);

    expect(screen.toJSON()).not.toBeNull();
  });
});

describe('BrandGradientFill', () => {
  it('renders the brand gradient image', async () => {
    await render(<BrandGradientFill radius={12} />);

    expect(screen.toJSON()).not.toBeNull();
  });

  it('renders with the default radius when none is provided', async () => {
    await render(<BrandGradientFill />);

    expect(screen.toJSON()).not.toBeNull();
  });
});

describe('GlassCard', () => {
  it('renders content and applies the emphasized style', async () => {
    await render(
      <GlassCard emphasized>
        <Text>content</Text>
      </GlassCard>,
    );

    expect(screen.getByText('content')).toBeTruthy();
  });
});

describe('EmptyState', () => {
  it('renders the title, message and action', async () => {
    const onAction = jest.fn();

    await render(
      <EmptyState
        icon="bluetooth-off"
        title="No device connected"
        message="Connect your LED panel."
        actionLabel="Connect a device"
        onAction={onAction}
      />,
    );

    expect(screen.getByText('No device connected')).toBeTruthy();
    expect(screen.getByText('Connect your LED panel.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Connect a device'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders without an action when none is provided', async () => {
    await render(
      <EmptyState icon="tune-variant" title="Car number missing" message="Set your car number." />,
    );

    expect(screen.getByText('Car number missing')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('GradientText', () => {
  it('shows the gradient overlay once the text width is measured', async () => {
    await render(
      <GradientText style={{ fontSize: 24 }}>
        {'P1'}
      </GradientText>,
    );

    const measureText = screen.getByText('P1');
    await fireEvent(measureText, 'textLayout', {
      nativeEvent: { lines: [{ width: 120 }] },
    });

    expect(countOccurrences(screen.toJSON(), 'P1')).toBe(2);
  });

  it('keeps a single copy while the width is unknown', async () => {
    await render(<GradientText>{'P1'}</GradientText>);

    expect(screen.getAllByText('P1')).toHaveLength(1);
    expect(countOccurrences(screen.toJSON(), 'P1')).toBe(1);
  });

  it('hides the overlay again when no line width is reported', async () => {
    await render(<GradientText>{'P1'}</GradientText>);

    const measureText = screen.getByText('P1');
    await fireEvent(measureText, 'textLayout', {
      nativeEvent: { lines: [{ width: 120 }] },
    });
    expect(screen.getAllByText('P1')).toHaveLength(2);

    await fireEvent(measureText, 'textLayout', {
      nativeEvent: { lines: [] },
    });
    expect(screen.getAllByText('P1')).toHaveLength(1);
  });

  it('keeps the overlay size unchanged when the measured width is the same', async () => {
    await render(<GradientText style={{ fontSize: 24 }}>{'P1'}</GradientText>);

    const measureText = screen.getByText('P1');
    await fireEvent(measureText, 'textLayout', {
      nativeEvent: { lines: [{ width: 120 }] },
    });
    await fireEvent(measureText, 'textLayout', {
      nativeEvent: { lines: [{ width: 120 }] },
    });

    expect(screen.getAllByText('P1')).toHaveLength(2);
  });
});

describe('FloatingTabBar', () => {
  const state = {
    index: 0,
    routes: [
      { key: 'telemetry', name: 'telemetry' },
      { key: 'index', name: 'index' },
    ],
  };

  it('renders the tab labels and navigates on press', async () => {
    const navigation = { navigate: jest.fn() };

    await render(<FloatingTabBar state={state} navigation={navigation} />);

    expect(screen.getByText('Telemetry')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();

    await fireEvent.press(screen.getByText('Settings'));
    expect(navigation.navigate).toHaveBeenCalledWith('index');
  });

  it('uses the route name as a fallback label', async () => {
    const navigation = { navigate: jest.fn() };
    const unknownState = {
      index: 0,
      routes: [{ key: 'unknown', name: 'unknown' }],
    };

    await render(<FloatingTabBar state={unknownState} navigation={navigation} />);

    expect(screen.getByText('unknown')).toBeTruthy();
  });

  it('applies the bottom inset to the wrapper', async () => {
    const navigation = { navigate: jest.fn() };

    await render(
      <FloatingTabBar state={state} navigation={navigation} insets={{ bottom: 40 }} />,
    );

    expect(screen.getByText('Telemetry')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('navigates on press through the full press sequence', async () => {
    const navigation = { navigate: jest.fn() };
    const user = userEvent.setup();

    await render(<FloatingTabBar state={state} navigation={navigation} />);

    await user.press(screen.getByText('Settings'));

    expect(navigation.navigate).toHaveBeenCalledWith('index');
  });
});
