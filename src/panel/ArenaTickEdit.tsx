import { Divider, Field } from '@fluentui/react-components';
import {
    bundleIcon,
    CircleFilled,
    CircleRegular,
    SquareFilled,
    SquareHintFilled,
    SquareHintRegular,
    SquareRegular,
} from '@fluentui/react-icons';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_RADIAL_TICKS, DEFAULT_RECT_TICKS, NO_TICKS, Ticks, TickType } from '../scene';
import { useScene } from '../SceneProvider';
import { Segment, SegmentedGroup } from '../Segmented';
import { SpinButton } from '../SpinButton';
import { SpinButtonUnits } from '../SpinButtonUnits';
import { useControlStyles } from '../useControlStyles';

const SquareHintIcon = bundleIcon(SquareHintFilled, SquareHintRegular);
const CircleIcon = bundleIcon(CircleFilled, CircleRegular);
const SquareIcon = bundleIcon(SquareFilled, SquareRegular);

export const ArenaTickEdit: React.FC = () => {
    const classes = useControlStyles();
    const { scene, dispatch } = useScene();
    const ticks = scene.arena.ticks;

    const setTicks = useCallback(
        (ticks: Ticks) => {
            dispatch({ type: 'arenaTicks', value: ticks });
        },
        [dispatch],
    );

    const onTypeChange = useCallback(
        (option?: TickType) => {
            switch (option) {
                case TickType.None:
                    setTicks(NO_TICKS);
                    break;

                case TickType.Radial:
                    setTicks(DEFAULT_RADIAL_TICKS);
                    break;

                case TickType.Rectangular:
                    setTicks(DEFAULT_RECT_TICKS);
                    break;
            }
        },
        [setTicks],
    );
    const { t } = useTranslation();

    return (
        <div className={classes.column}>
            <Field label={t('ArenaTickEdit.BorderTicks')}>
                <SegmentedGroup
                    name="arena-ticks"
                    value={ticks?.type ?? TickType.None}
                    onChange={(ev, data) => onTypeChange(data.value as TickType)}
                >
                    <Segment value={TickType.None} icon={<SquareHintIcon />} title={t('ArenaTickEdit.None')} />
                    <Segment value={TickType.Radial} icon={<CircleIcon />} title={t('ArenaTickEdit.Circle')} />
                    <Segment value={TickType.Rectangular} icon={<SquareIcon />} title={t('ArenaTickEdit.Rectangle')} />
                </SegmentedGroup>
            </Field>
            {ticks?.type === TickType.Radial && (
                <>
                    <div className={classes.row}>
                        <Field label={t('ArenaTickEdit.MajorTicks')}>
                            <SpinButton
                                min={0}
                                max={90}
                                step={1}
                                value={ticks.majorCount}
                                onChange={(ev, data) => {
                                    if (typeof data.value === 'number') {
                                        setTicks({ ...ticks, majorCount: data.value });
                                    }
                                }}
                            />
                        </Field>
                        <Field label={t('ArenaTickEdit.MajorRotation')}>
                            <SpinButtonUnits
                                min={-180}
                                max={180}
                                step={5}
                                fractionDigits={1}
                                suffix="°"
                                value={ticks.majorStart}
                                onChange={(ev, data) => {
                                    if (typeof data.value === 'number') {
                                        setTicks({ ...ticks, majorStart: data.value });
                                    }
                                }}
                            />
                        </Field>
                    </div>
                    <div className={classes.row}>
                        <Field label={t('ArenaTickEdit.MinorTicks')}>
                            <SpinButton
                                min={0}
                                max={180}
                                step={1}
                                value={ticks.minorCount}
                                onChange={(ev, data) => {
                                    if (typeof data.value === 'number') {
                                        setTicks({ ...ticks, minorCount: data.value });
                                    }
                                }}
                            />
                        </Field>
                        <Field label={t('ArenaTickEdit.MinorRotation')}>
                            <SpinButtonUnits
                                min={-180}
                                max={180}
                                step={5}
                                fractionDigits={1}
                                suffix="°"
                                value={ticks.minorStart}
                                onChange={(ev, data) => {
                                    if (typeof data.value === 'number') {
                                        setTicks({ ...ticks, minorStart: data.value });
                                    }
                                }}
                            />
                        </Field>
                    </div>
                </>
            )}
            {ticks?.type === TickType.Rectangular && (
                <>
                    <div className={classes.row}>
                        <Field label={t('ArenaTickEdit.Columns')}>
                            <SpinButton
                                min={1}
                                max={100}
                                step={1}
                                value={ticks.columns}
                                onChange={(ev, data) => {
                                    if (data.value) {
                                        setTicks({ ...ticks, columns: data.value });
                                    }
                                }}
                            />
                        </Field>
                        <Field label={t('ArenaTickEdit.Rows')}>
                            <SpinButton
                                min={1}
                                max={100}
                                step={1}
                                value={ticks.rows}
                                onChange={(ev, data) => {
                                    if (data.value) {
                                        setTicks({ ...ticks, rows: data.value });
                                    }
                                }}
                            />
                        </Field>
                    </div>
                </>
            )}
            {ticks && ticks.type !== TickType.None && <Divider />}
        </div>
    );
};
