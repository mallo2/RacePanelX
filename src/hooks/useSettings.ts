import {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  RootState,
  setAdditionalDisplayMode,
  setCarNumber,
  setDisplayStyle,
  setDisplayText,
  setLapDisplayMode,
  setLargeText,
  setManualDisplay
} from '@/store/store';
import {DisplayStyle} from "@/models/settings/displayStyle";
import {LapDisplayMode} from "@/models/settings/lapDisplayMode";
import {AdditionalDisplayMode} from "@/models/settings/additionalDisplayMode";
import {formatDisplayText, LAP_MODES_WITH_OPPONENT} from "@/utils/displayTextBuilder";

export const useSettings = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const [localText, setLocalText] = useState(settings.displayText);

  useEffect(() => {
    setLocalText(settings.displayText);
  }, [settings.displayText]);

  const handleChangeText = useCallback((value: string) => {
    setLocalText(formatDisplayText(value, settings.displayStyle, settings.largeText));
  }, [settings.displayStyle, settings.largeText]);

  const handleEndEditing = useCallback(() => {
    dispatch(setDisplayText(localText));
  }, [dispatch, localText]);

  const updateCarNumber = useCallback((value: string) => {
    const onlyNumbers = value.replace(/\D/g, '').slice(0, 3);
    dispatch(setCarNumber(onlyNumbers));
  }, [dispatch]);

  const updateManualDisplay = useCallback((value: boolean) => {
    dispatch(setManualDisplay(value));
  }, [dispatch]);

  const updateLargeText = useCallback((value: boolean) => {
    dispatch(setLargeText(value));
  }, [dispatch]);

  const updateDisplayStyle = useCallback((value: DisplayStyle) => {
    dispatch(setDisplayStyle(value));
  }, [dispatch]);

  const updateLapDisplayMode = useCallback((value: LapDisplayMode) => {
    if (!(value in LAP_MODES_WITH_OPPONENT)) {
      dispatch(setAdditionalDisplayMode(AdditionalDisplayMode.number));
    }
    dispatch(setLapDisplayMode(value));
  }, [dispatch]);

  const updateAdditionalDisplayMode = useCallback((value: AdditionalDisplayMode) => {
    dispatch(setAdditionalDisplayMode(value));
  }, [dispatch]);

  return {
    ...settings,
    localText,
    updateCarNumber,
    updateManualDisplay,
    updateLargeText,
    updateDisplayStyle,
    handleChangeText,
    handleEndEditing,
    updateLapDisplayMode,
    updateAdditionalDisplayMode,
  };
};
