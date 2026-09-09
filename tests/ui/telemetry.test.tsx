import React from 'react';
import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { GapsInfo } from '@/components/telemetry/GapsInfo';
import { LapTimes } from '@/components/telemetry/LapTimes';
import { RaceInfo } from '@/components/telemetry/RaceInfo';
import StatusIndicator from '@/components/telemetry/StatusIndicator';
import TelemetryCard from '@/components/telemetry/TelemetryCard';

describe('TelemetryCard', () => {
  it('renders the provided value', async () => {
    await render(<TelemetryCard label="Speed" value={123} />);

    expect(screen.getByText('Speed')).toBeTruthy();
    expect(screen.getByText('123')).toBeTruthy();
  });

  it('renders a placeholder when the value is null', async () => {
    await render(<TelemetryCard label="Speed" value={null} />);

    expect(screen.getByText('--')).toBeTruthy();
  });

  it('renders a large value with the gradient style', async () => {
    await render(<TelemetryCard label="Position" value="P1" isLarge />);

    expect(screen.getByText('P1')).toBeTruthy();
  });
});

describe('RaceInfo', () => {
  it('shows the car number and the formatted position', async () => {
    await render(<RaceInfo carNumber="12" position={3} />);

    expect(screen.getByText('Number')).toBeTruthy();
    expect(screen.getByText('Position')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('P3')).toBeTruthy();
  });

  it('shows a placeholder when the position is unknown', async () => {
    await render(<RaceInfo carNumber="12" position={null} />);

    expect(screen.getByText('--')).toBeTruthy();
    expect(screen.queryByText('P0')).toBeNull();
  });

  it('keeps the car number readable when the position is set', async () => {
    await render(<RaceInfo carNumber="0" position={0} />);

    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('P0')).toBeTruthy();
  });
});

describe('LapTimes', () => {
  it('formats the best and last lap times', async () => {
    await render(<LapTimes bestLapTime={128_831} lastLapTime={134_914} />);

    expect(screen.getByText('Best lap')).toBeTruthy();
    expect(screen.getByText('Last lap')).toBeTruthy();
    expect(screen.getByText('2:08:83')).toBeTruthy();
    expect(screen.getByText('2:14:91')).toBeTruthy();
  });

  it('shows placeholders when lap times are missing', async () => {
    await render(<LapTimes bestLapTime={null} lastLapTime={null} />);

    expect(screen.getAllByText('--:--')).toHaveLength(2);
  });

  it('formats sub-second lap times', async () => {
    await render(<LapTimes bestLapTime={999} lastLapTime={10} />);

    expect(screen.getByText('0:00:99')).toBeTruthy();
    expect(screen.getByText('0:00:01')).toBeTruthy();
  });
});

describe('GapsInfo', () => {
  const gaps = {
    deltaToLeader: { carNumber: '1', ms: 78_217, laps: 0 },
    gapAhead: { carNumber: '22', ms: 8_145, laps: 0 },
    gapBehind: { carNumber: '33', ms: 10_094, laps: 0 },
  };

  it('renders the three gaps with their opponent numbers', async () => {
    await render(<GapsInfo {...gaps} />);

    expect(screen.getByText('Delta to pole (#1)')).toBeTruthy();
    expect(screen.getByText('+1:18:21')).toBeTruthy();
    expect(screen.getByText('Gap ahead (#22)')).toBeTruthy();
    expect(screen.getByText('+0:08:14')).toBeTruthy();
    expect(screen.getByText('Gap behind (#33)')).toBeTruthy();
    expect(screen.getByText('-0:10:09')).toBeTruthy();
  });

  it('uses dashes for missing opponents and laps for lap gaps', async () => {
    await render(
      <GapsInfo
        deltaToLeader={{ carNumber: null, ms: 5_000, laps: 2 }}
        gapAhead={null}
        gapBehind={null}
      />,
    );

    expect(screen.getByText('Delta to pole (#-)')).toBeTruthy();
    expect(screen.getByText('+2 LAPS')).toBeTruthy();
    expect(screen.getByText('Gap ahead (#-)')).toBeTruthy();
    expect(screen.getByText('+--:--')).toBeTruthy();
    expect(screen.getByText('Gap behind (#-)')).toBeTruthy();
    expect(screen.getByText('---:--')).toBeTruthy();
  });

  it('formats a single-lap gap without pluralizing', async () => {
    await render(
      <GapsInfo
        deltaToLeader={{ carNumber: '7', ms: 0, laps: 1 }}
        gapAhead={null}
        gapBehind={null}
      />,
    );

    expect(screen.getByText('+1 LAP')).toBeTruthy();
  });

  it('formats a full lap time with a plus sign', async () => {
    await render(
      <GapsInfo
        deltaToLeader={{ carNumber: '7', ms: 3_600_000, laps: 0 }}
        gapAhead={null}
        gapBehind={null}
      />,
    );

    expect(screen.getByText('+60:00:00')).toBeTruthy();
  });
});

describe('StatusIndicator', () => {
  it('renders nothing when idle and without an error', async () => {
    await render(<StatusIndicator isUpdating={false} />);

    expect(screen.toJSON()).toBeNull();
  });

  it('shows the syncing state while updating', async () => {
    await render(<StatusIndicator isUpdating />);

    expect(screen.getByText('Syncing…')).toBeTruthy();
  });

  it('shows the error instead of the syncing state', async () => {
    await render(<StatusIndicator isUpdating error="API unreachable" />);

    expect(screen.getByText('API unreachable')).toBeTruthy();
    expect(screen.queryByText('Syncing…')).toBeNull();
  });

  it('renders nothing when idle with an empty error', async () => {
    await render(<StatusIndicator isUpdating={false} error="" />);

    expect(screen.toJSON()).toBeNull();
  });
});
