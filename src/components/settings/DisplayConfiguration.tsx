import React, {useMemo} from 'react';
import {SettingsSection} from './SettingsSection';
import {SettingsSwitch} from './SettingsSwitch';
import {SettingsInput} from './SettingsInput';
import {SettingsNumberInput} from './SettingsNumberInput';
import {SettingsSegmentedControl} from './SettingsSegmentedControl';
import {useSettings} from '@/hooks/useSettings';
import {DisplayStyle} from "@/models/settings/displayStyle";
import {LapDisplayMode} from "@/models/settings/lapDisplayMode";
import {AdditionalDisplayMode} from "@/models/settings/additionalDisplayMode";
import {getAdditionalDisplayModes} from "@/utils/displayTextBuilder";


const STYLE_DISPLAY_OPTIONS: { label: string; value: DisplayStyle }[] = [
  { label: 'Static', value: DisplayStyle.static },
  { label: 'Slide', value: DisplayStyle.slide },
];

const LAP_DISPLAY_OPTIONS: { label: string; value: LapDisplayMode }[] = [
  { label: 'Best Lap', value: LapDisplayMode.best },
  { label: 'Last Lap', value: LapDisplayMode.last },
  { label: 'Delta Pole', value: LapDisplayMode.delta },
  { label: 'Front Gap', value: LapDisplayMode.front },
  { label: 'Back Gap', value: LapDisplayMode.back },

];

export const DisplayConfiguration: React.FC = React.memo(() => {
  const {
    localText,
    manualDisplay,
    largeText,
    displayStyle,
    carNumber,
    lapDisplayMode,
    additionalDisplayMode,
    updateManualDisplay,
    updateLargeText,
    updateDisplayStyle,
    handleChangeText,
    handleEndEditing,
    updateCarNumber,
    updateLapDisplayMode,
    updateAdditionalDisplayMode
  } = useSettings();

  const maxLength = largeText ? 8 : 13;

  const manualDisplayHint = useMemo(() => {
    if (displayStyle !== DisplayStyle.static) {
      return 'The text to display on the display';
    }

    return `The text to display on the display, up to ${maxLength} characters`;
  }, [displayStyle, maxLength]);

  const additionalDisplayOptions = useMemo(
      () =>
          getAdditionalDisplayModes(lapDisplayMode).map(value => {
            let label: string;

            switch (value) {
              case AdditionalDisplayMode.position:
                label = 'Position';
                break;

              case AdditionalDisplayMode.number:
                label = 'Car Number';
                break;

              case AdditionalDisplayMode.opponent_number:
                label = 'Opponent Number';
                break;
            }

            return {label, value};
          }),
      [lapDisplayMode],
  );

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
                value={localText}
                onChangeText={handleChangeText}
                onEndEditing={handleEndEditing}
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

          {!largeText && (
              <SettingsSegmentedControl
                  label="Additional Display"
                  options={additionalDisplayOptions}
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
