import React, { useMemo } from 'react';
import { SettingsSection } from './SettingsSection';
import { SettingsSwitch } from './SettingsSwitch';
import { SettingsInput } from './SettingsInput';
import { SettingsNumberInput } from './SettingsNumberInput';
import { SettingsSegmentedControl } from './SettingsSegmentedControl';
import { useSettings } from '@/hooks/useSettings';


const STYLE_DISPLAY_OPTIONS: { label: string; value: 'static' | 'slide' }[] = [
  { label: 'Static', value: 'static' },
  { label: 'Slide', value: 'slide' },
];

const LAP_DISPLAY_OPTIONS: { label: string; value: 'best' | 'last' | 'delta' | 'front' | 'back' }[] = [
  { label: 'Best Lap', value: 'best' },
  { label: 'Last Lap', value: 'last' },
  { label: 'Delta Pole', value: 'delta' },
  { label: 'Front Gap', value: 'front' },
  { label: 'Back Gap', value: 'back' },

];

const ADDITIONAL_DISPLAY_OPTIONS: { label: string; value: 'position' | 'number' | 'opponent_number' }[] = [
  { label: 'Position', value: 'position' },
  { label: 'Car Number', value: 'number' },
  { label: 'Opponent Number', value: 'opponent_number' }
];

export const DisplayConfiguration: React.FC = React.memo(() => {
  const {
    manualDisplay,
    largeText,
    displayStyle,
    displayText,
    carNumber,
    lapDisplayMode,
    additionalDisplayMode,
    updateManualDisplay,
    updateLargeText,
    updateDisplayStyle,
    updateDisplayText,
    updateCarNumber,
    updateLapDisplayMode,
    updateAdditionalDisplayMode
  } = useSettings();

  const maxLength = largeText ? 11 : 13;

  const manualDisplayHint = useMemo(() => {
    if (displayStyle !== 'static') {
      return 'The text to display on the display';
    }

    return `The text to display on the display, up to ${maxLength} characters`;
  }, [displayStyle, maxLength]);

  return (
    <SettingsSection title="Display Configuration">
      <SettingsNumberInput
          label="Car Number"
          placeholder="123"
          value={carNumber}
          onChangeText={updateCarNumber}
          hint="The car number to track on the LED display"
      />

      <SettingsSwitch
        label="Manual display"
        hint="Manual display requires you to enter the text to send yourself"
        value={manualDisplay}
        onValueChange={updateManualDisplay}
      />

      <SettingsSwitch
        label="Large text"
        hint="Large text will be displayed in a larger font size on the LED display"
        value={largeText}
        onValueChange={updateLargeText}
      />

      {manualDisplay ? (
          <>
            <SettingsSegmentedControl
                label="Display Style"
                options={STYLE_DISPLAY_OPTIONS}
                selectedValue={displayStyle}
                onValueChange={updateDisplayStyle}
                hint="Choose the display style for the text"
            />

            <SettingsInput
                label="Display Text"
                placeholder="Enter text to display"
                value={displayText}
                onChangeText={updateDisplayText}
                hint={manualDisplayHint}
            />
          </>
        ) : (
        <>
          <SettingsSegmentedControl
            label="Lap Display"
            options={LAP_DISPLAY_OPTIONS}
            selectedValue={lapDisplayMode}
            onValueChange={updateLapDisplayMode}
            hint="Choose the lap information to display"
          />

          {['delta', 'front', 'back'].includes(lapDisplayMode) && !largeText && (
              <SettingsSegmentedControl
                  label="Additional Display"
                  options={ADDITIONAL_DISPLAY_OPTIONS}
                  selectedValue={additionalDisplayMode}
                  onValueChange={updateAdditionalDisplayMode}
                  hint="Choose the additional information to display"
              />
          )}
        </>
      )}
    </SettingsSection>
  );
});
