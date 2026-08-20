import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  RootState, 
  setCarNumber, 
  setManualDisplay, 
  setLargeText,
  setDisplayStyle,
  setDisplayText, 
  setLapDisplayMode,
  setAdditionalDisplayMode
} from '@/store/store';

export const useSettings = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);

  const updateDisplayText = useCallback((value: string) => {
    const onlyAllowedChars = value.replace(/[^a-zA-Z0-9,:# ?!]/g, '')
    if (settings.displayStyle === 'static') {
      const length = settings.largeText ? 11 : 13;
      dispatch(setDisplayText(onlyAllowedChars.slice(0, length)));
      return;
    }
    dispatch(setDisplayText(onlyAllowedChars));
  }, [dispatch, settings.displayStyle, settings.largeText]);

  useEffect(() => {
    updateDisplayText(settings.displayText);
  }, [settings.displayStyle, settings.largeText, updateDisplayText]);

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

  const updateDisplayStyle = useCallback((value: 'static' | 'slide') => {
    dispatch(setDisplayStyle(value));
  }, [dispatch]);

  const updateLapDisplayMode = useCallback((value: 'best' | 'last' | 'delta' | 'front' | 'back') => {
    dispatch(setLapDisplayMode(value));
  }, [dispatch]);

  const updateAdditionalDisplayMode = useCallback((value: 'position' | 'number' | 'opponent_number') => {
    dispatch(setAdditionalDisplayMode(value));
  }, [dispatch]);

  return {
    ...settings,
    updateCarNumber,
    updateManualDisplay,
    updateLargeText,
    updateDisplayStyle,
    updateDisplayText,
    updateLapDisplayMode,
    updateAdditionalDisplayMode,
  };
};
