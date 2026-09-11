import React from 'react';
import { describe, expect, it, jest } from '@jest/globals';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { FormField } from '@/components/settings/FormField';
import { SettingsInput } from '@/components/settings/SettingsInput';
import { SettingsNumberInput } from '@/components/settings/SettingsNumberInput';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsSegmentedControl } from '@/components/settings/SettingsSegmentedControl';
import { SettingsSwitch } from '@/components/settings/SettingsSwitch';

jest.mock('@/components/ui/BrandGradientFill', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    BrandGradientFill: (props: Record<string, unknown>) =>
      React.createElement(View, { ...props, testID: 'brand-gradient' }),
  };
});

describe('FormField', () => {
  it('renders the label, the hint and its children', async () => {
    await render(
      <FormField label="Car number" hint="The car being tracked">
        <Text>child</Text>
      </FormField>,
    );

    expect(screen.getByText('Car number')).toBeTruthy();
    expect(screen.getByText('The car being tracked')).toBeTruthy();
    expect(screen.getByText('child')).toBeTruthy();
  });

  it('renders without a label or hint', async () => {
    await render(
      <FormField>
        <Text>content</Text>
      </FormField>,
    );

    expect(screen.getByText('content')).toBeTruthy();
  });

  it('omits the hint when it is empty', async () => {
    await render(
      <FormField label="Car number" hint="">
        <Text>child</Text>
      </FormField>,
    );

    expect(screen.queryByText('')).toBeNull();
  });
});

describe('SettingsInput', () => {
  it('renders the label, hint, value and placeholder', async () => {
    await render(
      <SettingsInput
        label="API URL"
        hint="Base URL of the API"
        value="https://api.example.com"
        onChangeText={jest.fn()}
        onEndEditing={jest.fn()}
        placeholder="Type a URL"
      />,
    );

    expect(screen.getByText('API URL')).toBeTruthy();
    expect(screen.getByText('Base URL of the API')).toBeTruthy();
    expect(screen.getByDisplayValue('https://api.example.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('Type a URL')).toBeTruthy();
  });

  it('forwards text changes and end-editing events', async () => {
    const onChangeText = jest.fn();
    const onEndEditing = jest.fn();

    await render(
      <SettingsInput
        label="Car number"
        value=""
        onChangeText={onChangeText}
        onEndEditing={onEndEditing}
        placeholder="Type a number"
      />,
    );

    const input = screen.getByPlaceholderText('Type a number');
    await fireEvent.changeText(input, '42');
    await fireEvent(input, 'endEditing');

    expect(onChangeText).toHaveBeenCalledWith('42');
    expect(onEndEditing).toHaveBeenCalledTimes(1);
  });

  it('renders the hint after the children', async () => {
    await render(
      <SettingsInput
        label="Car number"
        hint="The car being tracked"
        value="7"
        onChangeText={jest.fn()}
        onEndEditing={jest.fn()}
      />,
    );

    expect(screen.getByText('The car being tracked')).toBeTruthy();
  });
});

describe('SettingsNumberInput', () => {
  it('sanitizes non-digit input before forwarding it', async () => {
    const onChangeText = jest.fn();

    await render(
      <SettingsNumberInput label="Interval" value="" onChangeText={onChangeText} />,
    );

    const input = screen.getByPlaceholderText('0');
    await fireEvent.changeText(input, '12a3');
    expect(onChangeText).toHaveBeenCalledWith('123');
  });

  it('blocks values above the configured maximum', async () => {
    const onChangeText = jest.fn();

    await render(
      <SettingsNumberInput label="Interval" value="" max={12} onChangeText={onChangeText} />,
    );

    const input = screen.getByPlaceholderText('0');
    await fireEvent.changeText(input, '99');
    expect(onChangeText).not.toHaveBeenCalled();

    await fireEvent.changeText(input, '5');
    expect(onChangeText).toHaveBeenCalledWith('5');
  });

  it('allows clearing the field', async () => {
    const onChangeText = jest.fn();

    await render(
      <SettingsNumberInput label="Interval" value="" onChangeText={onChangeText} />,
    );

    await fireEvent.changeText(screen.getByPlaceholderText('0'), '');
    expect(onChangeText).toHaveBeenCalledWith('');
  });

  it('configures the input with a maximum length of three digits', async () => {
    const onChangeText = jest.fn();

    await render(
      <SettingsNumberInput label="Interval" value="" onChangeText={onChangeText} />,
    );

    expect(screen.getByPlaceholderText('0').props.maxLength).toBe(3);
  });
});

describe('SettingsSwitch', () => {
  it('renders the label and hint and reports toggles', async () => {
    const onValueChange = jest.fn();

    await render(
      <SettingsSwitch
        label="Manual display"
        hint="Send your own text"
        value={false}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByText('Manual display')).toBeTruthy();
    expect(screen.getByText('Send your own text')).toBeTruthy();

    await fireEvent(screen.getByRole('switch'), 'valueChange', true);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('toggles value when pressing the container', async () => {
    const onValueChange = jest.fn();

    await render(
      <SettingsSwitch
        label="Manual display"
        value={false}
        onValueChange={onValueChange}
      />,
    );

    await fireEvent.press(screen.getByLabelText('Manual display'));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('reflects the current switch value', async () => {
    const onValueChange = jest.fn();

    await render(
      <SettingsSwitch label="Manual display" value onValueChange={onValueChange} />,
    );

    const switchElement = screen.getByRole('switch');
    expect(switchElement.props.value).toBe(true);
  });
});

describe('SettingsSection', () => {
  it('renders the title and its content', async () => {
    await render(
      <SettingsSection title="Display configuration">
        <SettingsInput
          label="Car number"
          value="7"
          onChangeText={jest.fn()}
          onEndEditing={jest.fn()}
        />
      </SettingsSection>,
    );

    expect(screen.getByText('Display configuration')).toBeTruthy();
    expect(screen.getByText('Car number')).toBeTruthy();
    expect(screen.getByDisplayValue('7')).toBeTruthy();
  });

  it('renders an extra element on the right of the title', async () => {
    await render(
      <SettingsSection
        title="Display configuration"
        rightElement={<Text>extra</Text>}
      >
        <Text>content</Text>
      </SettingsSection>,
    );

    expect(screen.getByText('extra')).toBeTruthy();
    expect(screen.getByText('content')).toBeTruthy();
  });
});

describe('SettingsSegmentedControl', () => {
  const options = [
    { label: 'Static', value: 'static' },
    { label: 'Slide', value: 'slide' },
  ];

  it('renders the options and the selected one is highlighted', async () => {
    await render(
      <SettingsSegmentedControl
        label="Style"
        hint="Pick a display style"
        options={options}
        selectedValue="static"
        onValueChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Style')).toBeTruthy();
    expect(screen.getByText('Pick a display style')).toBeTruthy();
    expect(screen.getByText('Static')).toBeTruthy();
    expect(screen.getByText('Slide')).toBeTruthy();
    expect(screen.getAllByTestId('brand-gradient')).toHaveLength(1);
  });

  it('reports the newly selected value on press', async () => {
    const onValueChange = jest.fn();

    await render(
      <SettingsSegmentedControl
        options={options}
        selectedValue="static"
        onValueChange={onValueChange}
      />,
    );

    await fireEvent.press(screen.getByText('Slide'));
    expect(onValueChange).toHaveBeenCalledWith('slide');
  });

  it('does not highlight any option when the selected value is unknown', async () => {
    await render(
      <SettingsSegmentedControl
        options={options}
        selectedValue={'marquee'}
        onValueChange={jest.fn()}
      />,
    );

    expect(screen.queryAllByTestId('brand-gradient')).toHaveLength(0);
  });
});
