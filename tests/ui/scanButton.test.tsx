import React from 'react';
import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import ScanButton from '@/components/ble/ScanButton';

describe('ScanButton', () => {
  it('renders the idle label and triggers the scan', async () => {
    const onPress = jest.fn();

    await render(<ScanButton isScanning={false} onPress={onPress} />);

    expect(screen.getByText('Scan')).toBeTruthy();
    await fireEvent.press(screen.getByText('Scan'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders the scanning label while a scan is running', async () => {
    const onPress = jest.fn();

    await render(<ScanButton isScanning onPress={onPress} />);

    expect(screen.getByText('Scanning…')).toBeTruthy();
    expect(screen.queryByText('Scan')).toBeNull();
  });

  it('disables the button while a scan is running', async () => {
    const onPress = jest.fn();

    await render(<ScanButton isScanning onPress={onPress} />);

    await fireEvent.press(screen.getByText('Scanning…'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
