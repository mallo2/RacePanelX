import React from 'react';
import { describe, expect, it, jest } from '@jest/globals';
import { Text } from 'react-native';
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import { FormField } from '@/components/settings/FormField';
import { SettingsInput } from '@/components/settings/SettingsInput';
import { SettingsNumberInput } from '@/components/settings/SettingsNumberInput';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SettingsSegmentedControl } from '@/components/settings/SettingsSegmentedControl';
import { SettingsSwitch } from '@/components/settings/SettingsSwitch';
import {PickerControl} from "@/components/ui/picker/PickerControl";
import {PickerOptionRow} from "@/components/ui/picker/PickerOptionRow";
import {ItemSeparator} from "@/components/ui/picker/ItemSeparator";
import {SettingsPicker} from "@/components/settings/SettingsPicker";

jest.mock('@/components/ui/BrandGradientFill', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    BrandGradientFill: (props: Record<string, unknown>) =>
      React.createElement(View, { ...props, testID: 'brand-gradient' }),
  };
});

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    BlurView: (props: Record<string, unknown>) =>
        React.createElement(View, { ...props, testID: 'blur-view' }),
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

describe('PickerControl', () => {
  it('renders the label, hint and selected value', async () => {
    await render(
        <PickerControl
            label="Mode"
            hint="Choose a display mode"
            valueLabel="Static"
            onPress={jest.fn()}
        />,
    );

    expect(screen.getByText('Mode')).toBeTruthy();
    expect(screen.getByText('Choose a display mode')).toBeTruthy();
    expect(screen.getByText('Static')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();

    await render(
        <PickerControl valueLabel="Static" onPress={onPress} />,
    );

    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('sets the accessibility value to the selected label', async () => {
    await render(
        <PickerControl valueLabel="Slide" onPress={jest.fn()} />,
    );

    expect(screen.getByRole('button').props.accessibilityValue).toEqual({ text: 'Slide' });
  });
});

describe('PickerOptionRow', () => {
  it('renders the option label and the check icon when active', async () => {
    await render(
        <PickerOptionRow
            label="Static"
            isActive
            isFirst
            isLast
            onPress={jest.fn()}
        />,
    );

    expect(screen.getByText('Static')).toBeTruthy();
    expect(screen.getByRole('menuitem').props.accessibilityState).toEqual({ selected: true });
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();

    await render(
        <PickerOptionRow
            label="Slide"
            isActive={false}
            isFirst={false}
            isLast={false}
            onPress={onPress}
        />,
    );

    await fireEvent.press(screen.getByRole('menuitem'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('marks the item as not selected when inactive', async () => {
    await render(
        <PickerOptionRow
            label="Slide"
            isActive={false}
            isFirst={false}
            isLast={false}
            onPress={jest.fn()}
        />,
    );

    expect(screen.getByRole('menuitem').props.accessibilityState).toEqual({ selected: false });
  });
});

describe('ItemSeparator', () => {
  it('renders a separator view', async () => {
    await render(<ItemSeparator />);

    expect(screen.toJSON()).not.toBeNull();
  });
});

describe('SettingsPicker', () => {
  const options = [
    { label: 'Static', value: 'static' },
    { label: 'Slide', value: 'slide' },
    { label: 'Marquee', value: 'marquee' },
  ];

  it('renders the control with the selected option label', async () => {
    await render(
        <SettingsPicker
            label="Style"
            hint="Pick a display mode"
            options={options}
            selectedValue="slide"
            onValueChange={jest.fn()}
        />,
    );

    expect(screen.getByText('Style')).toBeTruthy();
    expect(screen.getByText('Pick a display mode')).toBeTruthy();
    expect(screen.getByText('Slide')).toBeTruthy();
  });

  it('opens the modal and shows the options when the control is pressed', async () => {
    await render(
        <SettingsPicker
            label="Style"
            options={options}
            selectedValue="static"
            onValueChange={jest.fn()}
        />,
    );

    await fireEvent.press(screen.getByRole('button'));

    expect(screen.getByTestId('blur-view')).toBeTruthy();

    // Le texte "Static" existe au moins 2 fois: dans le contrôle + dans la liste
    expect(screen.getAllByText('Static').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Slide').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Marquee').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onValueChange and closes when an option is selected', async () => {
    const onValueChange = jest.fn();

    await render(
        <SettingsPicker
            label="Style"
            options={options}
            selectedValue="static"
            onValueChange={onValueChange}
        />,
    );

    await fireEvent.press(screen.getByRole('button'));
    await fireEvent.press(screen.getByText('Marquee'));

    expect(onValueChange).toHaveBeenCalledWith('marquee');

    await waitFor(() => {
      expect(screen.queryByTestId('blur-view')).toBeNull();
    });
  });

  it('highlights the active option in the list', async () => {
    await render(
        <SettingsPicker
            label="Style"
            options={options}
            selectedValue="slide"
            onValueChange={jest.fn()}
        />,
    );

    await fireEvent.press(screen.getByRole('button'));

    // Dans la liste, il y a une occurrence de "Slide" active; on vérifie qu'elle est bien présente.
    expect(screen.getAllByText('Slide').length).toBeGreaterThanOrEqual(2);
  });
});
