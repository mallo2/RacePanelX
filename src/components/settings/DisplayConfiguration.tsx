import React, {useMemo} from 'react';
import {SettingsSection} from './SettingsSection';
import {SettingsSwitch} from './SettingsSwitch';
import {SettingsInput} from './SettingsInput';
import {SettingsNumberInput} from './SettingsNumberInput';
import {SettingsSegmentedControl} from './SettingsSegmentedControl';
import {useSettings} from '@/hooks/useSettings';
import {DisplayStyle} from "@/types/settings/displayStyle";
import {LapDisplayMode} from "@/types/settings/lapDisplayMode";
import {AdditionalDisplayMode} from "@/types/settings/additionalDisplayMode";
import {getAdditionalDisplayModes} from "@/utils/displayTextBuilder";
import {formatMessage, messages} from '@/i18n/messages';


const STYLE_DISPLAY_OPTIONS: { label: string; value: DisplayStyle }[] = [
  { label: messages.settings.styleStatic, value: DisplayStyle.static },
  { label: messages.settings.styleSlide, value: DisplayStyle.slide },
];

const LAP_DISPLAY_OPTIONS: { label: string; value: LapDisplayMode }[] = [
  { label: messages.settings.lapBest, value: LapDisplayMode.best },
  { label: messages.settings.lapLast, value: LapDisplayMode.last },
  { label: messages.settings.lapDelta, value: LapDisplayMode.delta },
  { label: messages.settings.lapFront, value: LapDisplayMode.front },
  { label: messages.settings.lapBack, value: LapDisplayMode.back },
];

export const DisplayConfiguration: React.FC = React.memo(function DisplayConfiguration() {
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
      return messages.settings.manualHintScroll;
    }

    return formatMessage(messages.settings.manualHintText, {max: maxLength});
  }, [displayStyle, maxLength]);

  const additionalDisplayOptions = useMemo(
      () =>
          getAdditionalDisplayModes(lapDisplayMode).map(value => {
            let label: string;

            switch (value) {
              case AdditionalDisplayMode.position:
                label = messages.settings.position;
                break;

              case AdditionalDisplayMode.number:
                label = messages.settings.carNumber;
                break;

              case AdditionalDisplayMode.opponent_number:
                label = messages.settings.opponentNumber;
                break;
            }

            return {label, value};
          }),
      [lapDisplayMode],
  );

  return (
    <SettingsSection title={messages.settings.displayConfiguration}>
      <SettingsNumberInput
          label={messages.settings.carNumber}
          placeholder="123"
          value={carNumber}
          onChangeText={updateCarNumber}
          hint={messages.settings.carNumberHint}
      />

      <SettingsSwitch
        label={messages.settings.manualDisplay}
        hint={messages.settings.manualDisplayHint}
        value={manualDisplay}
        onValueChange={updateManualDisplay}
      />

      <SettingsSwitch
        label={messages.settings.largeText}
        hint={messages.settings.largeTextHint}
        value={largeText}
        onValueChange={updateLargeText}
      />

      {manualDisplay ? (
          <>
            <SettingsSegmentedControl
                label={messages.settings.displayStyle}
                options={STYLE_DISPLAY_OPTIONS}
                selectedValue={displayStyle}
                onValueChange={updateDisplayStyle}
                hint={messages.settings.displayStyleHint}
            />

            <SettingsInput
                label={messages.settings.displayText}
                placeholder={messages.settings.displayTextPlaceholder}
                value={localText}
                onChangeText={handleChangeText}
                onEndEditing={handleEndEditing}
                hint={manualDisplayHint}
            />
          </>
        ) : (
        <>
          <SettingsSegmentedControl
            label={messages.settings.lapDisplay}
            options={LAP_DISPLAY_OPTIONS}
            selectedValue={lapDisplayMode}
            onValueChange={updateLapDisplayMode}
            hint={messages.settings.lapDisplayHint}
          />

          {!largeText && (
              <SettingsSegmentedControl
                  label={messages.settings.additionalDisplay}
                  options={additionalDisplayOptions}
                  selectedValue={additionalDisplayMode}
                  onValueChange={updateAdditionalDisplayMode}
                  hint={messages.settings.additionalDisplayHint}
              />
          )}
        </>
      )}
    </SettingsSection>
  );
});
